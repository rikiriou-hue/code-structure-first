import { Link } from "react-router-dom";
import { Heart, Camera, Mail, MapPin, Lock, Sparkles, Quote } from "lucide-react";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";

const testimonials = [
  {
    name: "Aisyah & Rafi",
    duration: "2 tahun bersama",
    quote: "Our Story bikin kami bisa simpan semua momen manis tanpa takut hilang. Fitur future letters favorit kami! 💌",
    avatar: "🥰",
  },
  {
    name: "Dina & Ari",
    duration: "6 bulan bersama",
    quote: "Setiap hari kami saling kirim love notes. Rasanya seperti punya diary berdua yang cuma kami yang tahu.",
    avatar: "💑",
  },
  {
    name: "Maya & Bima",
    duration: "1 tahun bersama",
    quote: "Memory map-nya keren banget! Semua tempat kencan kami ada di satu peta. Jadi bisa nostalgia kapan aja.",
    avatar: "✨",
  },
];

const galleryImages = [
  { rotate: "-3deg", caption: "Date night 🌙", emoji: "🍕", bg: "from-primary/20 to-accent/10" },
  { rotate: "2deg", caption: "Weekend trip 🏖️", emoji: "🌊", bg: "from-accent/20 to-primary/10" },
  { rotate: "-1deg", caption: "Anniversary 🎂", emoji: "🎉", bg: "from-primary/15 to-accent/15" },
  { rotate: "3deg", caption: "Everyday love 🫶", emoji: "☕", bg: "from-accent/15 to-primary/20" },
];

const features = [
  {
    icon: <Camera className="w-6 h-6" />,
    title: "Timeline Kenangan",
    desc: "Simpan setiap momen spesial bersama pasangan dalam timeline yang indah.",
    sticker: "📸",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Love Notes",
    desc: "Tulis pesan cinta yang manis kapan saja, di mana saja.",
    sticker: "💕",
  },
  {
    icon: <Mail className="w-6 h-6" />,
    title: "Future Letters",
    desc: "Tulis surat untuk dibuka di masa depan bersama.",
    sticker: "💌",
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    title: "Memory Map",
    desc: "Tandai tempat-tempat bersejarah kalian di peta dunia.",
    sticker: "📍",
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6">
        <img
          src={heroBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />

        {/* Floating stickers */}
        <span className="absolute top-20 left-10 text-5xl opacity-15 rotate-12 hidden md:block">🌸</span>
        <span className="absolute bottom-32 right-14 text-4xl opacity-15 -rotate-6 hidden md:block">🧸</span>
        <span className="absolute top-1/3 right-8 text-4xl opacity-15 rotate-6 hidden md:block">💌</span>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 max-w-2xl"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <Sparkles className="w-5 h-5 text-primary/60" />
          </div>

          <h1 className="font-serif text-5xl md:text-7xl text-gradient-rose leading-tight mb-6">
            Our Story
          </h1>

          <p className="font-handwritten text-2xl md:text-3xl text-muted-foreground mb-4">
            Simpan setiap momen cinta kalian
          </p>

          <p className="text-muted-foreground max-w-md mx-auto mb-10 leading-relaxed">
            Tempat pribadi untuk menyimpan kenangan, menulis surat cinta, dan menandai tempat-tempat spesial bersama pasangan.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              <Lock className="w-4 h-4" />
              Masuk / Daftar
            </Link>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 z-10"
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
          </div>
        </motion.div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="relative py-24 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-3xl md:text-5xl text-gradient-rose mb-4">
              Fitur Spesial
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Semua yang kalian butuhkan untuk merawat kisah cinta.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="relative glass-card-hover p-8 group"
              >
                {/* Tape decoration */}
                <div
                  className="absolute -top-3 left-8 w-14 h-5 rounded-sm -rotate-2"
                  style={{ background: "hsl(var(--tape) / 0.5)" }}
                />

                {/* Sticker */}
                <span className="absolute -top-4 -right-3 text-2xl rotate-6 opacity-80">
                  {feature.sticker}
                </span>

                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>

                <h3 className="font-handwritten text-2xl mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== GALLERY ===== */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-3xl md:text-5xl text-gradient-rose mb-4">
              Momen-Momen Indah
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Setiap foto punya cerita. Simpan semuanya di sini.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {galleryImages.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                whileInView={{ opacity: 1, scale: 1, rotate: parseFloat(img.rotate) }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative group"
              >
                <div className="scrapbook-photo aspect-square rounded-sm overflow-hidden">
                  <div className={`w-full h-full bg-gradient-to-br ${img.bg} flex items-center justify-center`}>
                    <span className="text-5xl md:text-6xl group-hover:scale-125 transition-transform duration-300">
                      {img.emoji}
                    </span>
                  </div>
                </div>
                <p className="font-handwritten text-center text-sm text-muted-foreground mt-3">
                  {img.caption}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      {/* <section className="py-24 px-6 relative">
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-3xl md:text-5xl text-gradient-rose mb-4">
              Kata Mereka
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Pasangan-pasangan yang sudah merawat cerita cinta mereka.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="relative glass-card p-8"
                style={{ transform: `rotate(${i % 2 === 0 ? "-1" : "1"}deg)` }}
              >

                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5 rounded-sm"
                  style={{ background: "hsl(var(--tape) / 0.5)", transform: "translateX(-50%) rotate(-2deg)" }}
                />

                <Quote className="w-5 h-5 text-primary/40 mb-3" />

                <p className="text-sm leading-relaxed text-foreground/80 mb-6 italic">
                  "{t.quote}"
                </p>

                <div className="flex items-center gap-3">
                  <span className="text-2xl">{t.avatar}</span>
                  <div>
                    <p className="font-handwritten text-lg">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.duration}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ===== CTA ===== */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-lg mx-auto text-center glass-card p-12"
        >
          <Heart className="w-10 h-10 text-primary fill-primary mx-auto mb-6" />
          <h2 className="font-serif text-3xl md:text-4xl mb-4">
            Mulai Cerita Kalian
          </h2>
          <p className="text-muted-foreground mb-8">
            Buat akun gratis dan mulai simpan kenangan bersama pasangan.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            Mulai Sekarang
          </Link>
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border py-8 px-6 text-center">
        <p className="text-sm text-muted-foreground">
          Made with <Heart className="w-3 h-3 inline text-primary fill-primary" /> Our Story &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;