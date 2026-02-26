import { format } from "date-fns";
import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";

interface NoteCardProps {
  content: string;
  createdAt: string;
  authorName?: string;
  index?: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

const rotations = [1, -1.5, 2, -0.8, 1.2, -2, 0.5, -1];
const colors = [
  "hsl(347 77% 50% / 0.08)",
  "hsl(280 60% 50% / 0.08)",
  "hsl(200 60% 50% / 0.08)",
  "hsl(45 70% 50% / 0.08)",
];

const NoteCard = ({ content, createdAt, authorName, index = 0, onEdit, onDelete }: NoteCardProps) => {
  const rotation = rotations[index % rotations.length];
  const bgColor = colors[index % colors.length];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotate: rotation * 2 }}
      animate={{ opacity: 1, scale: 1, rotate: rotation }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="scrapbook-note rounded-sm group hover:z-10 hover:scale-105 transition-transform duration-300"
      style={{ 
        transform: `rotate(${rotation}deg)`,
        background: `linear-gradient(135deg, ${bgColor}, hsl(var(--card)))`,
      }}
    >
      {/* Pin decoration */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary/60 shadow-md z-10" />
      
      {/* Action buttons */}
      {(onEdit || onDelete) && (
        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
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

      <p className="font-handwritten text-xl text-foreground leading-relaxed mb-3">{content}</p>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {authorName && <span className="font-handwritten text-sm">{authorName}</span>}
        <span className="font-handwritten text-sm">{format(new Date(createdAt), "MMM d, yyyy")}</span>
      </div>
    </motion.div>
  );
};

export default NoteCard;
