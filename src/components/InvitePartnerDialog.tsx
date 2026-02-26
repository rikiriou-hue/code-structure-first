import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { UserPlus, Copy, Check } from "lucide-react";

interface InvitePartnerDialogProps {
  coupleId: string;
  onJoined?: () => void;
}

const InvitePartnerDialog = ({ coupleId, onJoined }: InvitePartnerDialogProps) => {
  const [open, setOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateCode = async () => {
    setLoading(true);
    try {
      // Generate code via DB function
      const { data: codeData, error: codeError } = await supabase.rpc("generate_invite_code");
      if (codeError) throw codeError;

      const code = codeData as string;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Insert invite
      const { error: insertError } = await supabase
        .from("couple_invites" as any)
        .insert({
          couple_id: coupleId,
          invited_by: user.id,
          code,
        } as any);

      if (insertError) throw insertError;

      setInviteCode(code);
      toast.success("Kode undangan berhasil dibuat!");
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat kode undangan");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    if (!inviteCode) return;
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    toast.success("Kode disalin!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("accept_invite", {
        invite_code: joinCode.trim().toUpperCase(),
      });
      if (error) throw error;

      const result = data as any;
      if (result.success) {
        toast.success("Berhasil bergabung dengan pasangan! 🎉");
        setOpen(false);
        onJoined?.();
      } else {
        toast.error(result.error || "Gagal bergabung");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal bergabung");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="scrapbook-card p-8 flex flex-col items-center text-center group relative w-full">
          <div className="scrapbook-sticker -top-4 -right-2" style={{ transform: "rotate(8deg)" }}>
            💑
          </div>
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:scale-110 transition-transform duration-300">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="font-handwritten text-3xl text-foreground mb-2">Invite Partner</h2>
          <p className="font-handwritten text-base text-muted-foreground">Undang atau gabung pasanganmu</p>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-handwritten text-2xl">Invite Partner 💕</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="invite" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="invite">Undang</TabsTrigger>
            <TabsTrigger value="join">Gabung</TabsTrigger>
          </TabsList>

          <TabsContent value="invite" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Buat kode undangan dan bagikan ke pasanganmu agar bisa bergabung.
            </p>
            {!inviteCode ? (
              <Button onClick={generateCode} disabled={loading} className="w-full">
                {loading ? "Membuat kode..." : "Buat Kode Undangan"}
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-md px-4 py-3 text-center font-mono text-2xl tracking-widest font-bold">
                    {inviteCode}
                  </div>
                  <Button variant="outline" size="icon" onClick={copyCode}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Kode berlaku selama 7 hari
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="join" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Masukkan kode undangan dari pasanganmu untuk bergabung.
            </p>
            <Input
              placeholder="Masukkan kode (6 karakter)"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="text-center font-mono text-xl tracking-widest"
            />
            <Button
              onClick={handleJoin}
              disabled={loading || joinCode.length < 6}
              className="w-full"
            >
              {loading ? "Menggabungkan..." : "Gabung 💕"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default InvitePartnerDialog;
