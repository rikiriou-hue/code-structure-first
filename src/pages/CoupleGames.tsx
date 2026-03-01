import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircleHeart, Brain, Users, Zap, Grid3X3, Dice5 } from "lucide-react";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import Leaderboard from "@/components/games/Leaderboard";

const games = [
  {
    to: "/couple-games/truth-or-love",
    icon: <MessageCircleHeart className="w-7 h-7" />,
    title: "Truth or Love",
    desc: "Pertanyaan romantis & reflektif untuk saling mengenal lebih dalam",
    sticker: "💕",
    rotate: "-2deg",
  },
  {
    to: "/couple-games/love-quiz",
    icon: <Brain className="w-7 h-7" />,
    title: "Love Quiz",
    desc: "Tebak hal-hal tentang pasanganmu, seberapa baik kamu mengenalnya?",
    sticker: "🧠",
    rotate: "1.5deg",
  },
  {
    to: "/couple-games/whos-more-likely",
    icon: <Users className="w-7 h-7" />,
    title: "Who's More Likely",
    desc: "Pilih siapa yang paling mungkin melakukan sesuatu!",
    sticker: "🤭",
    rotate: "-1deg",
  },
  {
    to: "/couple-games/this-or-that",
    icon: <Zap className="w-7 h-7" />,
    title: "This or That",
    desc: "Pilihan cepat untuk mengetahui preferensi pasangan",
    sticker: "⚡",
    rotate: "2deg",
  },
  {
    to: "/couple-games/memory-match",
    icon: <Grid3X3 className="w-7 h-7" />,
    title: "Memory Match",
    desc: "Cocokkan kartu kenangan bersama pasangan",
    sticker: "🃏",
    rotate: "-1.5deg",
  },
  {
    to: "/couple-games/date-planner",
    icon: <Dice5 className="w-7 h-7" />,
    title: "Date Planner",
    desc: "Dapatkan ide kencan acak yang seru!",
    sticker: "🎲",
    rotate: "1deg",
  },
];

const CoupleGames = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px]" />

      <span className="absolute top-20 right-12 text-4xl opacity-20 rotate-12">🎮</span>
      <span className="absolute bottom-24 left-16 text-3xl opacity-20 -rotate-6">💘</span>

      <Navbar />

      <PageTransition>
        <main className="max-w-5xl mx-auto px-6 py-12 relative z-10">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-handwritten text-lg">Kembali</span>
          </Link>

          <div className="text-center mb-14">
            <h1 className="text-5xl md:text-6xl text-gradient-rose drop-shadow-lg mb-3">
              Couple Games
            </h1>
            <p className="font-handwritten text-xl text-muted-foreground">
              Mini games untuk meningkatkan kedekatan 💖
            </p>
          </div>

          {/* Leaderboard */}
          <div className="mb-10">
            <Leaderboard />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {games.map((game, i) => (
              <motion.div
                key={game.to}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={game.to}
                  className="relative block p-7 bg-card rounded-md shadow-2xl hover:scale-[1.04] transition-all duration-500 group h-full"
                  style={{ transform: `rotate(${game.rotate})` }}
                >
                  <div className="absolute inset-2 bg-secondary -z-10 rounded-md rotate-1" />
                  <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-5 rounded-sm rotate-[-2deg]"
                    style={{ background: "hsl(var(--tape) / 0.6)" }}
                  />
                  <div className="absolute -top-4 -right-3 text-2xl rotate-6">
                    {game.sticker}
                  </div>

                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                    {game.icon}
                  </div>

                  <h2 className="font-handwritten text-2xl mb-2">{game.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{game.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </main>
      </PageTransition>
    </div>
  );
};

export default CoupleGames;
