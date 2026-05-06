import { supabase } from "@/integrations/supabase/client";

export type TemplateFunnelStage =
  | "primeiro_contato"
  | "orcamento_enviado"
  | "negociacao"
  | "contrato_fechado"
  | "projeto_finalizado"
  | "contrato_perdido";

export const TEMPLATE_STAGE_LABELS: Record<TemplateFunnelStage, string> = {
  primeiro_contato:  "Primeiro contato",
  orcamento_enviado: "Orçamento enviado",
  negociacao:        "Negociação",
  contrato_fechado:  "Contrato fechado",
  projeto_finalizado:"Projeto finalizado",
  contrato_perdido:  "Contrato perdido",
};

export interface MessageTemplate {
  id: string;
  user_id: string;
  title: string;
  stage: TemplateFunnelStage;
  body: string;
  created_at?: string;
}

export async function fetchMessageTemplates(): Promise<MessageTemplate[]> {
  const { data, error } = await supabase
    .from("message_templates")
    .select("*")
    .order("stage")
    .order("title");
  if (error) throw error;
  return data ?? [];
}

export async function addMessageTemplate(
  template: Pick<MessageTemplate, "title" | "stage" | "body">
): Promise<MessageTemplate> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) throw new Error("Usuário não autenticado");
  const { data, error } = await supabase
    .from("message_templates")
    .insert({ ...template, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateMessageTemplate(
  id: string,
  updates: Partial<Pick<MessageTemplate, "title" | "stage" | "body">>
): Promise<void> {
  const { error } = await supabase
    .from("message_templates")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteMessageTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from("message_templates")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
