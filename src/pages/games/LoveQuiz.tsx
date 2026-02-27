import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GameLayout from "@/components/games/GameLayout";
import { loveQuizQuestions } from "@/lib/gameQuestions";

const LoveQuiz = () => {
  const [questionIndex, setQuestionIndex] = useState(() =>
    Math.floor(Math.random() * loveQuizQuestions.length)
  );
  const [guess, setGuess] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  const question = loveQuizQuestions[questionIndex];

  const nextQuestion = () => {
    let next = Math.floor(Math.random() * loveQuizQuestions.length);
    while (next === questionIndex && loveQuizQuestions.length > 1) {
      next = Math.floor(Math.random() * loveQuizQuestions.length);
    }
    setQuestionIndex(next);
    setGuess("");
    setSubmitted(false);
  };

  const handleSubmit = () => {
    if (!guess.trim()) return;
    setSubmitted(true);
    setTotalAnswered((prev) => prev + 1);
  };

  return (
    <GameLayout title="Love Quiz" emoji="🧠">
      <div className="text-center mb-6">
        <span className="font-handwritten text-xl text-muted-foreground">
          Skor: {score}/{totalAnswered}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={questionIndex}
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

          {!submitted ? (
            <div className="space-y-4">
              <Input
                placeholder="Tebak jawabannya..."
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                className="font-handwritten text-lg bg-card border-border"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <Button onClick={handleSubmit} className="w-full" disabled={!guess.trim()}>
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
                <p className="font-handwritten text-xl text-foreground">{guess}</p>
              </div>
              <div className="glass-card p-6 border-dashed border-2 border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Jawaban asli pasangan:</p>
                <p className="font-handwritten text-lg text-muted-foreground italic">
                  Menunggu pasangan mengisi jawaban asli... 💭
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 gap-2 border-green-500/30 hover:bg-green-500/10 text-green-400"
                  onClick={() => {
                    setScore((s) => s + 1);
                    nextQuestion();
                  }}
                >
                  <CheckCircle2 className="w-4 h-4" /> Benar
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2 border-destructive/30 hover:bg-destructive/10 text-destructive"
                  onClick={nextQuestion}
                >
                  <XCircle className="w-4 h-4" /> Salah
                </Button>
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

export default LoveQuiz;
