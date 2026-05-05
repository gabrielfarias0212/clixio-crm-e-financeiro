import { supabase } from "@/integrations/supabase/client";

export interface ProjectCost {
  id: string;
  client_id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  supplier?: string;
  created_at?: string;
}

export const COST_CATEGORIES: { value: string; label: string; emoji: string; needsSupplier?: boolean }[] = [
  { value: "assistente",      label: "Assistente",       emoji: "👤" },
  { value: "album",           label: "Álbum",            emoji: "📘", needsSupplier: true },
  { value: "impressao",       label: "Impressão",        emoji: "🖨️", needsSupplier: true },
  { value: "moldura",         label: "Moldura / Quadro", emoji: "🖼️", needsSupplier: true },
  { value: "edicao_externa",  label: "Edição externa",   emoji: "✂️", needsSupplier: true },
  { value: "combustivel",     label: "Combustível",      emoji: "⛽" },
  { value: "alimentacao",     label: "Alimentação",      emoji: "🍽️" },
  { value: "equipamento",     label: "Equipamento",      emoji: "📷" },
  { value: "deslocamento",    label: "Deslocamento",     emoji: "🚗" },
  { value: "outro",           label: "Outro",            emoji: "📌" },
];

export async function fetchProjectCosts(clientId: string): Promise<ProjectCost[]> {
  const { data, error } = await supabase
    .from("project_costs")
    .select("*")
    .eq("client_id", clientId)
    .order("date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addProjectCost(
  clientId: string,
  cost: Omit<ProjectCost, "id" | "client_id" | "created_at">
): Promise<ProjectCost> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) throw new Error("Usuário não autenticado");
  
  const payload: Record<string, unknown> = {
    category: cost.category,
    description: cost.description,
    amount: cost.amount,
    date: cost.date,
    client_id: clientId,
    user_id: user.id,
  };
  if (cost.supplier) payload.supplier = cost.supplier;

  const { data, error } = await supabase
    .from("project_costs")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as ProjectCost;
}

export async function deleteProjectCost(id: string): Promise<void> {
  const { error } = await supabase.from("project_costs").delete().eq("id", id);
  if (error) throw error;
}
