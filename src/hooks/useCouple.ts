import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useCouple() {
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState("Pasangan");
  const [myName, setMyName] = useState("Aku");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    setUserId(user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, couple_id")
      .eq("user_id", user.id)
      .single();

    if (profile) {
      setMyName(profile.display_name || "Aku");
      if (profile.couple_id) {
        setCoupleId(profile.couple_id);
        const { data: partners } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("couple_id", profile.couple_id)
          .neq("user_id", user.id);
        if (partners?.[0]) {
          setPartnerName(partners[0].display_name || "Pasangan");
        }
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return { coupleId, userId, myName, partnerName, loading };
}
