import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Plus, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import FutureLetterCard from "@/components/FutureLetterCard";
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

interface Letter {
  id: string;
  title: string;
  content: string;
  unlock_date: string;
  user_id: string;
}

const FutureLetters = () => {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchLetters = async () => {
    const { data, error } = await supabase
      .from("future_letters")
      .select("*")
      .order("unlock_date", { ascending: true });

    if (error) toast.error("Failed to load letters");
    else setLetters(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLetters();
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
          .from("future_letters")
          .update({ title, content, unlock_date: unlockDate })
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Letter updated ❤️");
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("couple_id")
          .eq("user_id", user.id)
          .single();

        if (!profile?.couple_id) throw new Error("No couple profile found");

        const { error } = await supabase.from("future_letters").insert({
          couple_id: profile.couple_id,
          user_id: user.id,
          title,
          content,
          unlock_date: unlockDate,
        });
        if (error) throw error;
        toast.success("Letter sealed ❤️");
      }

      resetForm();
      fetchLetters();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setUnlockDate("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (letter: Letter) => {
    setEditingId(letter.id);
    setTitle(letter.title);
    setContent(letter.content);
    setUnlockDate(letter.unlock_date);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from("future_letters").delete().eq("id", deleteId);
      if (error) throw error;
      toast.success("Letter deleted");
      fetchLetters();
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
        <main className="max-w-3xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="font-serif text-3xl text-foreground">Future Letters</h1>
              <p className="font-handwritten text-lg text-muted-foreground mt-1">sealed with love, opened with time 💌</p>
            </div>
            <button
              onClick={() => showForm ? resetForm() : setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-sm bg-primary text-primary-foreground font-handwritten text-lg hover:opacity-90 transition"
            >
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showForm ? "Cancel" : "Write Letter"}
            </button>
          </div>

          {showForm && (
            <div className="scrapbook-card p-6 mb-10">
              <div className="tape-strip -top-2.5 left-8 rotate-[-5deg]" />
              <div className="tape-strip -top-2.5 right-8 rotate-[3deg]" />
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <input
                  type="text"
                  placeholder="Letter title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-sm bg-secondary border border-border text-foreground font-handwritten text-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
                <textarea
                  placeholder="Write your heart out..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-sm bg-secondary border border-border text-foreground font-handwritten text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[150px] resize-none"
                  required
                />
                <div>
                  <label className="font-handwritten text-base text-muted-foreground mb-1.5 block">
                    🔒 Unlock Date
                  </label>
                  <input
                    type="date"
                    value={unlockDate}
                    onChange={(e) => setUnlockDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-sm bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-sm bg-primary text-primary-foreground font-handwritten text-xl hover:opacity-90 transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingId ? "✏️ Update letter" : "🔐 Seal this letter"}
                </button>
              </form>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : letters.length === 0 ? (
            <EmptyState
              icon={<Mail className="w-12 h-12" />}
              title="No future letters yet"
              description="Write a letter to be unlocked in the future ✉️"
            />
          ) : (
            <div className="space-y-8">
              {letters.map((letter, i) => (
                <FutureLetterCard
                  key={letter.id}
                  title={letter.title}
                  content={letter.content}
                  unlockDate={letter.unlock_date}
                  index={i}
                  onEdit={letter.user_id === currentUserId ? () => handleEdit(letter) : undefined}
                  onDelete={letter.user_id === currentUserId ? () => setDeleteId(letter.id) : undefined}
                />
              ))}
            </div>
          )}
        </main>
      </PageTransition>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this letter?</AlertDialogTitle>
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

export default FutureLetters;
