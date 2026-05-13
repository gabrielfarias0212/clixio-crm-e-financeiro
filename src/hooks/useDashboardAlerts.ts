import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FollowUpAlert {
  id: string;
  clientName: string;
  description: string;
  scheduledDate: string; // YYYY-MM-DD
  daysOverdue: number;
}

export interface BillAlert {
  id: string;
  description: string;
  amount: number;
  dueDayOfMonth: number;
  daysUntilDue: number;
  source: "business" | "personal";
}

export interface DashboardTask {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

// Calcula próxima ocorrência de um dia do mês e retorna quantos dias faltam
function daysUntilDayOfMonth(dayOfMonth: number): number {
  const today = new Date();
  const todayDay = today.getDate();
  const year = today.getFullYear();
  const month = today.getMonth();

  let targetDate: Date;
  if (dayOfMonth >= todayDay) {
    targetDate = new Date(year, month, dayOfMonth);
  } else {
    // Próximo mês
    targetDate = new Date(year, month + 1, dayOfMonth);
  }
  const diff = Math.round((targetDate.getTime() - new Date(year, month, todayDay).getTime()) / 86400000);
  return diff;
}

export function useDashboardAlerts() {
  const [followUps, setFollowUps] = useState<FollowUpAlert[]>([]);
  const [bills, setBills] = useState<BillAlert[]>([]);
  const [tasks, setTasks] = useState<DashboardTask[]>([]);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().slice(0, 10);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      // ── Follow-ups atrasados ou de hoje ──────────────────────────────────
      const { data: followUpData } = await supabase
        .from("crm_followups")
        .select("id, scheduled_date, description, wedding_clients(name)")
        .eq("completed", false)
        .lte("scheduled_date", todayStr)
        .order("scheduled_date", { ascending: true });

      if (followUpData) {
        const today = new Date(todayStr);
        setFollowUps(
          followUpData.map((f: any) => {
            const d = new Date(f.scheduled_date);
            const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
            return {
              id: f.id,
              clientName: f.wedding_clients?.name ?? "Cliente",
              description: f.description ?? "",
              scheduledDate: f.scheduled_date,
              daysOverdue: diff,
            };
          })
        );
      }

      // ── Despesas fixas vencendo em até 7 dias ────────────────────────────
      const [{ data: bizExp }, { data: perExp }] = await Promise.all([
        supabase.from("business_fixed_expenses").select("id, description, amount, due_date").eq("is_active", true),
        supabase.from("personal_fixed_expenses").select("id, description, amount, due_date").eq("is_active", true),
      ]);

      const allBills: BillAlert[] = [];
      const addBills = (rows: any[], source: "business" | "personal") => {
        (rows ?? []).forEach((r) => {
          const days = daysUntilDayOfMonth(Number(r.due_date));
          if (days <= 7) {
            allBills.push({
              id: r.id,
              description: r.description,
              amount: Number(r.amount),
              dueDayOfMonth: Number(r.due_date),
              daysUntilDue: days,
              source,
            });
          }
        });
      };
      addBills(bizExp ?? [], "business");
      addBills(perExp ?? [], "personal");
      allBills.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
      setBills(allBills);

      // ── Tarefas ──────────────────────────────────────────────────────────
      const { data: taskData } = await supabase
        .from("dashboard_tasks")
        .select("id, text, completed, created_at")
        .order("created_at", { ascending: false });

      if (taskData) {
        setTasks(
          taskData.map((t: any) => ({
            id: t.id,
            text: t.text,
            completed: t.completed,
            createdAt: t.created_at,
          }))
        );
      }
    } finally {
      setLoading(false);
    }
  }, [todayStr]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Mutations ────────────────────────────────────────────────────────────

  const addTask = useCallback(async (text: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("dashboard_tasks")
      .insert({ text, user_id: user?.id ?? null })
      .select()
      .single();
    if (error) {
      console.error("Erro ao salvar tarefa:", error);
      return;
    }
    if (data) {
      setTasks((prev) => [{ id: data.id, text: data.text, completed: false, createdAt: data.created_at }, ...prev]);
    }
  }, []);

  const toggleTask = useCallback(async (id: string, completed: boolean) => {
    await supabase.from("dashboard_tasks").update({ completed, completed_at: completed ? new Date().toISOString() : null }).eq("id", id);
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)));
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await supabase.from("dashboard_tasks").delete().eq("id", id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const completeFollowUp = useCallback(async (id: string) => {
    await supabase.from("crm_followups").update({ completed: true, completed_at: new Date().toISOString() }).eq("id", id);
    setFollowUps((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return {
    followUps,
    bills,
    tasks,
    loading,
    addTask,
    toggleTask,
    deleteTask,
    completeFollowUp,
    refresh: fetchAll,
  };
}
