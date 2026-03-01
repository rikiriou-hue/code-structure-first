import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCouple } from "./useCouple";
import { toast } from "sonner";

export function useGameSession(gameType: string) {
  const { coupleId, userId, myName, partnerName, loading: coupleLoading } = useCouple();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [question, setQuestion] = useState<string | null>(null);
  const [optionA, setOptionA] = useState<string | null>(null);
  const [optionB, setOptionB] = useState<string | null>(null);
  const [myAnswer, setMyAnswer] = useState<string | null>(null);
  const [partnerAnswer, setPartnerAnswer] = useState<string | null>(null);
  const [answererId, setAnswererId] = useState<string | null>(null);
  const [guesserId, setGuesserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const sessionIdRef = useRef<string | null>(null);

  // Keep ref in sync
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

  // Find active session on mount
  useEffect(() => {
    if (coupleLoading || !coupleId || !userId) return;

    const findSession = async () => {
      const { data } = await supabase
        .from("game_sessions")
        .select("*")
        .eq("couple_id", coupleId)
        .eq("game_type", gameType)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setSessionId(data.id);
        setQuestion(data.question);
        setOptionA(data.option_a);
        setOptionB(data.option_b);
        setAnswererId((data as any).answerer_id);
        setGuesserId((data as any).guesser_id);

        const { data: answers } = await supabase
          .from("game_answers")
          .select("answer, user_id")
          .eq("session_id", data.id);

        answers?.forEach((a) => {
          if (a.user_id === userId) setMyAnswer(a.answer);
          else setPartnerAnswer(a.answer);
        });
      }
      setLoading(false);
    };

    findSession();
  }, [coupleLoading, coupleId, userId, gameType]);

  // Subscribe to new sessions from partner
  useEffect(() => {
    if (!coupleId || !userId) return;

    const channel = supabase
      .channel(`game-session-sync-${coupleId}-${gameType}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "game_sessions",
        filter: `couple_id=eq.${coupleId}`,
      }, (payload) => {
        const s = payload.new as any;
        if (s.game_type === gameType && s.status === "active" && s.created_by !== userId) {
          setSessionId(s.id);
          setQuestion(s.question);
          setOptionA(s.option_a);
          setOptionB(s.option_b);
          setAnswererId(s.answerer_id);
          setGuesserId(s.guesser_id);
          setMyAnswer(null);
          setPartnerAnswer(null);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [coupleId, userId, gameType]);

  // Subscribe to answers for current session
  useEffect(() => {
    if (!sessionId || !userId) return;

    const channel = supabase
      .channel(`game-answers-sync-${sessionId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "game_answers",
        filter: `session_id=eq.${sessionId}`,
      }, (payload) => {
        const row = payload.new as any;
        if (row.user_id !== userId) setPartnerAnswer(row.answer);
      })
      .subscribe();

    // Also fetch existing partner answer
    supabase
      .from("game_answers")
      .select("answer, user_id")
      .eq("session_id", sessionId)
      .neq("user_id", userId!)
      .maybeSingle()
      .then(({ data }) => { if (data) setPartnerAnswer(data.answer); });

    return () => { supabase.removeChannel(channel); };
  }, [sessionId, userId]);

  const createSession = useCallback(async (q: string, optA?: string, optB?: string, roles?: { answerer_id: string; guesser_id: string }) => {
    if (!coupleId || !userId) return null;

    // Mark old active sessions as done
    await supabase
      .from("game_sessions")
      .update({ status: "done" })
      .eq("couple_id", coupleId)
      .eq("game_type", gameType)
      .eq("status", "active");

    const insertData: any = {
      couple_id: coupleId,
      game_type: gameType,
      question: q,
      option_a: optA || null,
      option_b: optB || null,
      created_by: userId,
    };
    if (roles) {
      insertData.answerer_id = roles.answerer_id;
      insertData.guesser_id = roles.guesser_id;
    }

    const { data: session } = await supabase
      .from("game_sessions")
      .insert(insertData)
      .select("id")
      .single();

    if (!session) { toast.error("Gagal membuat sesi"); return null; }

    setSessionId(session.id);
    setQuestion(q);
    setOptionA(optA || null);
    setOptionB(optB || null);
    setAnswererId(roles?.answerer_id || null);
    setGuesserId(roles?.guesser_id || null);
    setMyAnswer(null);
    setPartnerAnswer(null);

    return session.id;
  }, [coupleId, userId, gameType]);

  const submitAnswer = useCallback(async (answer: string) => {
    const sid = sessionIdRef.current;
    if (!sid || !userId || myAnswer) return;

    await supabase.from("game_answers").insert({
      session_id: sid,
      user_id: userId,
      answer,
    });

    setMyAnswer(answer);
  }, [userId, myAnswer]);

  return {
    coupleId, userId, myName, partnerName,
    sessionId, question, optionA, optionB,
    myAnswer, partnerAnswer,
    loading: loading || coupleLoading,
    createSession, submitAnswer,
  };
}

