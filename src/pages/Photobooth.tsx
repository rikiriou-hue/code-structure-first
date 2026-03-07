import { useRef, useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import PremiumGate from "@/components/PremiumGate";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Camera, Download, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const ACCESSORIES = [
  { id: "none", label: "Tanpa", emoji: "❌" },
  { id: "crown", label: "Mahkota", emoji: "👑" },
  { id: "hearts", label: "Hati", emoji: "💕" },
  { id: "glasses", label: "Kacamata", emoji: "🕶️" },
  { id: "stars", label: "Bintang", emoji: "⭐" },
  { id: "flowers", label: "Bunga", emoji: "🌸" },
  { id: "sparkle", label: "Sparkle", emoji: "✨" },
  { id: "ribbon", label: "Pita", emoji: "🎀" },
  { id: "butterfly", label: "Kupu-kupu", emoji: "🦋" },
];

const FRAMES = [
  { id: "none", label: "Tanpa", color: "transparent" },
  { id: "rose", label: "Rose", color: "hsl(347, 77%, 50%)" },
  { id: "gold", label: "Gold", color: "hsl(45, 80%, 50%)" },
  { id: "ocean", label: "Ocean", color: "hsl(200, 70%, 50%)" },
  { id: "lavender", label: "Lavender", color: "hsl(270, 50%, 60%)" },
];

const Photobooth = () => {
  const { isPremium } = useSubscription();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [accessory, setAccessory] = useState("none");
  const [frame, setFrame] = useState("none");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreaming(true);
      }
    } catch {
      toast.error("Tidak bisa mengakses kamera");
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
      setStreaming(false);
    }
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d")!;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Mirror for selfie
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Draw frame
    const selectedFrame = FRAMES.find((f) => f.id === frame);
    if (selectedFrame && frame !== "none") {
      ctx.strokeStyle = selectedFrame.color;
      ctx.lineWidth = 12;
      ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);
    }

    // Draw accessory overlays
    const acc = ACCESSORIES.find((a) => a.id === accessory);
    if (acc && accessory !== "none") {
      ctx.font = `${Math.floor(canvas.width / 8)}px serif`;
      ctx.textAlign = "center";

      switch (accessory) {
        case "crown":
          ctx.fillText("👑", canvas.width / 2, canvas.height * 0.15);
          break;
        case "hearts":
          ctx.fillText("💕", canvas.width * 0.15, canvas.height * 0.12);
          ctx.fillText("💕", canvas.width * 0.85, canvas.height * 0.12);
          ctx.font = `${Math.floor(canvas.width / 12)}px serif`;
          ctx.fillText("💗", canvas.width * 0.5, canvas.height * 0.08);
          break;
        case "glasses":
          ctx.fillText("🕶️", canvas.width / 2, canvas.height * 0.45);
          break;
        case "stars":
          ctx.font = `${Math.floor(canvas.width / 12)}px serif`;
          ctx.fillText("⭐", canvas.width * 0.1, canvas.height * 0.1);
          ctx.fillText("⭐", canvas.width * 0.9, canvas.height * 0.15);
          ctx.fillText("⭐", canvas.width * 0.15, canvas.height * 0.9);
          ctx.fillText("⭐", canvas.width * 0.85, canvas.height * 0.85);
          break;
        case "flowers":
          ctx.font = `${Math.floor(canvas.width / 10)}px serif`;
          ctx.fillText("🌸", canvas.width * 0.1, canvas.height * 0.1);
          ctx.fillText("🌺", canvas.width * 0.9, canvas.height * 0.1);
          ctx.fillText("🌷", canvas.width * 0.1, canvas.height * 0.95);
          ctx.fillText("🌼", canvas.width * 0.9, canvas.height * 0.95);
          break;
        case "sparkle":
          ctx.font = `${Math.floor(canvas.width / 12)}px serif`;
          for (let i = 0; i < 6; i++) {
            ctx.fillText("✨", Math.random() * canvas.width, Math.random() * canvas.height);
          }
          break;
        case "ribbon":
          ctx.fillText("🎀", canvas.width / 2, canvas.height * 0.1);
          break;
        case "butterfly":
          ctx.font = `${Math.floor(canvas.width / 10)}px serif`;
          ctx.fillText("🦋", canvas.width * 0.2, canvas.height * 0.15);
          ctx.fillText("🦋", canvas.width * 0.8, canvas.height * 0.2);
          break;
      }
    }

    // Watermark
    ctx.font = `${Math.floor(canvas.width / 30)}px sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.textAlign = "right";
    ctx.fillText("Our Story 💕", canvas.width - 10, canvas.height - 10);

    setPhoto(canvas.toDataURL("image/png"));
    stopCamera();
  };

  const downloadPhoto = () => {
    if (!photo) return;
    const link = document.createElement("a");
    link.download = `our-story-photobooth-${Date.now()}.png`;
    link.href = photo;
    link.click();
    toast.success("Foto tersimpan!");
  };

  const retake = () => {
    setPhoto(null);
    startCamera();
  };

  const switchCamera = () => {
    stopCamera();
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  useEffect(() => {
    if (!photo && facingMode) startCamera();
  }, [facingMode, photo, startCamera]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageTransition>
        <main className="max-w-2xl mx-auto px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-serif text-2xl md:text-3xl text-foreground text-center mb-2">
              Photobooth 📸
            </h1>
            <p className="text-muted-foreground text-center text-sm mb-8">
              Ambil foto bersama dengan aksesori lucu!
            </p>
          </motion.div>

          <PremiumGate isPremium={isPremium} featureName="Photobooth">
            <div className="space-y-6">
              {/* Camera / Photo view */}
              <div className="relative aspect-[4/3] bg-secondary rounded-xl overflow-hidden">
                {!photo ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
                  />
                ) : (
                  <img src={photo} alt="Photo" className="w-full h-full object-cover" />
                )}
                <canvas ref={canvasRef} className="hidden" />

                {/* Live accessory preview overlay */}
                {!photo && streaming && accessory !== "none" && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {accessory === "crown" && <span className="absolute top-[8%] text-6xl md:text-7xl">👑</span>}
                    {accessory === "hearts" && (
                      <>
                        <span className="absolute top-[5%] left-[10%] text-5xl">💕</span>
                        <span className="absolute top-[5%] right-[10%] text-5xl">💕</span>
                      </>
                    )}
                    {accessory === "glasses" && <span className="absolute top-[38%] text-6xl md:text-7xl">🕶️</span>}
                    {accessory === "stars" && (
                      <>
                        <span className="absolute top-[5%] left-[5%] text-3xl">⭐</span>
                        <span className="absolute top-[8%] right-[5%] text-3xl">⭐</span>
                        <span className="absolute bottom-[5%] left-[10%] text-3xl">⭐</span>
                        <span className="absolute bottom-[10%] right-[10%] text-3xl">⭐</span>
                      </>
                    )}
                    {accessory === "flowers" && (
                      <>
                        <span className="absolute top-[3%] left-[5%] text-4xl">🌸</span>
                        <span className="absolute top-[3%] right-[5%] text-4xl">🌺</span>
                        <span className="absolute bottom-[3%] left-[5%] text-4xl">🌷</span>
                        <span className="absolute bottom-[3%] right-[5%] text-4xl">🌼</span>
                      </>
                    )}
                    {accessory === "sparkle" && (
                      <>
                        <span className="absolute top-[10%] left-[20%] text-3xl animate-pulse">✨</span>
                        <span className="absolute top-[30%] right-[15%] text-3xl animate-pulse" style={{ animationDelay: "0.3s" }}>✨</span>
                        <span className="absolute bottom-[20%] left-[10%] text-3xl animate-pulse" style={{ animationDelay: "0.6s" }}>✨</span>
                        <span className="absolute top-[15%] right-[30%] text-3xl animate-pulse" style={{ animationDelay: "0.9s" }}>✨</span>
                      </>
                    )}
                    {accessory === "ribbon" && <span className="absolute top-[3%] text-6xl">🎀</span>}
                    {accessory === "butterfly" && (
                      <>
                        <span className="absolute top-[8%] left-[15%] text-4xl">🦋</span>
                        <span className="absolute top-[12%] right-[15%] text-4xl">🦋</span>
                      </>
                    )}
                  </div>
                )}

                {/* Frame preview */}
                {!photo && frame !== "none" && (
                  <div
                    className="absolute inset-0 pointer-events-none border-[6px] rounded-xl"
                    style={{ borderColor: FRAMES.find((f) => f.id === frame)?.color }}
                  />
                )}
              </div>

              {/* Accessories selector */}
              <div>
                <p className="font-handwritten text-base text-foreground mb-2">Aksesori</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {ACCESSORIES.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => setAccessory(acc.id)}
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors shrink-0 ${
                        accessory === acc.id
                          ? "bg-primary/20 text-primary border border-primary/30"
                          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                      }`}
                    >
                      <span className="text-xl">{acc.emoji}</span>
                      <span className="text-[10px]">{acc.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Frame selector */}
              <div>
                <p className="font-handwritten text-base text-foreground mb-2">Bingkai</p>
                <div className="flex gap-2">
                  {FRAMES.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFrame(f.id)}
                      className={`w-10 h-10 rounded-full border-2 transition-transform ${
                        frame === f.id ? "scale-110 ring-2 ring-primary" : ""
                      }`}
                      style={{
                        backgroundColor: f.id === "none" ? "hsl(var(--secondary))" : f.color,
                        borderColor: f.id === "none" ? "hsl(var(--border))" : f.color,
                      }}
                      title={f.label}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {!photo ? (
                  <>
                    <Button onClick={takePhoto} disabled={!streaming} className="flex-1 gap-2">
                      <Camera className="w-4 h-4" /> Ambil Foto
                    </Button>
                    <Button onClick={switchCamera} variant="outline" size="icon">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={downloadPhoto} className="flex-1 gap-2">
                      <Download className="w-4 h-4" /> Simpan Foto
                    </Button>
                    <Button onClick={retake} variant="outline" className="flex-1 gap-2">
                      <Camera className="w-4 h-4" /> Foto Ulang
                    </Button>
                  </>
                )}
              </div>
            </div>
          </PremiumGate>
        </main>
      </PageTransition>
    </div>
  );
};

export default Photobooth;
