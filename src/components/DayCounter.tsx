import { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";

interface Props {
  initialStartDate?: string;
}

const STORAGE_KEY = "together_start_date";
const MILESTONE_KEY = "together_milestones";

const DayCounter = ({ initialStartDate }: Props) => {
  const [startDate, setStartDate] = useState<string>("");
  const [days, setDays] = useState(0);
  const [animatedDays, setAnimatedDays] = useState(0);
  const [specialMessage, setSpecialMessage] = useState<string | null>(null);
  const triggeredMilestones = useRef<number[]>([]);

  // Load from localStorage or fallback from props
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const milestoneSaved = localStorage.getItem(MILESTONE_KEY);

    if (saved) {
      setStartDate(saved);
    } else if (initialStartDate) {
      setStartDate(initialStartDate);
    }

    if (milestoneSaved) {
      triggeredMilestones.current = JSON.parse(milestoneSaved);
    }
  }, [initialStartDate]);

  // Save startDate
  useEffect(() => {
    if (startDate) {
      localStorage.setItem(STORAGE_KEY, startDate);
    }
  }, [startDate]);

  // Calculate days
  useEffect(() => {
    if (!startDate) return;

    const calculate = () => {
      const start = new Date(startDate);
      const now = new Date();
      const diff = Math.floor(
        (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      setDays(diff >= 0 ? diff : 0);
    };

    calculate();
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);
  }, [startDate]);

  // Count-up animation
  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = days / (duration / 16);

    const animate = () => {
      start += increment;
      if (start < days) {
        setAnimatedDays(Math.floor(start));
        requestAnimationFrame(animate);
      } else {
        setAnimatedDays(days);
      }
    };

    animate();
  }, [days]);

  // Milestones
  useEffect(() => {
    if (!days) return;

    const trigger = (milestone: number) => {
      if (!triggeredMilestones.current.includes(milestone)) {
        triggeredMilestones.current.push(milestone);
        localStorage.setItem(
          MILESTONE_KEY,
          JSON.stringify(triggeredMilestones.current)
        );
        return true;
      }
      return false;
    };

    if (days === 30 && trigger(30)) {
      confetti({ particleCount: 120, spread: 70 });
    }

    if (days === 100 && trigger(100)) {
      setSpecialMessage("💌 100 days of choosing each other, every single day.");
    }

    if (days === 365 && trigger(365)) {
      confetti({ particleCount: 400, spread: 150 });
    }
  }, [days]);

  return (
    <div className="text-center py-10 relative">

      {/* Editable Date */}
      <div className="mb-6">
        <input
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            setSpecialMessage(null);
          }}
          className="px-4 py-2 rounded-xl border border-primary/30 bg-background text-center"
        />
      </div>

      <p className="font-handwritten text-xl text-muted-foreground mb-2">
        Together for
      </p>

      <div
        className={`flex items-baseline justify-center gap-3 transition-all duration-700 ${
          days === 365 ? "scale-110 animate-pulse text-pink-500" : ""
        }`}
      >
        <span className="text-7xl md:text-8xl font-serif font-bold text-gradient-rose">
          {animatedDays}
        </span>
        <span className="font-handwritten text-3xl text-muted-foreground">
          days
        </span>
      </div>

      <p className="font-handwritten text-lg text-primary/50 mt-2">
        & counting ♡
      </p>

      {specialMessage && (
        <div className="mt-6 text-lg text-pink-500 animate-fade-in">
          {specialMessage}
        </div>
      )}
    </div>
  );
};

export default DayCounter;