import { format, differenceInDays, differenceInHours } from "date-fns";
import { Lock, Unlock, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface FutureLetterCardProps {
  title: string;
  content: string;
  unlockDate: string;
  index?: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

const FutureLetterCard = ({ title, content, unlockDate, index = 0, onEdit, onDelete }: FutureLetterCardProps) => {
  const isUnlocked = new Date(unlockDate) <= new Date();
  const daysLeft = differenceInDays(new Date(unlockDate), new Date());
  const hoursLeft = differenceInHours(new Date(unlockDate), new Date()) % 24;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative overflow-hidden rounded-sm group ${isUnlocked ? 'scrapbook-note' : 'glass-card p-6'}`}
      style={isUnlocked ? {} : { border: '1px dashed hsl(var(--muted-foreground) / 0.3)' }}
    >
      {/* Wax seal decoration */}
      <div className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center ${isUnlocked ? 'bg-primary/20' : 'bg-muted/50'}`}>
        {isUnlocked ? (
          <Unlock className="w-4 h-4 text-primary" />
        ) : (
          <Lock className="w-4 h-4 text-muted-foreground" />
        )}
      </div>

      {/* Action buttons */}
      {(onEdit || onDelete) && (
        <div className="absolute top-3 right-16 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          {onEdit && (
            <button onClick={onEdit} className="p-1.5 rounded-md bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground transition-colors">
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="p-1.5 rounded-md bg-background/80 hover:bg-destructive/90 text-muted-foreground hover:text-destructive-foreground transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      <div className="pr-14">
        <h3 className="font-handwritten text-2xl text-foreground mb-1">{title}</h3>
        <p className="font-handwritten text-sm text-muted-foreground mb-4">
          {isUnlocked ? "💌 Opened" : "🔒 Opens"} {format(new Date(unlockDate), "MMMM d, yyyy")}
        </p>
      </div>

      {isUnlocked ? (
        <p className="font-handwritten text-lg text-foreground/90 leading-relaxed whitespace-pre-wrap">{content}</p>
      ) : (
        <div className="relative py-6">
          <p className="font-handwritten text-lg text-foreground/90 leading-relaxed blur-md select-none pointer-events-none">
            {content}
          </p>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-3">
              <Lock className="w-6 h-6 text-primary/40" />
            </div>
            <p className="font-handwritten text-xl text-muted-foreground">
              {daysLeft > 0 ? `${daysLeft} days ${hoursLeft}h left` : `${hoursLeft}h remaining`}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FutureLetterCard;
