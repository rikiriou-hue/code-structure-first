import { Trophy, Medal, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useGameScores, type LeaderboardEntry } from "@/hooks/useGameScores";
import { useCouple } from "@/hooks/useCouple";

const Leaderboard = () => {
  const { leaderboard, loading } = useGameScores();
  const { userId } = useCouple();

  if (loading || leaderboard.length === 0) return null;

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    return <Star className="w-5 h-5 text-amber-700" />;
  };

  return (
    <div className="scrapbook-card p-6 space-y-4">
      <div className="flex items-center gap-2 justify-center">
        <Trophy className="w-5 h-5 text-primary" />
        <h3 className="font-handwritten text-2xl text-foreground">Leaderboard</h3>
      </div>

      <div className="space-y-3">
        {leaderboard.map((entry, i) => (
          <motion.div
            key={entry.user_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              entry.user_id === userId
                ? "bg-primary/10 border border-primary/20"
                : "bg-card border border-border"
            }`}
          >
            <div className="flex items-center justify-center w-8 h-8">
              {getRankIcon(i)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-handwritten text-lg text-foreground truncate">
                {entry.display_name}
                {entry.user_id === userId && (
                  <span className="text-xs text-primary ml-1">(kamu)</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {entry.wins}W · {entry.draws}D · {entry.losses}L
              </p>
            </div>
            <div className="text-right">
              <p className="font-handwritten text-2xl text-primary">{entry.total_points}</p>
              <p className="text-xs text-muted-foreground">poin</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
