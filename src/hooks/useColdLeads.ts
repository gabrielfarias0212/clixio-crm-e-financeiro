// src/hooks/useColdLeads.ts
// Melhoria #4: detecta leads "frios" — clientes nos estágios iniciais do funil
// que estão sem atualização há mais de COLD_THRESHOLD_DAYS dias.
// Independente de qualquer hook existente; não altera useDashboardAlerts.

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ColdLead {
  id: string;
  name: string;
  salesFunnelStage: string;
  phone: string | null;
  daysSinceUpdate: number;
}

const COLD_THRESHOLD_DAYS = 7; // leads sem contato há mais de 7 dias
const COLD_STAGES = ["primeiro_contato", "orcamento_enviado", "negociacao"];

export function useColdLeads() {
  const [coldLeads, setColdLeads] = useState<ColdLead[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - COLD_THRESHOLD_DAYS);

        const { data, error } = await supabase
          .from("wedding_clients")
          .select("id, name, sales_funnel_stage, phone, updated_at")
          .in("sales_funnel_stage", COLD_STAGES)
          .lt("updated_at", cutoff.toISOString())
          .order("updated_at", { ascending: true })
          .limit(10);

        if (error || !data) return;

        const today = Date.now();
        setColdLeads(
          data.map((c: any) => ({
            id:               c.id,
            name:             c.name,
            salesFunnelStage: c.sales_funnel_stage,
            phone:            c.phone ?? null,
            daysSinceUpdate:  Math.floor((today - new Date(c.updated_at).getTime()) / 86400000),
          }))
        );
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  return { coldLeads, loading };
}
