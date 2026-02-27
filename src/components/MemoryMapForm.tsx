import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Camera, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "first_date", label: "First Date", emoji: "💑" },
  { value: "first_kiss", label: "First Kiss", emoji: "💋" },
  { value: "first_trip", label: "First Trip", emoji: "✈️" },
  { value: "favorite_spot", label: "Favorite Spot", emoji: "⭐" },
  { value: "anniversary", label: "Anniversary", emoji: "🎉" },
];

interface Props {
  clickedPos: { lat: number; lng: number };
  onSuccess: () => void;
  onCancel: () => void;
}

const MemoryMapForm = ({ clickedPos, onSuccess, onCancel }: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("first_date");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran foto maksimal 5MB");
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return null;
    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const formData = new FormData();
      formData.append("file", photoFile);

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/upload-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      const { url } = await res.json();
      return url;
    } catch (err: any) {
      toast.error("Gagal upload foto: " + err.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("couple_id")
        .eq("user_id", user.id)
        .single();

      if (!profile?.couple_id) throw new Error("No couple found");

      let photoUrl: string | null = null;
      if (photoFile) {
        photoUrl = await uploadPhoto();
      }

      const { error } = await supabase.from("memory_locations").insert({
        couple_id: profile.couple_id,
        user_id: user.id,
        title,
        description: description || null,
        category,
        latitude: clickedPos.lat,
        longitude: clickedPos.lng,
        memory_date: date,
        photo_url: photoUrl,
      });

      if (error) throw error;
      toast.success("Lokasi ditandai! 📍");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="scrapbook-card p-6 mb-8">
      <div className="tape-strip -top-2.5 left-8 rotate-[-5deg]" />
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <p className="font-handwritten text-base text-muted-foreground">
          📍 Lokasi: {clickedPos.lat.toFixed(4)}, {clickedPos.lng.toFixed(4)}
        </p>
        <input
          type="text"
          placeholder="Nama tempat..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 rounded-sm bg-secondary border border-border text-foreground font-handwritten text-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          required
        />
        <textarea
          placeholder="Ceritakan kenangan di sini... (opsional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-3 rounded-sm bg-secondary border border-border text-foreground font-handwritten text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px] resize-none"
        />

        {/* Photo upload */}
        {/* <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />
          {photoPreview ? (
            <div className="relative inline-block">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-sm border border-border"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:opacity-80 transition"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-3 rounded-sm bg-secondary border border-dashed border-border text-muted-foreground font-handwritten text-base hover:border-primary/50 transition"
            >
              <Camera className="w-4 h-4" /> Tambah foto (opsional)
            </button>
          )}
        </div> */}

        <div className="flex gap-4 flex-wrap">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-3 rounded-sm bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.emoji} {cat.label}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-3 rounded-sm bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button
          type="submit"
          disabled={submitting || uploading}
          className="w-full py-3 rounded-sm bg-primary text-primary-foreground font-handwritten text-xl hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting || uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {uploading ? "Mengupload foto..." : "Menyimpan..."}
            </>
          ) : (
            "📌 Tandai lokasi ini"
          )}
        </button>
      </form>
    </div>
  );
};

export default MemoryMapForm;