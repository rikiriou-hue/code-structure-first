import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import GameLayout from "@/components/games/GameLayout";
import { truthOrLoveQuestions } from "@/lib/gameQuestions";
import { useGameSession } from "@/hooks/useGameSession";
import { useState } from "react";

const TruthOrLove = () => {
  const {
    coupleId, userId, myName, partnerName,
    sessionId, question, myAnswer, partnerAnswer,
    loading, createSession, submitAnswer,
  } = useGameSession("truth_or_love");

  const [draft, setDraft] = useState("");

  // Auto-create session if none exists
  useEffect(() => {
    if (!loading && coupleId && !sessionId) {
      const q = truthOrLoveQuestions[Math.floor(Math.random() * truthOrLoveQuestions.length)];
      createSession(q);
    }
  }, [loading, coupleId, sessionId, createSession]);

  const nextQuestion = () => {
    const q = truthOrLoveQuestions[Math.floor(Math.random() * truthOrLoveQuestions.length)];
    setDraft("");
    createSession(q);
  };

  const handleSubmit = async () => {
    if (!draft.trim()) return;
    await submitAnswer(draft.trim());
  };

  if (loading || !question) {
    return (
      <GameLayout title="Truth or Love" emoji="💕">
        <p className="text-center text-muted-foreground font-handwritten text-xl">Memuat...</p>
      </GameLayout>
    );
  }

  return (
    <GameLayout title="Truth or Love" emoji="💕">
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

          {!myAnswer ? (
            <div className="space-y-4">
              <Textarea
                placeholder="Tulis jawabanmu di sini..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="min-h-[120px] font-handwritten text-lg bg-card border-border"
              />
              <Button onClick={handleSubmit} className="w-full" disabled={!draft.trim() || !coupleId}>
                Kirim Jawaban
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="glass-card p-6">
                <p className="text-sm text-muted-foreground mb-1">{myName}:</p>
                <p className="font-handwritten text-xl text-foreground">{myAnswer}</p>
              </div>
              <div className={`glass-card p-6 ${!partnerAnswer ? "border-dashed border-2 border-primary/20" : ""}`}>
                <p className="text-sm text-muted-foreground mb-1">{partnerName}:</p>
                {partnerAnswer ? (
                  <p className="font-handwritten text-xl text-foreground">{partnerAnswer}</p>
                ) : (
                  <p className="font-handwritten text-lg text-muted-foreground italic">
                    Menunggu {partnerName} menjawab... 💭
                  </p>
                )}
              </div>
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

export default TruthOrLove;
