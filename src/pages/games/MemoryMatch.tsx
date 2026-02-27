import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import GameLayout from "@/components/games/GameLayout";

const defaultEmojis = ["💕", "🌸", "💌", "🦋", "🌹", "💗", "✨", "🧸"];

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

const MemoryMatch = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const initGame = () => {
    const pairs = defaultEmojis.slice(0, 6);
    const deck = [...pairs, ...pairs]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
    setCards(deck);
    setFlippedIds([]);
    setMoves(0);
    setIsComplete(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    if (flippedIds.length === 2) {
      const [a, b] = flippedIds;
      setMoves((m) => m + 1);

      if (cards[a].emoji === cards[b].emoji) {
        setTimeout(() => {
          setCards((prev) => {
            const next = prev.map((c) =>
              c.id === a || c.id === b ? { ...c, matched: true } : c
            );
            if (next.every((c) => c.matched)) setIsComplete(true);
            return next;
          });
          setFlippedIds([]);
        }, 500);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === a || c.id === b ? { ...c, flipped: false } : c
            )
          );
          setFlippedIds([]);
        }, 800);
      }
    }
  }, [flippedIds]);

  const handleFlip = (id: number) => {
    if (flippedIds.length >= 2) return;
    if (cards[id].flipped || cards[id].matched) return;

    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, flipped: true } : c))
    );
    setFlippedIds((prev) => [...prev, id]);
  };

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
            Kamu menyelesaikannya dalam {moves} langkah
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
