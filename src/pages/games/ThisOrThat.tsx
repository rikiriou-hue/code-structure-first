import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import GameLayout from "@/components/games/GameLayout";
import GameScoreBadge from "@/components/games/GameScoreBadge";
import { thisOrThatQuestions } from "@/lib/gameQuestions";
import { useGameSession } from "@/hooks/useGameSession";
import { useGameScores } from "@/hooks/useGameScores";

const ThisOrThat = () => {
  const {
    coupleId, userId, myName, partnerName,
    sessionId, question, optionA, optionB,
    myAnswer, partnerAnswer,
    loading, createSession, submitAnswer,
  } = useGameSession("this_or_that");

  const { addScore } = useGameScores("this_or_that");

  useEffect(() => {
    if (!loading && coupleId && !sessionId) {
      const pair = thisOrThatQuestions[Math.floor(Math.random() * thisOrThatQuestions.length)];
      createSession(`${pair[0]} vs ${pair[1]}`, pair[0], pair[1]);
    }
  }, [loading, coupleId, sessionId, createSession]);

  const nextQuestion = () => {
    const pair = thisOrThatQuestions[Math.floor(Math.random() * thisOrThatQuestions.length)];
    createSession(`${pair[0]} vs ${pair[1]}`, pair[0], pair[1]);
  };

  const handleSelect = async (choice: string) => {
    if (myAnswer) return;
    await submitAnswer(choice);
  };

  // Score when both answered
  useEffect(() => {
    if (myAnswer && partnerAnswer) {
      if (myAnswer === partnerAnswer) {
        addScore("this_or_that", "win");
      } else {
        addScore("this_or_that", "draw");
      }
    }
  }, [myAnswer, partnerAnswer]);

  if (loading || !optionA || !optionB) {
    return (
      <GameLayout title="This or That" emoji="⚡">
        <p className="text-center text-muted-foreground font-handwritten text-xl">Memuat...</p>
      </GameLayout>
    );
  }

  return (
    <GameLayout title="This or That" emoji="⚡">
      <GameScoreBadge gameType="this_or_that" />

      <AnimatePresence mode="wait">
        <motion.div
          key={sessionId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-6 mt-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[optionA, optionB].map((label) => (
              <motion.button
                key={label}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelect(label!)}
                disabled={!!myAnswer}
                className={`relative p-10 rounded-xl text-center transition-all duration-300 ${
                  myAnswer === label
                    ? "bg-primary text-primary-foreground shadow-lg scale-105"
                    : "bg-card border border-border hover:border-primary/40"
                }`}
              >
                <span className="font-handwritten text-3xl">{label}</span>
              </motion.button>
            ))}
          </div>

          {myAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 text-center"
            >
              <p className="font-handwritten text-xl text-foreground">
                Kamu memilih: <span className="text-primary">{myAnswer}</span>
              </p>
              {partnerAnswer ? (
                <p className="font-handwritten text-lg text-foreground mt-2">
                  {partnerName} memilih: <span className="text-primary">{partnerAnswer}</span>
                  {myAnswer === partnerAnswer ? " 💕 Cocok! (+3 poin)" : " 😄 Berbeda! (+1 poin)"}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mt-2 italic">
                  Menunggu pilihan {partnerName}... 💭
                </p>
              )}
            </motion.div>
          )}

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="font-handwritten text-lg text-muted-foreground">atau</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" onClick={nextQuestion} className="w-full gap-2">
            <RefreshCw className="w-4 h-4" />
            Pertanyaan Baru
          </Button>
        </motion.div>
      </AnimatePresence>
    </GameLayout>
  );
};

export default ThisOrThat;
