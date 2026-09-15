import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ProofingNotif {
  totalBadge: number;       // total for sidebar badge
  newSelections: number;    // client finished selecting (awaiting photographer action)
  cleanupReminders: number; // finalized galleries older than 5 days
}

export function useProofingNotifications(): ProofingNotif {
  const [notif, setNotif] = useState<ProofingNotif>({ totalBadge: 0, newSelections: 0, cleanupReminders: 0 });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("proofing_galleries")
        .select("status, finalized_at")
        .eq("user_id", user.id);

      if (!data) return;

      const now = Date.now();
      const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

      const newSelections = data.filter(g => g.status === "selecao_concluida").length;
      const cleanupReminders = data.filter(g =>
        g.status === "finalizado" &&
        g.finalized_at &&
        now - new Date(g.finalized_at).getTime() >= FIVE_DAYS_MS
      ).length;

      setNotif({ totalBadge: newSelections + cleanupReminders, newSelections, cleanupReminders });
    }
    load();

    // Recheck every 10 minutes
    const interval = setInterval(load, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return notif;
}
