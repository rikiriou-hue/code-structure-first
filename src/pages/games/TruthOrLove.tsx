import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import GameLayout from "@/components/games/GameLayout";
import { truthOrLoveQuestions } from "@/lib/gameQuestions";

const TruthOrLove = () => {
  const [questionIndex, setQuestionIndex] = useState(() =>
    Math.floor(Math.random() * truthOrLoveQuestions.length)
  );
  const [myAnswer, setMyAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const question = truthOrLoveQuestions[questionIndex];

  const nextQuestion = () => {
    let next = Math.floor(Math.random() * truthOrLoveQuestions.length);
    while (next === questionIndex && truthOrLoveQuestions.length > 1) {
      next = Math.floor(Math.random() * truthOrLoveQuestions.length);
    }
    setQuestionIndex(next);
    setMyAnswer("");
    setSubmitted(false);
  };

  const handleSubmit = () => {
    if (!myAnswer.trim()) return;
    setSubmitted(true);
  };

  return (
    <GameLayout title="Truth or Love" emoji="💕">
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
              <Textarea
                placeholder="Tulis jawabanmu di sini..."
                value={myAnswer}
                onChange={(e) => setMyAnswer(e.target.value)}
                className="min-h-[120px] font-handwritten text-lg bg-card border-border"
              />
              <Button onClick={handleSubmit} className="w-full" disabled={!myAnswer.trim()}>
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
                <p className="text-sm text-muted-foreground mb-1">Jawabanmu:</p>
                <p className="font-handwritten text-xl text-foreground">{myAnswer}</p>
              </div>
              <div className="glass-card p-6 border-dashed border-2 border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Jawaban pasangan:</p>
                <p className="font-handwritten text-lg text-muted-foreground italic">
                  Menunggu pasangan menjawab... 💭
                </p>
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
