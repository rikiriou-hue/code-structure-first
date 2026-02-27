import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";

interface GameLayoutProps {
  title: string;
  emoji: string;
  children: React.ReactNode;
}

const GameLayout = ({ title, emoji, children }: GameLayoutProps) => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px]" />

      <Navbar />

      <PageTransition>
        <main className="max-w-3xl mx-auto px-6 py-12 relative z-10">
          <Link
            to="/couple-games"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-handwritten text-lg">Couple Games</span>
          </Link>

          <div className="text-center mb-10">
            <span className="text-4xl mb-2 block">{emoji}</span>
            <h1 className="text-4xl md:text-5xl text-gradient-rose drop-shadow-lg">
              {title}
            </h1>
          </div>

          {children}
        </main>
      </PageTransition>
    </div>
  );
};

export default GameLayout;
