import { useGameScores } from "@/hooks/useGameScores";
import { useCouple } from "@/hooks/useCouple";

interface GameScoreBadgeProps {
  gameType: string;
}

const GameScoreBadge = ({ gameType }: GameScoreBadgeProps) => {
  const { scores } = useGameScores(gameType);
  const { userId } = useCouple();

  const myScore = scores.find((s) => s.user_id === userId);
  const partnerScore = scores.find((s) => s.user_id !== userId);

  if (!myScore && !partnerScore) return null;

  return (
    <div className="flex items-center justify-center gap-4 text-sm">
      <div className="text-center">
        <p className="font-handwritten text-lg text-primary">{myScore?.total_points || 0}</p>
        <p className="text-xs text-muted-foreground">Kamu</p>
      </div>
      <span className="font-handwritten text-xl text-muted-foreground">vs</span>
      <div className="text-center">
        <p className="font-handwritten text-lg text-primary">{partnerScore?.total_points || 0}</p>
        <p className="text-xs text-muted-foreground">{partnerScore?.display_name || "Pasangan"}</p>
      </div>
    </div>
  );
};

export default GameScoreBadge;
