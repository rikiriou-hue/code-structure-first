import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Users, Crown, LogOut, UserMinus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Member {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  is_host: boolean;
  created_at: string;
}

interface CoupleMembersProps {
  onChanged?: () => void;
}

const CoupleMembers = ({ onChanged }: CoupleMembersProps) => {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMembers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);

    const { data, error } = await supabase.rpc("get_couple_members");
    if (!error && data) {
      setMembers(data as unknown as Member[]);
    }
  };

  useEffect(() => {
    if (open) fetchMembers();
  }, [open]);

  const currentMember = members.find(m => m.user_id === currentUserId);
  const isHost = currentMember?.is_host ?? false;

  const handleLeave = async () => {
    if (!confirm("Yakin ingin keluar dari pasangan ini?")) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("leave_couple");
      if (error) throw error;
      const result = data as any;
      if (result.success) {
        toast.success("Berhasil keluar dari pasangan");
        setOpen(false);
        onChanged?.();
      } else {
        toast.error(result.error);
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal keluar");
    } finally {
      setLoading(false);
    }
  };

  const handleKick = async (targetUserId: string, name: string) => {
    if (!confirm(`Yakin ingin mengeluarkan ${name || "partner"}?`)) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("kick_partner", {
        target_user: targetUserId,
      });
      if (error) throw error;
      const result = data as any;
      if (result.success) {
        toast.success("Partner berhasil dikeluarkan");
        fetchMembers();
        onChanged?.();
      } else {
        toast.error(result.error);
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal mengeluarkan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">
          <Users className="w-4 h-4" />
          Anggota
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-handwritten text-2xl">Anggota Pasangan 💑</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          {members.map((member) => (
            <div
              key={member.user_id}
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border"
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src={member.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-handwritten text-lg">
                  {(member.display_name || "?")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-sans text-sm font-medium text-foreground truncate">
                    {member.display_name || "Tanpa Nama"}
                  </span>
                  {member.is_host && (
                    <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      <Crown className="w-3 h-3" /> Host
                    </span>
                  )}
                  {member.user_id === currentUserId && (
                    <span className="text-xs text-muted-foreground">(Kamu)</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              {members.length >= 2 && member.user_id === currentUserId && !isHost && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLeave}
                  disabled={loading}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Keluar
                </Button>
              )}
              {members.length >= 2 && member.user_id !== currentUserId && isHost && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleKick(member.user_id, member.display_name || "")}
                  disabled={loading}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <UserMinus className="w-4 h-4 mr-1" />
                  Kick
                </Button>
              )}
            </div>
          ))}

          {members.length < 2 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              Belum ada pasangan. Undang seseorang untuk bergabung! 💕
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CoupleMembers;
