import { Crown } from "lucide-react";

const PremiumBadge = ({ className = "" }: { className?: string }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium ${className}`}>
    <Crown className="w-3 h-3" />
    Premium
  </span>
);

export default PremiumBadge;
