import { supabase } from "@/integrations/supabase/client";

// ── Company Settings ────────────────────────────────────────────
export interface CompanySettings {
  id?: string;
  company_name?: string;
  cnpj?: string;
  phone?: string;
  city?: string;
  email?: string;
  monthly_revenue_goal?: number | null;
  annual_revenue_goal?: number | null;
  monthly_events_goal?: number | null;
  deadline_editing?: number | null;
  deadline_digital_delivery?: number | null;
  deadline_physical_delivery?: number | null;
  deadline_album?: number | null;
  deadline_pre_wedding?: number | null;
}

export async function fetchCompanySettings(): Promise<CompanySettings | null> {
  const { data, error } = await supabase
    .from("company_settings")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveCompanySettings(settings: CompanySettings): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) throw new Error("Usuário não autenticado");

  const { error } = await supabase
    .from("company_settings")
    .upsert({ ...settings, user_id: user.id, updated_at: new Date().toISOString() }, {
      onConflict: "user_id",
    });
  if (error) throw error;
}

// ── Project Cost Templates ──────────────────────────────────────
export type CostCondition = "always" | "physical_delivery" | "pre_wedding" | "digital_delivery";

export const CONDITION_LABELS: Record<CostCondition, string> = {
  always:            "Sempre (todo projeto)",
  physical_delivery: "Com entrega física",
  pre_wedding:       "Com pré-wedding",
  digital_delivery:  "Com entrega digital",
};

export interface ProjectCostTemplate {
  id: string;
  description: string;
  amount: number;
  category: string;
  supplier?: string;
  condition: CostCondition;
  active: boolean;
  created_at?: string;
}

export async function fetchCostTemplates(): Promise<ProjectCostTemplate[]> {
  const { data, error } = await supabase
    .from("project_cost_templates")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ProjectCostTemplate[];
}

export async function addCostTemplate(
  t: Omit<ProjectCostTemplate, "id" | "active" | "created_at">
): Promise<ProjectCostTemplate> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from("project_cost_templates")
    .insert({ ...t, user_id: user.id, active: true })
    .select()
    .single();
  if (error) throw error;
  return data as ProjectCostTemplate;
}

export async function updateCostTemplate(
  id: string,
  changes: Partial<ProjectCostTemplate>
): Promise<void> {
  const { error } = await supabase
    .from("project_cost_templates")
    .update(changes)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteCostTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from("project_cost_templates")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

/** Retorna templates aplicáveis a um cliente dado seu perfil */
export function getApplicableTemplates(
  templates: ProjectCostTemplate[],
  opts: { hasPhysicalDelivery: boolean; hasPreWedding: boolean; hasDigitalDelivery: boolean }
): ProjectCostTemplate[] {
  return templates.filter((t) => {
    if (!t.active) return false;
    if (t.condition === "always") return true;
    if (t.condition === "physical_delivery") return opts.hasPhysicalDelivery;
    if (t.condition === "pre_wedding") return opts.hasPreWedding;
    if (t.condition === "digital_delivery") return opts.hasDigitalDelivery;
    return false;
  });
}
