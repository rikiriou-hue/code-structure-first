import { format } from "date-fns";
import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";

interface MemoryCardProps {
  title: string;
  content?: string | null;
  imageUrl?: string | null;
  date: string;
  index?: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

const rotations = [-2, 1.5, -1, 2, -0.5, 1, -1.5, 0.5];
const stickers = ["💕", "✨", "🌸", "💌", "🦋", "🌹", "💗", "🪻"];

const MemoryCard = ({ title, content, imageUrl, date, index = 0, onEdit, onDelete }: MemoryCardProps) => {
  const rotation = rotations[index % rotations.length];
  const sticker = stickers[index % stickers.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: rotation * 2 }}
      animate={{ opacity: 1, y: 0, rotate: rotation }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="scrapbook-card p-1 group"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* Tape decoration */}
      <div className="tape-strip -top-2.5 left-6 rotate-[-8deg]" />
      <div className="tape-strip -top-2.5 right-6 rotate-[5deg]" />
      
      {/* Sticker */}
      <div className="scrapbook-sticker -top-4 -right-3" style={{ transform: `rotate(${rotation * 3}deg)` }}>
        {sticker}
      </div>

      {/* Action buttons */}
      {(onEdit || onDelete) && (
        <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
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

      {imageUrl && (
        <div className="scrapbook-photo m-3">
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        </div>
      )}
      <div className="px-4 pb-4 pt-2">
        <p className="font-handwritten text-xs text-muted-foreground mb-1 tracking-wide">
          {format(new Date(date), "MMMM d, yyyy")}
        </p>
        <h3 className="font-handwritten text-2xl text-foreground mb-1">{title}</h3>
        {content && (
          <p className="text-sm text-muted-foreground leading-relaxed italic">{content}</p>
        )}
      </div>
    </motion.div>
  );
};

export default MemoryCard;
