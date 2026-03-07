import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import PremiumGate from "@/components/PremiumGate";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Check, Palette } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface ThemeOption {
  id: string;
  name: string;
  description: string;
  preview: { bg: string; card: string; primary: string; accent: string };
  cssVars: Record<string, string>;
}

const THEMES: ThemeOption[] = [
  {
    id: "romantic-rose",
    name: "Romantic Rose",
    description: "Tema default dengan nuansa merah mawar yang romantis",
    preview: { bg: "#1a0d10", card: "#1f1215", primary: "#e11d48", accent: "#e11d48" },
    cssVars: {},
  },
  {
    id: "nature-memory",
    name: "Nature Memory",
    description: "Hijau alam yang menenangkan dan hangat",
    preview: { bg: "#0d1a12", card: "#121f16", primary: "#22c55e", accent: "#16a34a" },
    cssVars: {
      "--primary": "142 71% 45%",
      "--accent": "142 71% 45%",
      "--ring": "142 71% 45%",
      "--rose": "142 71% 45%",
      "--rose-soft": "142 50% 55%",
      "--rose-glow": "142 71% 45% / 0.15",
    },
  },
  {
    id: "ocean-dream",
    name: "Ocean Dream",
    description: "Biru laut yang damai dan menyejukkan",
    preview: { bg: "#0d1219", card: "#12171f", primary: "#3b82f6", accent: "#2563eb" },
    cssVars: {
      "--primary": "217 91% 60%",
      "--accent": "217 91% 60%",
      "--ring": "217 91% 60%",
      "--rose": "217 91% 60%",
      "--rose-soft": "217 70% 65%",
      "--rose-glow": "217 91% 60% / 0.15",
    },
  },
  {
    id: "midnight-vintage",
    name: "Midnight Vintage",
    description: "Ungu misterius dengan sentuhan vintage",
    preview: { bg: "#13101a", card: "#18141f", primary: "#a855f7", accent: "#9333ea" },
    cssVars: {
      "--primary": "271 91% 65%",
      "--accent": "271 91% 65%",
      "--ring": "271 91% 65%",
      "--rose": "271 91% 65%",
      "--rose-soft": "271 70% 70%",
      "--rose-glow": "271 91% 65% / 0.15",
    },
  },
  {
    id: "sunset-warmth",
    name: "Sunset Warmth",
    description: "Oranye keemasan seperti matahari terbenam",
    preview: { bg: "#1a1208", card: "#1f170d", primary: "#f59e0b", accent: "#d97706" },
    cssVars: {
      "--primary": "38 92% 50%",
      "--accent": "38 92% 50%",
      "--ring": "38 92% 50%",
      "--rose": "38 92% 50%",
      "--rose-soft": "38 70% 60%",
      "--rose-glow": "38 92% 50% / 0.15",
    },
  },
];

const CustomThemes = () => {
  const { isPremium } = useSubscription();
  const [active, setActive] = useState("romantic-rose");

  useEffect(() => {
    const stored = localStorage.getItem("app-custom-theme");
    if (stored) setActive(stored);
  }, []);

  const applyTheme = (theme: ThemeOption) => {
    const root = document.documentElement;

    // Reset to default first
    THEMES.forEach((t) => {
      Object.keys(t.cssVars).forEach((key) => root.style.removeProperty(key));
    });

    // Apply new theme vars
    Object.entries(theme.cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    setActive(theme.id);
    localStorage.setItem("app-custom-theme", theme.id);
    toast.success(`Tema ${theme.name} diterapkan!`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageTransition>
        <main className="max-w-2xl mx-auto px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-serif text-2xl md:text-3xl text-foreground text-center mb-2">
              Custom Themes 🎨
            </h1>
            <p className="text-muted-foreground text-center text-sm mb-8">
              Pilih tema yang sesuai dengan kisah cinta kalian
            </p>
          </motion.div>

          <PremiumGate isPremium={isPremium} featureName="Custom Themes">
            <div className="grid sm:grid-cols-2 gap-4">
              {THEMES.map((theme, i) => (
                <motion.div
                  key={theme.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <button
                    onClick={() => applyTheme(theme)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      active === theme.id
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    {/* Preview colors */}
                    <div className="flex gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full" style={{ backgroundColor: theme.preview.bg }} />
                      <div className="w-8 h-8 rounded-full" style={{ backgroundColor: theme.preview.card }} />
                      <div className="w-8 h-8 rounded-full" style={{ backgroundColor: theme.preview.primary }} />
                      <div className="w-8 h-8 rounded-full" style={{ backgroundColor: theme.preview.accent }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-serif text-foreground text-sm">{theme.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{theme.description}</p>
                      </div>
                      {active === theme.id && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
          </PremiumGate>
        </main>
      </PageTransition>
    </div>
  );
};

export default CustomThemes;
