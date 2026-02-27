import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import GameLayout from "@/components/games/GameLayout";
import { whosMoreLikelyQuestions } from "@/lib/gameQuestions";
import { supabase } from "@/integrations/supabase/client";

const WhosMoreLikely = () => {
  const [questionIndex, setQuestionIndex] = useState(() =>
    Math.floor(Math.random() * whosMoreLikelyQuestions.length)
  );
  const [selected, setSelected] = useState<"A" | "B" | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [partnerName, setPartnerName] = useState("");

  useEffect(() => {
    const loadNames = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, couple_id")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setDisplayName(profile.display_name || "Aku");
        if (profile.couple_id) {
          const { data: partners } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("couple_id", profile.couple_id)
            .neq("user_id", user.id);

          if (partners?.[0]) {
            setPartnerName(partners[0].display_name || "Pasangan");
          }
        }
      }
    };
    loadNames();
  }, []);

  const question = whosMoreLikelyQuestions[questionIndex];
  const nameA = displayName || "Aku";
  const nameB = partnerName || "Pasangan";

  const nextQuestion = () => {
    let next = Math.floor(Math.random() * whosMoreLikelyQuestions.length);
    while (next === questionIndex && whosMoreLikelyQuestions.length > 1) {
      next = Math.floor(Math.random() * whosMoreLikelyQuestions.length);
    }
    setQuestionIndex(next);
    setSelected(null);
  };

  return (
    <GameLayout title="Who's More Likely" emoji="🤭">
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

          <div className="grid grid-cols-2 gap-4">
            {[
              { key: "A" as const, name: nameA },
              { key: "B" as const, name: nameB },
            ].map((option) => (
              <motion.button
                key={option.key}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelected(option.key)}
                className={`p-6 rounded-xl text-center transition-all duration-300 ${
                  selected === option.key
                    ? "bg-primary text-primary-foreground shadow-lg scale-105"
                    : "bg-card border border-border hover:border-primary/40"
                }`}
              >
                <span className="font-handwritten text-2xl block">{option.name}</span>
              </motion.button>
            ))}
          </div>

          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 text-center"
            >
              <p className="font-handwritten text-xl text-foreground">
                Kamu memilih: <span className="text-primary">{selected === "A" ? nameA : nameB}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-2 italic">
                Menunggu pilihan pasangan... 💭
              </p>
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
