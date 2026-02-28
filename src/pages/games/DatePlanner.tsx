import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dice5 } from "lucide-react";
import { Button } from "@/components/ui/button";
import GameLayout from "@/components/games/GameLayout";
import { datePlannerActivities, datePlannerPlaces } from "@/lib/gameQuestions";

const DatePlanner = () => {
  const [activity, setActivity] = useState<string | null>(null);
  const [place, setPlace] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);

  const spin = () => {
    setSpinning(true);
    let count = 0;
    const interval = setInterval(() => {
      setActivity(datePlannerActivities[Math.floor(Math.random() * datePlannerActivities.length)]);
      setPlace(datePlannerPlaces[Math.floor(Math.random() * datePlannerPlaces.length)]);
      count++;
      if (count > 15) {
        clearInterval(interval);
        setSpinning(false);
      }
    }, 100);
  };

  return (
    <GameLayout title="Date Planner" emoji="🎲">
      <div className="space-y-8">
        <div className="text-center">
          <Button
            onClick={spin}
            disabled={spinning}
            size="lg"
            className="gap-3 text-lg px-8 py-6"
          >
            <Dice5 className={`w-6 h-6 ${spinning ? "animate-spin" : ""}`} />
            {spinning ? "Memilih..." : "Putar Roda Kencan!"}
          </Button>
        </div>

        <AnimatePresence>
          {activity && place && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="scrapbook-card p-8 text-center space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Aktivitas</p>
                  <motion.p
                    key={activity}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-handwritten text-4xl text-primary"
                  >
                    {activity}
                  </motion.p>
                </div>
                <div className="h-px bg-border" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tempat</p>
                  <motion.p
                    key={place}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-handwritten text-4xl text-primary"
                  >
                    {place}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameLayout>
  );
};

export default DatePlanner;
