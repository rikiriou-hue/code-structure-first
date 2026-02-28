import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import GameLayout from "@/components/games/GameLayout";
import { useCouple } from "@/hooks/useCouple";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const defaultEmojis = ["💕", "🌸", "💌", "🦋", "🌹", "💗", "✨", "🧸"];

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

function generateDeck(seed?: string): Card[] {
  const pairs = defaultEmojis.slice(0, 6);
  const all = [...pairs, ...pairs];

  // Seeded shuffle for consistency between partners
  if (seed) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
      h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
    }
    for (let i = all.length - 1; i > 0; i--) {
      h = ((h << 5) - h + i) | 0;
      const j = Math.abs(h) % (i + 1);
      [all[i], all[j]] = [all[j], all[i]];
    }
  } else {
    all.sort(() => Math.random() - 0.5);
  }

  return all.map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
}

const MemoryMatch = () => {
  const { coupleId, userId, loading: coupleLoading } = useCouple();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const channelRef = useRef<any>(null);
  const isProcessing = useRef(false);

  // Find or create a session with a shared seed
  const initGame = useCallback(async () => {
    if (!coupleId || !userId) return;

    // Mark old sessions done
    await supabase
      .from("game_sessions")
      .update({ status: "done" })
      .eq("couple_id", coupleId)
      .eq("game_type", "memory_match")
      .eq("status", "active");

    const seed = crypto.randomUUID();
    const { data: session } = await supabase
      .from("game_sessions")
      .insert({
        couple_id: coupleId,
        game_type: "memory_match",
        question: seed,
        created_by: userId,
      })
      .select("id")
      .single();

    if (!session) { toast.error("Gagal membuat sesi"); return; }

    setSessionId(session.id);
    setCards(generateDeck(seed));
    setFlippedIds([]);
    setMoves(0);
    setIsComplete(false);
  }, [coupleId, userId]);

  // On mount, find existing session or create
  useEffect(() => {
    if (coupleLoading || !coupleId || !userId) return;

    const load = async () => {
      const { data } = await supabase
        .from("game_sessions")
        .select("*")
        .eq("couple_id", coupleId)
        .eq("game_type", "memory_match")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setSessionId(data.id);
        setCards(generateDeck(data.question!));
        setFlippedIds([]);
        setMoves(0);
        setIsComplete(false);
      } else {
        initGame();
      }
    };
    load();
  }, [coupleLoading, coupleId, userId, initGame]);

  // Listen for new sessions from partner (restart)
  useEffect(() => {
    if (!coupleId || !userId) return;

    const ch = supabase
      .channel(`mm-session-${coupleId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "game_sessions",
        filter: `couple_id=eq.${coupleId}`,
      }, (payload) => {
        const s = payload.new as any;
        if (s.game_type === "memory_match" && s.status === "active" && s.created_by !== userId) {
          setSessionId(s.id);
          setCards(generateDeck(s.question));
          setFlippedIds([]);
          setMoves(0);
          setIsComplete(false);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [coupleId, userId]);

  // Broadcast channel for card flips
  useEffect(() => {
    if (!sessionId || !userId) return;

    const channel = supabase.channel(`mm-play-${sessionId}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "flip" }, ({ payload }) => {
        if (payload.userId === userId) return;
        handleFlip(payload.cardId, true);
      })
      .on("broadcast", { event: "match" }, ({ payload }) => {
        setCards((prev) => {
          const next = prev.map((c) =>
            c.id === payload.a || c.id === payload.b ? { ...c, matched: true, flipped: true } : c
          );
          if (next.every((c) => c.matched)) setIsComplete(true);
          return next;
        });
        setFlippedIds([]);
      })
      .on("broadcast", { event: "no-match" }, ({ payload }) => {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === payload.a || c.id === payload.b ? { ...c, flipped: false } : c
            )
          );
          setFlippedIds([]);
        }, 600);
      })
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [sessionId, userId]);

  const handleFlip = useCallback((id: number, isRemote = false) => {
    if (isProcessing.current) return;

    setCards((prev) => {
      const card = prev[id];
      if (!card || card.flipped || card.matched) return prev;
      return prev.map((c) => (c.id === id ? { ...c, flipped: true } : c));
    });

    setFlippedIds((prev) => {
      if (prev.length >= 2) return prev;
      const card = cards[id];
      if (!card || card.flipped || card.matched) return prev;

      const next = [...prev, id];

      if (!isRemote) {
        channelRef.current?.send({
          type: "broadcast",
          event: "flip",
          payload: { cardId: id, userId },
        });
      }

      if (next.length === 2) {
        isProcessing.current = true;
        setMoves((m) => m + 1);
        const [a, b] = next;

        // Use the current cards state via closure
        setTimeout(() => {
          setCards((currentCards) => {
            if (currentCards[a].emoji === currentCards[b].emoji) {
              // Match!
              if (!isRemote) {
                channelRef.current?.send({
                  type: "broadcast",
                  event: "match",
                  payload: { a, b },
                });
              }
              const updated = currentCards.map((c) =>
                c.id === a || c.id === b ? { ...c, matched: true } : c
              );
              if (updated.every((c) => c.matched)) setIsComplete(true);
              setFlippedIds([]);
              isProcessing.current = false;
              return updated;
            } else {
              // No match
              if (!isRemote) {
                channelRef.current?.send({
                  type: "broadcast",
                  event: "no-match",
                  payload: { a, b },
                });
              }
              setTimeout(() => {
                setCards((p) =>
                  p.map((c) =>
                    c.id === a || c.id === b ? { ...c, flipped: false } : c
                  )
                );
                setFlippedIds([]);
                isProcessing.current = false;
              }, 600);
              return currentCards;
            }
          });
        }, 500);
      }

      return next;
    });
  }, [cards, userId]);

  if (coupleLoading || cards.length === 0) {
    return (
      <GameLayout title="Memory Match" emoji="🃏">
        <p className="text-center text-muted-foreground font-handwritten text-xl">Memuat...</p>
      </GameLayout>
    );
  }

  return (
    <GameLayout title="Memory Match" emoji="🃏">
      <div className="text-center mb-6">
        <span className="font-handwritten text-xl text-muted-foreground">
          Langkah: {moves}
        </span>
      </div>

      {isComplete ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-handwritten text-4xl text-foreground">Selesai! 🎉</h2>
          <p className="font-handwritten text-xl text-muted-foreground">
            Kalian menyelesaikannya dalam {moves} langkah
          </p>
          <Button onClick={initGame} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Main Lagi
          </Button>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {cards.map((card) => (
              <motion.button
                key={card.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleFlip(card.id)}
                className={`aspect-square rounded-xl text-4xl flex items-center justify-center transition-all duration-300 ${
                  card.flipped || card.matched
                    ? "bg-primary/20 border-2 border-primary/40"
                    : "bg-card border border-border hover:border-primary/30"
                } ${card.matched ? "opacity-60" : ""}`}
              >
                {card.flipped || card.matched ? (
                  <motion.span
                    initial={{ rotateY: 90 }}
                    animate={{ rotateY: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {card.emoji}
                  </motion.span>
                ) : (
                  <span className="text-muted-foreground text-2xl">?</span>
                )}
              </motion.button>
            ))}
          </div>

          <Button variant="outline" onClick={initGame} className="w-full gap-2 mt-6">
            <RefreshCw className="w-4 h-4" />
            Mulai Ulang
          </Button>
        </>
      )}
    </GameLayout>
  );
};

export default MemoryMatch;
