import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Plus, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import MemoryCard from "@/components/MemoryCard";
import EmptyState from "@/components/EmptyState";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Memory {
  id: string;
  title: string;
  content: string | null;
  image_path: string | null;
  memory_date: string;
  user_id: string;
}

const Timeline = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchMemories = async () => {
    const { data, error } = await supabase
      .from("memories")
      .select("*")
      .order("memory_date", { ascending: false });

    if (error) toast.error("Failed to load memories");
    else setMemories(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMemories();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let imagePath: string | null = null;
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const { data: { session } } = await supabase.auth.getSession();
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/upload-image`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${session?.access_token}` },
            body: formData,
          }
        );
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Upload failed");
        imagePath = result.url;
      }

      if (editingId) {
        const updateData: any = { title, content: content || null, memory_date: date };
        if (imagePath) updateData.image_path = imagePath;
        const { error } = await supabase.from("memories").update(updateData).eq("id", editingId);
        if (error) throw error;
        toast.success("Memory updated ❤️");
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("couple_id")
          .eq("user_id", user.id)
          .single();

        if (!profile?.couple_id) throw new Error("No couple profile found");

        const { error } = await supabase.from("memories").insert({
          couple_id: profile.couple_id,
          user_id: user.id,
          title,
          content: content || null,
          image_path: imagePath,
          memory_date: date,
        });
        if (error) throw error;
        toast.success("Memory saved ❤️");
      }

      resetForm();
      fetchMemories();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setDate(new Date().toISOString().split("T")[0]);
    setImageFile(null);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (memory: Memory) => {
    setEditingId(memory.id);
    setTitle(memory.title);
    setContent(memory.content || "");
    setDate(memory.memory_date);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from("memories").delete().eq("id", deleteId);
      if (error) throw error;
      toast.success("Memory deleted");
      fetchMemories();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageTransition>
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="font-serif text-3xl text-foreground">Timeline</h1>
              <p className="font-handwritten text-lg text-muted-foreground mt-1">our precious moments ✨</p>
            </div>
            <button
              onClick={() => showForm ? resetForm() : setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-sm bg-primary text-primary-foreground font-handwritten text-lg hover:opacity-90 transition"
            >
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showForm ? "Cancel" : "Add Memory"}
            </button>
          </div>

          {showForm && (
            <div className="scrapbook-card p-6 mb-10">
              <div className="tape-strip -top-2.5 left-8 rotate-[-5deg]" />
              <div className="tape-strip -top-2.5 right-8 rotate-[3deg]" />
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <input
                  type="text"
                  placeholder="Title this memory..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-sm bg-secondary border border-border text-foreground font-handwritten text-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
                <textarea
                  placeholder="What happened? (optional)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-sm bg-secondary border border-border text-foreground font-handwritten text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px] resize-none"
                />
                <div className="flex gap-4 flex-wrap">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="px-4 py-3 rounded-sm bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <label className="flex items-center gap-2 px-4 py-3 rounded-sm bg-secondary border border-border text-muted-foreground text-sm cursor-pointer hover:text-foreground transition">
                    <Camera className="w-4 h-4" />
                    <span className="font-handwritten text-base">{imageFile ? imageFile.name : "📷 Upload photo"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-sm bg-primary text-primary-foreground font-handwritten text-xl hover:opacity-90 transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingId ? "✏️ Update memory" : "📌 Pin this memory"}
                </button>
              </form>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : memories.length === 0 ? (
            <EmptyState
              icon={<Camera className="w-12 h-12" />}
              title="No memories yet"
              description="Start pinning your precious moments together 📌"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
              {memories.map((memory, i) => (
                <MemoryCard
                  key={memory.id}
                  title={memory.title}
                  content={memory.content}
                  imageUrl={memory.image_path}
                  date={memory.memory_date}
                  index={i}
                  onEdit={memory.user_id === currentUserId ? () => handleEdit(memory) : undefined}
                  onDelete={memory.user_id === currentUserId ? () => setDeleteId(memory.id) : undefined}
                />
              ))}
            </div>
          )}
        </main>
      </PageTransition>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this memory?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Timeline;
