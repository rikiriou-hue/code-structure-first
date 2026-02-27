import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import GameLayout from "@/components/games/GameLayout";
import { thisOrThatQuestions } from "@/lib/gameQuestions";

const ThisOrThat = () => {
  const [questionIndex, setQuestionIndex] = useState(() =>
    Math.floor(Math.random() * thisOrThatQuestions.length)
  );
  const [selected, setSelected] = useState<0 | 1 | null>(null);

  const [optionA, optionB] = thisOrThatQuestions[questionIndex];

  const nextQuestion = () => {
    let next = Math.floor(Math.random() * thisOrThatQuestions.length);
    while (next === questionIndex && thisOrThatQuestions.length > 1) {
      next = Math.floor(Math.random() * thisOrThatQuestions.length);
    }
    setQuestionIndex(next);
    setSelected(null);
  };

  return (
    <GameLayout title="This or That" emoji="⚡">
      <AnimatePresence mode="wait">
        <motion.div
          key={questionIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { idx: 0 as const, label: optionA },
              { idx: 1 as const, label: optionB },
            ].map((option) => (
              <motion.button
                key={option.idx}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelected(option.idx)}
                className={`relative p-10 rounded-xl text-center transition-all duration-300 ${
                  selected === option.idx
                    ? "bg-primary text-primary-foreground shadow-lg scale-105"
                    : "bg-card border border-border hover:border-primary/40"
                }`}
              >
                <span className="font-handwritten text-3xl">{option.label}</span>
              </motion.button>
            ))}
          </div>

          {selected !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 text-center"
            >
              <p className="font-handwritten text-xl text-foreground">
                Kamu memilih: <span className="text-primary">{selected === 0 ? optionA : optionB}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-2 italic">
                Menunggu pilihan pasangan... 💭
              </p>
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
