import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Plus, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import NoteCard from "@/components/NoteCard";
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

interface Note {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
}

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from("love_notes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) toast.error("Failed to load notes");
    else setNotes(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
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

      if (editingId) {
        const { error } = await supabase
          .from("love_notes")
          .update({ content })
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Note updated ❤️");
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("couple_id")
          .eq("user_id", user.id)
          .single();

        if (!profile?.couple_id) throw new Error("No couple profile found");

        const { error } = await supabase.from("love_notes").insert({
          couple_id: profile.couple_id,
          user_id: user.id,
          content,
        });
        if (error) throw error;
        toast.success("Note saved ❤️");
      }

      setContent("");
      setEditingId(null);
      setShowForm(false);
      fetchNotes();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingId(note.id);
    setContent(note.content);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from("love_notes").delete().eq("id", deleteId);
      if (error) throw error;
      toast.success("Note deleted");
      fetchNotes();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleteId(null);
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setContent("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageTransition>
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="font-serif text-3xl text-foreground">Love Notes</h1>
              <p className="font-handwritten text-lg text-muted-foreground mt-1">sweet words between us 💕</p>
            </div>
            <button
              onClick={() => showForm ? cancelForm() : setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-sm bg-primary text-primary-foreground font-handwritten text-lg hover:opacity-90 transition"
            >
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showForm ? "Cancel" : "Write Note"}
            </button>
          </div>

          {showForm && (
            <div className="scrapbook-card p-6 mb-10">
              <div className="tape-strip -top-2.5 left-10 rotate-[-3deg]" />
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <textarea
                  placeholder="Write something sweet..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-sm bg-secondary border border-border text-foreground font-handwritten text-xl focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px] resize-none"
                  required
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-sm bg-primary text-primary-foreground font-handwritten text-xl hover:opacity-90 transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingId ? "✏️ Update note" : "📌 Pin this note"}
                </button>
              </form>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notes.length === 0 ? (
            <EmptyState
              icon={<Heart className="w-12 h-12" />}
              title="No love notes yet"
              description="Leave sweet words for your partner 💌"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note, i) => (
                <NoteCard
                  key={note.id}
                  content={note.content}
                  createdAt={note.created_at}
                  index={i}
                  onEdit={note.user_id === currentUserId ? () => handleEdit(note) : undefined}
                  onDelete={note.user_id === currentUserId ? () => setDeleteId(note.id) : undefined}
                />
              ))}
            </div>
          )}
        </main>
      </PageTransition>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this note?</AlertDialogTitle>
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

export default Notes;
