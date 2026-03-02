import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, User, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import GameLayout from "@/components/games/GameLayout";
import { truthOrLoveQuestions } from "@/lib/gameQuestions";
import { useGameSession } from "@/hooks/useGameSession";
import { supabase } from "@/integrations/supabase/client";

const TruthOrLove = () => {
  const {
    coupleId, userId, myName, partnerName,
    sessionId, question, myAnswer, partnerAnswer,
    answererId, guesserId,
    loading, createSession, submitAnswer,
  } = useGameSession("truth_or_love");

  const [draft, setDraft] = useState("");
  const [lastRole, setLastRole] = useState<"answerer" | "guesser" | null>(null);

  // Track last role to alternate
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
    const q = truthOrLoveQuestions[Math.floor(Math.random() * truthOrLoveQuestions.length)];
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
          className="space-y-6 mt-4"
        >
          {/* Role indicator */}
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
                  <span>Giliranmu menjawab pertanyaan ini 💬</span>
                </>
              ) : (
                <>
                  <HelpCircle className="w-4 h-4" />
                  <span>Tunggu {partnerName} menjawab, lalu baca jawabannya 💭</span>
                </>
              )}
            </motion.div>
          )}

          <div className="scrapbook-card p-8 text-center">
            <p className="font-handwritten text-3xl text-foreground leading-relaxed">
              {question}
            </p>
          </div>

          {/* Answerer writes their answer */}
          {isAnswerer && !myAnswer && (
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
          )}

          {/* Guesser waits for answerer */}
          {isGuesser && !partnerAnswer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-6 text-center"
            >
              <p className="font-handwritten text-xl text-muted-foreground italic">
                Menunggu {partnerName} menjawab... 💭
              </p>
            </motion.div>
          )}

          {/* Show answers once answerer has submitted */}
          {((isAnswerer && myAnswer) || (isGuesser && partnerAnswer)) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              {/* Answerer's answer */}
              <div className="glass-card p-6">
                <p className="text-sm text-muted-foreground mb-1">
                  {isAnswerer ? `${myName} (kamu):` : `${partnerName}:`}
                </p>
                <p className="font-handwritten text-xl text-foreground">
                  {isAnswerer ? myAnswer : partnerAnswer}
                </p>
              </div>

              {/* Guesser can now write their reaction/response */}
              {isGuesser && !myAnswer && (
                <div className="space-y-4">
                  <Textarea
                    placeholder="Tulis responsmu tentang jawaban ini..."
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    className="min-h-[100px] font-handwritten text-lg bg-card border-border"
                  />
                  <Button onClick={handleSubmit} className="w-full" disabled={!draft.trim() || !coupleId}>
                    Kirim Respons
                  </Button>
                </div>
              )}

              {/* Show both responses */}
              {isGuesser && myAnswer && (
                <div className="glass-card p-6">
                  <p className="text-sm text-muted-foreground mb-1">{myName} (kamu):</p>
                  <p className="font-handwritten text-xl text-foreground">{myAnswer}</p>
                </div>
              )}

              {isAnswerer && partnerAnswer && (
                <div className="glass-card p-6">
                  <p className="text-sm text-muted-foreground mb-1">Respons {partnerName}:</p>
                  <p className="font-handwritten text-xl text-foreground">{partnerAnswer}</p>
                </div>
              )}

              {isAnswerer && !partnerAnswer && (
                <div className="glass-card p-6 border-dashed border-2 border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">Respons {partnerName}:</p>
                  <p className="font-handwritten text-lg text-muted-foreground italic">
                    Menunggu {partnerName} membaca & merespons... 💭
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* No roles fallback (solo) */}
          {!hasRoles && !myAnswer && (
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
          )}

          {!hasRoles && myAnswer && (
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

          <Button variant="outline" onClick={startNewRound} className="w-full gap-2">
            <RefreshCw className="w-4 h-4" />
            Pertanyaan Baru (Tukar Peran)
          </Button>
        </motion.div>
      </AnimatePresence>
    </GameLayout>
  );
};

export default TruthOrLove;
