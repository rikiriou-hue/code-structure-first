import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { useSubscription, PREMIUM_PRICE_ID } from "@/hooks/useSubscription";
import { Check, Crown, Heart, Sparkles, Camera, Palette, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const freeFeatures = [
  "5 foto memories",
  "Love notes tanpa batas",
  "Timeline pasangan",
  "Memory map",
  "Mini games dasar",
];

const premiumFeatures = [
  "Unlimited foto memories",
  "AI Love Letter generator",
  "Photobooth dengan aksesori",
  "Custom themes eksklusif",
  "Semua fitur gratis",
  "Prioritas support",
];

const Pricing = () => {
  const { isPremium, isLoading, checkout, manageSubscription } = useSubscription();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageTransition>
        <main className="max-w-4xl mx-auto px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-3">
              Upgrade ke <span className="text-gradient-rose">Premium</span>
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Buat kisah cinta kalian lebih spesial dengan fitur-fitur premium eksklusif
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free Plan */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="scrapbook-card p-6">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="w-5 h-5 text-primary" />
                <h2 className="font-serif text-xl text-foreground">Free</h2>
              </div>
              <div className="mb-6">
                <span className="text-3xl font-bold text-foreground">$0</span>
                <span className="text-muted-foreground text-sm">/bulan</span>
              </div>
              <ul className="space-y-3 mb-6">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {!isPremium && (
                <Button variant="outline" className="w-full" disabled>
                  Plan Saat Ini
                </Button>
              )}
            </motion.div>

            {/* Premium Plan */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="scrapbook-card p-6 ring-2 ring-amber-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
                POPULER
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-5 h-5 text-amber-400" />
                <h2 className="font-serif text-xl text-foreground">Premium</h2>
              </div>
              <div className="mb-6">
                <span className="text-3xl font-bold text-foreground">$4.99</span>
                <span className="text-muted-foreground text-sm">/bulan</span>
              </div>
              <ul className="space-y-3 mb-6">
                {premiumFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {isLoading ? (
                <Button className="w-full" disabled><Loader2 className="w-4 h-4 animate-spin" /></Button>
              ) : isPremium ? (
                <Button onClick={manageSubscription} variant="outline" className="w-full gap-2">
                  <Crown className="w-4 h-4" /> Kelola Langganan
                </Button>
              ) : (
                <Button onClick={checkout} className="w-full gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
                  <Crown className="w-4 h-4" /> Mulai Premium
                </Button>
              )}
            </motion.div>
          </div>

          {/* Feature highlights */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="mt-16 grid sm:grid-cols-3 gap-6">
            {[
              { icon: Sparkles, title: "AI Love Letter", desc: "Surat cinta yang dihasilkan AI, personal dan romantis" },
              { icon: Camera, title: "Photobooth", desc: "Foto bersama dengan aksesori lucu yang bisa diganti-ganti" },
              { icon: Palette, title: "Custom Themes", desc: "Tema eksklusif untuk membuat tampilan lebih unik" },
            ].map((item) => (
              <div key={item.title} className="glass-card p-5 text-center">
                <item.icon className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                <h3 className="font-serif text-foreground mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </main>
      </PageTransition>
    </div>
  );
};

export default Pricing;
