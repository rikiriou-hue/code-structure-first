import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import GameLayout from "@/components/games/GameLayout";
import { whosMoreLikelyQuestions } from "@/lib/gameQuestions";
import { useGameSession } from "@/hooks/useGameSession";

const WhosMoreLikely = () => {
  const {
    coupleId, userId, myName, partnerName,
    sessionId, question, myAnswer, partnerAnswer,
    loading, createSession, submitAnswer,
  } = useGameSession("whos_more_likely");

  useEffect(() => {
    if (!loading && coupleId && !sessionId) {
      const q = whosMoreLikelyQuestions[Math.floor(Math.random() * whosMoreLikelyQuestions.length)];
      createSession(q, myName, partnerName);
    }
  }, [loading, coupleId, sessionId, createSession, myName, partnerName]);

  const nextQuestion = () => {
    const q = whosMoreLikelyQuestions[Math.floor(Math.random() * whosMoreLikelyQuestions.length)];
    createSession(q, myName, partnerName);
  };

  const handleSelect = (choice: string) => {
    if (myAnswer) return;
    submitAnswer(choice);
  };

  if (loading || !question) {
    return (
      <GameLayout title="Who's More Likely" emoji="🤭">
        <p className="text-center text-muted-foreground font-handwritten text-xl">Memuat...</p>
      </GameLayout>
    );
  }

  return (
    <GameLayout title="Who's More Likely" emoji="🤭">
      <AnimatePresence mode="wait">
        <motion.div
          key={sessionId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-6"
        >
          <div className="scrapbook-card p-8 text-center">
            <p className="font-handwritten text-3xl text-foreground leading-relaxed">
              {question}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[myName, partnerName].map((name) => (
              <motion.button
                key={name}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelect(name)}
                disabled={!!myAnswer}
                className={`p-6 rounded-xl text-center transition-all duration-300 ${
                  myAnswer === name
                    ? "bg-primary text-primary-foreground shadow-lg scale-105"
                    : "bg-card border border-border hover:border-primary/40"
                }`}
              >
                <span className="font-handwritten text-2xl block">{name}</span>
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
                  {myAnswer === partnerAnswer ? " ✨ Sama!" : " 😄 Berbeda!"}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mt-2 italic">
                  Menunggu pilihan {partnerName}... 💭
                </p>
              )}
            </motion.div>
          )}

          <Button variant="outline" onClick={nextQuestion} className="w-full gap-2">
            <RefreshCw className="w-4 h-4" />
            Pertanyaan Baru
          </Button>
        </motion.div>
      </AnimatePresence>
    </GameLayout>
  );
};

export default WhosMoreLikely;
