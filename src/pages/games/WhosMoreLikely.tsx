import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import GameLayout from "@/components/games/GameLayout";
import { whosMoreLikelyQuestions } from "@/lib/gameQuestions";
import { useCouple } from "@/hooks/useCouple";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const WhosMoreLikely = () => {
  const { coupleId, userId, myName, partnerName } = useCouple();
  const [questionIndex, setQuestionIndex] = useState(() =>
    Math.floor(Math.random() * whosMoreLikelyQuestions.length)
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [partnerChoice, setPartnerChoice] = useState<string | null>(null);

  const question = whosMoreLikelyQuestions[questionIndex];

  useEffect(() => {
    if (!sessionId) return;
    const channel = supabase
      .channel(`wml-${sessionId}`)
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
      .then(({ data }) => { if (data) setPartnerChoice(data.answer); });

    return () => { supabase.removeChannel(channel); };
  }, [sessionId, userId]);

  const nextQuestion = () => {
    let next = Math.floor(Math.random() * whosMoreLikelyQuestions.length);
    while (next === questionIndex && whosMoreLikelyQuestions.length > 1) {
      next = Math.floor(Math.random() * whosMoreLikelyQuestions.length);
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
        game_type: "whos_more_likely",
        question,
        option_a: myName,
        option_b: partnerName,
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
            {[myName, partnerName].map((name) => (
              <motion.button
                key={name}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelect(name)}
                disabled={!!selected}
                className={`p-6 rounded-xl text-center transition-all duration-300 ${
                  selected === name
                    ? "bg-primary text-primary-foreground shadow-lg scale-105"
                    : "bg-card border border-border hover:border-primary/40"
                }`}
              >
                <span className="font-handwritten text-2xl block">{name}</span>
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
                  {selected === partnerChoice ? " ✨ Sama!" : " 😄 Berbeda!"}
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
