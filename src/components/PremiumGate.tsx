import { Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PremiumGateProps {
  children: React.ReactNode;
  isPremium: boolean;
  featureName?: string;
}

const PremiumGate = ({ children, isPremium, featureName = "fitur ini" }: PremiumGateProps) => {
  const navigate = useNavigate();

  if (isPremium) return <>{children}</>;

  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none opacity-50">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-2xl">
        <div className="text-center p-6 max-w-sm">
          <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-amber-400" />
          </div>
          <h3 className="font-serif text-lg text-foreground mb-2">Fitur Premium</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upgrade ke Premium untuk mengakses {featureName}
          </p>
          <Button onClick={() => navigate("/pricing")} className="gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
            <Crown className="w-4 h-4" />
            Upgrade Premium
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PremiumGate;
