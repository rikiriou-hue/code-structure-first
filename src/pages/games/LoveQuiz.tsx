import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GameLayout from "@/components/games/GameLayout";
import GameScoreBadge from "@/components/games/GameScoreBadge";
import { loveQuizQuestions } from "@/lib/gameQuestions";
import { useGameSession } from "@/hooks/useGameSession";
import { useGameScores } from "@/hooks/useGameScores";

const LoveQuiz = () => {
  const {
    coupleId, userId, myName, partnerName,
    sessionId, question, myAnswer, partnerAnswer,
    loading, createSession, submitAnswer,
  } = useGameSession("love_quiz");

  const { addScore } = useGameScores("love_quiz");
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!loading && coupleId && !sessionId) {
      const q = loveQuizQuestions[Math.floor(Math.random() * loveQuizQuestions.length)];
      createSession(q);
    }
  }, [loading, coupleId, sessionId, createSession]);

  const nextQuestion = () => {
    const q = loveQuizQuestions[Math.floor(Math.random() * loveQuizQuestions.length)];
    setDraft("");
    createSession(q);
  };

  const handleSubmit = async () => {
    if (!draft.trim()) return;
    await submitAnswer(draft.trim());
  };

  const handleResult = (correct: boolean) => {
    addScore("love_quiz", correct ? "win" : "loss");
    nextQuestion();
  };

  if (loading || !question) {
    return (
      <GameLayout title="Love Quiz" emoji="🧠">
        <p className="text-center text-muted-foreground font-handwritten text-xl">Memuat...</p>
      </GameLayout>
    );
  }

  return (
    <GameLayout title="Love Quiz" emoji="🧠">
      <GameScoreBadge gameType="love_quiz" />

      <AnimatePresence mode="wait">
        <motion.div
          key={sessionId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-6 mt-4"
        >
          <div className="scrapbook-card p-8 text-center">
            <p className="font-handwritten text-3xl text-foreground leading-relaxed">
              {question}
            </p>
          </div>

          {!myAnswer ? (
            <div className="space-y-4">
              <Input
                placeholder="Tebak jawabannya..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="font-handwritten text-lg bg-card border-border"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <Button onClick={handleSubmit} className="w-full" disabled={!draft.trim() || !coupleId}>
                Kirim Tebakan
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="glass-card p-6">
                <p className="text-sm text-muted-foreground mb-1">Tebakanmu:</p>
                <p className="font-handwritten text-xl text-foreground">{myAnswer}</p>
              </div>
              <div className={`glass-card p-6 ${!partnerAnswer ? "border-dashed border-2 border-primary/20" : ""}`}>
                <p className="text-sm text-muted-foreground mb-1">Jawaban asli {partnerName}:</p>
                {partnerAnswer ? (
                  <p className="font-handwritten text-xl text-foreground">{partnerAnswer}</p>
                ) : (
                  <p className="font-handwritten text-lg text-muted-foreground italic">
                    Menunggu {partnerName} mengisi jawaban asli... 💭
                  </p>
                )}
              </div>
              {partnerAnswer && (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 border-green-500/30 hover:bg-green-500/10 text-green-400"
                    onClick={() => handleResult(true)}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Benar (+3 poin)
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 border-destructive/30 hover:bg-destructive/10 text-destructive"
                    onClick={() => handleResult(false)}
                  >
                    <XCircle className="w-4 h-4" /> Salah
                  </Button>
                </div>
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

export default LoveQuiz;
