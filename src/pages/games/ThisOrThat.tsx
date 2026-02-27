import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import GameLayout from "@/components/games/GameLayout";
import { thisOrThatQuestions } from "@/lib/gameQuestions";
import { useCouple } from "@/hooks/useCouple";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ThisOrThat = () => {
  const { coupleId, userId, myName, partnerName } = useCouple();
  const [questionIndex, setQuestionIndex] = useState(() =>
    Math.floor(Math.random() * thisOrThatQuestions.length)
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [partnerChoice, setPartnerChoice] = useState<string | null>(null);

  const [optionA, optionB] = thisOrThatQuestions[questionIndex];

  useEffect(() => {
    if (!sessionId) return;
    const channel = supabase
      .channel(`tot-${sessionId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "game_answers",
        filter: `session_id=eq.${sessionId}`,
      }, (payload) => {
        const row = payload.new as any;
        if (row.user_id !== userId) setPartnerChoice(row.answer as string);
      })
      .subscribe();

    supabase
      .from("game_answers")
      .select("answer, user_id")
      .eq("session_id", sessionId)
      .neq("user_id", userId!)
      .maybeSingle()
      .then(({ data }) => { if (data) setPartnerChoice(data.answer as string); });

    return () => { supabase.removeChannel(channel); };
  }, [sessionId, userId]);

  const nextQuestion = () => {
    let next = Math.floor(Math.random() * thisOrThatQuestions.length);
    while (next === questionIndex && thisOrThatQuestions.length > 1) {
      next = Math.floor(Math.random() * thisOrThatQuestions.length);
    }
    setQuestionIndex(next);
    setSelected(null);
    setSessionId(null);
    setPartnerChoice(null);
  };

  const handleSelect = async (choice: string) => {
    if (!coupleId || !userId || selected) return;
    setSelected(choice);

    const { data: session } = await supabase
      .from("game_sessions")
      .insert({
        couple_id: coupleId,
        game_type: "this_or_that",
        question: `${optionA} vs ${optionB}`,
        option_a: optionA,
        option_b: optionB,
        created_by: userId,
      })
      .select("id")
      .single();

    if (!session) { toast.error("Gagal menyimpan"); return; }

    await supabase.from("game_answers").insert({
      session_id: session.id, user_id: userId, answer: choice,
    });

    setSessionId(session.id);
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
            {[optionA, optionB].map((label) => (
              <motion.button
                key={label}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelect(label)}
                disabled={!!selected}
                className={`relative p-10 rounded-xl text-center transition-all duration-300 ${
                  selected === label
                    ? "bg-primary text-primary-foreground shadow-lg scale-105"
                    : "bg-card border border-border hover:border-primary/40"
                }`}
              >
                <span className="font-handwritten text-3xl">{label}</span>
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
                Kamu memilih: <span className="text-primary">{selected}</span>
              </p>
              {partnerChoice ? (
                <p className="font-handwritten text-lg text-foreground mt-2">
                  {partnerName} memilih: <span className="text-primary">{partnerChoice}</span>
                  {selected === partnerChoice ? " 💕 Cocok!" : " 😄 Berbeda!"}
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
