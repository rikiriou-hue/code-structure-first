import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCouple } from "./useCouple";

export interface GameScore {
  user_id: string;
  display_name: string;
  game_type: string;
  wins: number;
  losses: number;
  draws: number;
  total_points: number;
}

export interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  total_points: number;
  wins: number;
  losses: number;
  draws: number;
}

export function useGameScores(gameType?: string) {
  const { coupleId, userId, loading: coupleLoading } = useCouple();
  const [scores, setScores] = useState<GameScore[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScores = useCallback(async () => {
    if (!coupleId) return;

    let query = supabase
      .from("game_scores")
      .select("*")
      .eq("couple_id", coupleId);

    if (gameType) {
      query = query.eq("game_type", gameType);
    }

    const { data: scoreData } = await query;

    if (!scoreData) { setLoading(false); return; }

    // Fetch profiles for display names
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .eq("couple_id", coupleId);

    const nameMap: Record<string, string> = {};
    profiles?.forEach((p) => {
      nameMap[p.user_id] = p.display_name || "Anonim";
    });

    const enriched: GameScore[] = scoreData.map((s) => ({
      user_id: s.user_id,
      display_name: nameMap[s.user_id] || "Anonim",
      game_type: s.game_type,
      wins: s.wins,
      losses: s.losses,
      draws: s.draws,
      total_points: s.total_points,
    }));

    setScores(enriched);

    // Build leaderboard (aggregate all game types)
    const aggMap: Record<string, LeaderboardEntry> = {};
    const allScoresQuery = supabase
      .from("game_scores")
      .select("*")
      .eq("couple_id", coupleId);

    const { data: allScores } = await allScoresQuery;

    allScores?.forEach((s) => {
      if (!aggMap[s.user_id]) {
        aggMap[s.user_id] = {
          user_id: s.user_id,
          display_name: nameMap[s.user_id] || "Anonim",
          total_points: 0,
          wins: 0,
          losses: 0,
          draws: 0,
        };
      }
      aggMap[s.user_id].total_points += s.total_points;
      aggMap[s.user_id].wins += s.wins;
      aggMap[s.user_id].losses += s.losses;
      aggMap[s.user_id].draws += s.draws;
    });

    setLeaderboard(
      Object.values(aggMap).sort((a, b) => b.total_points - a.total_points)
    );

    setLoading(false);
  }, [coupleId, gameType]);

  useEffect(() => {
    if (!coupleLoading && coupleId) fetchScores();
  }, [coupleLoading, coupleId, fetchScores]);

  const addScore = useCallback(
    async (type: string, result: "win" | "loss" | "draw") => {
      if (!coupleId || !userId) return;

      const points = result === "win" ? 3 : result === "draw" ? 1 : 0;

      // Upsert score
      const { data: existing } = await supabase
        .from("game_scores")
        .select("*")
        .eq("couple_id", coupleId)
        .eq("user_id", userId)
        .eq("game_type", type)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("game_scores")
          .update({
            wins: existing.wins + (result === "win" ? 1 : 0),
            losses: existing.losses + (result === "loss" ? 1 : 0),
            draws: existing.draws + (result === "draw" ? 1 : 0),
            total_points: existing.total_points + points,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("game_scores").insert({
          couple_id: coupleId,
          user_id: userId,
          game_type: type,
          wins: result === "win" ? 1 : 0,
          losses: result === "loss" ? 1 : 0,
          draws: result === "draw" ? 1 : 0,
          total_points: points,
        });
      }

      fetchScores();
    },
    [coupleId, userId, fetchScores]
  );

  return { scores, leaderboard, loading: loading || coupleLoading, addScore, refetch: fetchScores };
}
