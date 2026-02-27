import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import GameLayout from "@/components/games/GameLayout";
import { truthOrLoveQuestions } from "@/lib/gameQuestions";
import { useCouple } from "@/hooks/useCouple";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TruthOrLove = () => {
  const { coupleId, userId, myName, partnerName } = useCouple();
  const [questionIndex, setQuestionIndex] = useState(() =>
    Math.floor(Math.random() * truthOrLoveQuestions.length)
  );
  const [myAnswer, setMyAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [partnerAnswer, setPartnerAnswer] = useState<string | null>(null);

  const question = truthOrLoveQuestions[questionIndex];

  // Listen for partner's answer via realtime
  useEffect(() => {
    if (!sessionId) return;
    const channel = supabase
      .channel(`game-answers-${sessionId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "game_answers",
        filter: `session_id=eq.${sessionId}`,
      }, (payload) => {
        const row = payload.new as any;
        if (row.user_id !== userId) {
          setPartnerAnswer(row.answer);
        }
      })
      .subscribe();

    // Also check if partner already answered
    supabase
      .from("game_answers")
      .select("answer, user_id")
      .eq("session_id", sessionId)
      .neq("user_id", userId!)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setPartnerAnswer(data.answer as string);
      });

    return () => { supabase.removeChannel(channel); };
  }, [sessionId, userId]);

  const nextQuestion = useCallback(() => {
    let next = Math.floor(Math.random() * truthOrLoveQuestions.length);
    while (next === questionIndex && truthOrLoveQuestions.length > 1) {
      next = Math.floor(Math.random() * truthOrLoveQuestions.length);
    }
    setQuestionIndex(next);
    setMyAnswer("");
    setSubmitted(false);
    setSessionId(null);
    setPartnerAnswer(null);
  }, [questionIndex]);

  const handleSubmit = async () => {
    if (!myAnswer.trim() || !coupleId || !userId) return;

    // Create game session
    const { data: session, error: sessionErr } = await supabase
      .from("game_sessions")
      .insert({ couple_id: coupleId, game_type: "truth_or_love", question, created_by: userId })
      .select("id")
      .single();

    if (sessionErr || !session) {
      toast.error("Gagal menyimpan. Coba lagi.");
      return;
    }

    // Insert answer
    await supabase.from("game_answers").insert({
      session_id: session.id,
      user_id: userId,
      answer: myAnswer,
    });

    setSessionId(session.id);
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
              <Button onClick={handleSubmit} className="w-full" disabled={!myAnswer.trim() || !coupleId}>
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
