import { useState } from "react";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import PremiumGate from "@/components/PremiumGate";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Loader2, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const moods = [
  { value: "romantic", label: "💕 Romantis & Manis" },
  { value: "passionate", label: "🔥 Penuh Gairah" },
  { value: "nostalgic", label: "🌅 Nostalgia" },
  { value: "playful", label: "😊 Ceria & Lucu" },
  { value: "poetic", label: "🌹 Puitis & Dalam" },
];

const AILoveLetter = () => {
  const { isPremium, isLoading: subLoading } = useSubscription();
  const [partnerName, setPartnerName] = useState("");
  const [mood, setMood] = useState("romantic");
  const [letter, setLetter] = useState("");
  const [generating, setGenerating] = useState(false);

  const generateLetter = async () => {
    setGenerating(true);
    setLetter("");

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-love-letter`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ partnerName, mood, language: "Indonesian" }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "Gagal generate surat");
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setLetter(fullText);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat surat cinta");
    } finally {
      setGenerating(false);
    }
  };

  const copyLetter = () => {
    navigator.clipboard.writeText(letter);
    toast.success("Surat disalin ke clipboard!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageTransition>
        <main className="max-w-2xl mx-auto px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-serif text-2xl md:text-3xl text-foreground text-center mb-2">
              AI Love Letter 💌
            </h1>
            <p className="text-muted-foreground text-center text-sm mb-8">
              Biarkan AI menulis surat cinta yang indah untuk pasanganmu
            </p>
          </motion.div>

          <PremiumGate isPremium={isPremium} featureName="AI Love Letter">
            <div className="scrapbook-card p-6 space-y-5">
              <div className="space-y-2">
                <Label className="font-handwritten text-base">Nama Pasangan</Label>
                <Input
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="Masukkan nama pasanganmu..."
                />
              </div>

              <div className="space-y-2">
                <Label className="font-handwritten text-base">Mood / Tema</Label>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {moods.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={generateLetter} disabled={generating} className="w-full gap-2">
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
                {generating ? "Menulis..." : "Generate Surat Cinta"}
              </Button>

              {letter && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mt-6 p-6 bg-secondary/50 rounded-lg border border-border">
                  <p className="font-handwritten text-lg leading-relaxed whitespace-pre-wrap text-foreground">
                    {letter}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" onClick={copyLetter} className="gap-1">
                      <Copy className="w-3 h-3" /> Salin
                    </Button>
                    <Button size="sm" variant="outline" onClick={generateLetter} disabled={generating} className="gap-1">
                      <RefreshCw className="w-3 h-3" /> Buat Lagi
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </PremiumGate>
        </main>
      </PageTransition>
    </div>
  );
};

export default AILoveLetter;
