import { supabase } from "@/integrations/supabase/client";

export type ActivityType = "whatsapp" | "call" | "email" | "meeting" | "note";

export const ACTIVITY_TYPES: { value: ActivityType; label: string; icon: string; color: string }[] = [
  { value: "whatsapp", label: "WhatsApp",  icon: "MessageCircle", color: "text-green-600 bg-green-50 border-green-200" },
  { value: "call",     label: "Ligação",   icon: "Phone",         color: "text-blue-600 bg-blue-50 border-blue-200" },
  { value: "email",    label: "E-mail",    icon: "Mail",          color: "text-purple-600 bg-purple-50 border-purple-200" },
  { value: "meeting",  label: "Reunião",   icon: "Users",         color: "text-orange-600 bg-orange-50 border-orange-200" },
  { value: "note",     label: "Nota",      icon: "FileText",      color: "text-stone-600 bg-stone-50 border-stone-200" },
];

export interface CRMActivity {
  id:          string;
  client_id:   string;
  type:        ActivityType;
  description: string;
  created_at:  string;
}

export interface CRMFollowup {
  id:             string;
  client_id:      string;
  client_name?:   string;
  scheduled_date: string;
  description?:   string;
  completed:      boolean;
  completed_at?:  string;
  created_at:     string;
}

// ── Activities ──────────────────────────────────────────────────
export async function fetchActivities(clientId: string): Promise<CRMActivity[]> {
  const { data, error } = await supabase
    .from("crm_activities")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as CRMActivity[];
}

export async function addActivity(
  clientId: string,
  type: ActivityType,
  description: string
): Promise<CRMActivity> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) throw new Error("Não autenticado");
  const { data, error } = await supabase
    .from("crm_activities")
    .insert({ client_id: clientId, user_id: user.id, type, description })
    .select().single();
  if (error) throw error;
  return data as CRMActivity;
}

export async function deleteActivity(id: string): Promise<void> {
  const { error } = await supabase.from("crm_activities").delete().eq("id", id);
  if (error) throw error;
}

// ── Follow-ups ──────────────────────────────────────────────────
export async function fetchFollowups(clientId: string): Promise<CRMFollowup[]> {
  const { data, error } = await supabase
    .from("crm_followups")
    .select("*")
    .eq("client_id", clientId)
    .order("scheduled_date", { ascending: true });
  if (error) throw error;
  return data as CRMFollowup[];
}

export async function fetchAllPendingFollowups(): Promise<CRMFollowup[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) return [];
  const { data, error } = await supabase
    .from("crm_followups")
    .select("*, wedding_clients(name)")
    .eq("user_id", user.id)
    .eq("completed", false)
    .order("scheduled_date", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    ...r,
    client_name: r.wedding_clients?.name,
  })) as CRMFollowup[];
}

export async function addFollowup(
  clientId: string,
  scheduledDate: string,
  description?: string
): Promise<CRMFollowup> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) throw new Error("Não autenticado");
  const { data, error } = await supabase
    .from("crm_followups")
    .insert({ client_id: clientId, user_id: user.id, scheduled_date: scheduledDate, description })
    .select().single();
  if (error) throw error;
  return data as CRMFollowup;
}

export async function completeFollowup(id: string): Promise<void> {
  const { error } = await supabase
    .from("crm_followups")
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteFollowup(id: string): Promise<void> {
  const { error } = await supabase.from("crm_followups").delete().eq("id", id);
  if (error) throw error;
}

// ── Auto follow-up ────────────────────────────────────────────
/**
 * Agenda um follow-up automático 3 dias à frente se não existir
 * nenhum follow-up pendente nos próximos 7 dias para este cliente.
 */
export async function scheduleAutoFollowup(
  clientId: string,
  description = "Follow-up automático"
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) return;

    // Verifica se já existe follow-up pendente nos próximos 7 dias
    const in7days = new Date();
    in7days.setDate(in7days.getDate() + 7);
    const { data: existing } = await supabase
      .from("crm_followups")
      .select("id")
      .eq("client_id", clientId)
      .eq("completed", false)
      .lte("scheduled_date", in7days.toISOString().split("T")[0])
      .limit(1);

    if (existing && existing.length > 0) return; // já tem — não duplica

    const due = new Date();
    due.setDate(due.getDate() + 3);
    await supabase.from("crm_followups").insert({
      client_id: clientId,
      user_id: user.id,
      scheduled_date: due.toISOString().split("T")[0],
      description,
      completed: false,
    });
  } catch {
    // silencioso — não deve bloquear o fluxo principal
  }
}
