import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, CheckCircle2, XCircle, User, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GameLayout from "@/components/games/GameLayout";
import { loveQuizQuestions } from "@/lib/gameQuestions";
import { useGameSession } from "@/hooks/useGameSession";
import { supabase } from "@/integrations/supabase/client";

const LoveQuiz = () => {
  const {
    coupleId, userId, myName, partnerName,
    sessionId, question, myAnswer, partnerAnswer,
    answererId, guesserId,
    loading, createSession, submitAnswer,
  } = useGameSession("love_quiz");

  const [draft, setDraft] = useState("");
  const [lastRole, setLastRole] = useState<"answerer" | "guesser" | null>(null);

  useEffect(() => {
    if (answererId && userId) {
      setLastRole(answererId === userId ? "answerer" : "guesser");
    }
  }, [answererId, userId]);

  const getPartnerId = async (): Promise<string | null> => {
    if (!coupleId || !userId) return null;
    const { data } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("couple_id", coupleId)
      .neq("user_id", userId)
      .maybeSingle();
    return data?.user_id || null;
  };

  const startNewRound = async () => {
    const q = loveQuizQuestions[Math.floor(Math.random() * loveQuizQuestions.length)];
    setDraft("");

    const partnerId = await getPartnerId();
    if (!partnerId || !userId) {
      createSession(q);
      return;
    }

    let newAnswerer: string;
    let newGuesser: string;
    if (lastRole === "answerer") {
      newAnswerer = partnerId;
      newGuesser = userId;
    } else {
      newAnswerer = userId;
      newGuesser = partnerId;
    }

    createSession(q, undefined, undefined, { answerer_id: newAnswerer, guesser_id: newGuesser });
  };

  useEffect(() => {
    if (!loading && coupleId && !sessionId) {
      startNewRound();
    }
  }, [loading, coupleId, sessionId]);

  const handleSubmit = async () => {
    if (!draft.trim()) return;
    await submitAnswer(draft.trim());
  };

  const isAnswerer = answererId === userId;
  const isGuesser = guesserId === userId;
  const hasRoles = !!answererId && !!guesserId;

  if (loading || !question) {
    return (
      <GameLayout title="Love Quiz" emoji="🧠">
        <p className="text-center text-muted-foreground font-handwritten text-xl">Memuat...</p>
      </GameLayout>
    );
  }

  return (
    <GameLayout title="Love Quiz" emoji="🧠">
      <AnimatePresence mode="wait">
        <motion.div
          key={sessionId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-6 mt-4"
        >
          {hasRoles && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-medium ${
                isAnswerer
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "bg-accent/50 text-accent-foreground border border-accent"
              }`}
            >
              {isAnswerer ? (
                <>
                  <User className="w-4 h-4" />
                  <span>Giliranmu menjawab jujur</span>
                </>
              ) : (
                <>
                  <HelpCircle className="w-4 h-4" />
                  <span>Giliranmu menebak jawaban {partnerName}</span>
                </>
              )}
            </motion.div>
          )}

          <div className="scrapbook-card p-8 text-center">
            <p className="font-handwritten text-3xl text-foreground leading-relaxed">
              {question}
            </p>
          </div>

          {!myAnswer ? (
            <div className="space-y-4">
              <Input
                placeholder={isAnswerer ? "Jawab dengan jujur..." : "Tebak jawabannya..."}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="font-handwritten text-lg bg-card border-border"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <Button onClick={handleSubmit} className="w-full" disabled={!draft.trim() || !coupleId}>
                {isAnswerer ? "Kirim Jawaban" : "Kirim Tebakan"}
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="glass-card p-6">
                <p className="text-sm text-muted-foreground mb-1">
                  {isAnswerer ? "Jawabanmu:" : "Tebakanmu:"}
                </p>
                <p className="font-handwritten text-xl text-foreground">{myAnswer}</p>
              </div>

              <div className={`glass-card p-6 ${!partnerAnswer ? "border-dashed border-2 border-primary/20" : ""}`}>
                <p className="text-sm text-muted-foreground mb-1">
                  {isAnswerer
                    ? `Tebakan ${partnerName}:`
                    : `Jawaban asli ${partnerName}:`}
                </p>
                {partnerAnswer ? (
                  <p className="font-handwritten text-xl text-foreground">{partnerAnswer}</p>
                ) : (
                  <p className="font-handwritten text-lg text-muted-foreground italic">
                    Menunggu {partnerName} {isAnswerer ? "menebak" : "menjawab"}... 💭
                  </p>
                )}
              </div>

              {/* Both answered - show comparison */}
              {partnerAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-2"
                >
                  <p className="font-handwritten text-lg text-muted-foreground">
                    Bandingkan jawaban kalian! Apakah tebakannya tepat? 🤔
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          <Button variant="outline" onClick={startNewRound} className="w-full gap-2">
            <RefreshCw className="w-4 h-4" />
            Pertanyaan Baru (Tukar Peran)
          </Button>
        </motion.div>
      </AnimatePresence>
    </GameLayout>
  );
};

export default LoveQuiz;
