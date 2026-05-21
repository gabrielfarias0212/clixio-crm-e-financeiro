import { supabase } from "@/integrations/supabase/client";
import { FormTemplate, FormInstance, FormResponse, FormQuestion } from "@/utils/types";

// ── Helpers ────────────────────────────────────────────────────────────────────

function parseQuestions(raw: unknown): FormQuestion[] {
  if (!Array.isArray(raw)) return [];
  return raw as FormQuestion[];
}

function mapTemplate(row: Record<string, unknown>): FormTemplate {
  return {
    id: row.id as string,
    user_id: row.user_id as string | null,
    title: row.title as string,
    description: (row.description as string) ?? undefined,
    category: (row.category as string) ?? undefined,
    questions: parseQuestions(row.questions),
    is_default: row.is_default as boolean,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

function mapInstance(row: Record<string, unknown>): FormInstance {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    client_id: row.client_id as string,
    template_id: (row.template_id as string) ?? undefined,
    title: row.title as string,
    questions: parseQuestions(row.questions),
    token: row.token as string,
    status: (row.status as FormInstance["status"]) ?? "pending",
    sent_at: (row.sent_at as string) ?? undefined,
    submitted_at: (row.submitted_at as string) ?? undefined,
    expires_at: (row.expires_at as string) ?? undefined,
    created_at: row.created_at as string,
  };
}

// ── Templates ─────────────────────────────────────────────────────────────────

export async function fetchFormTemplates(): Promise<FormTemplate[]> {
  const { data, error } = await supabase
    .from("form_templates")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapTemplate);
}

export async function createFormTemplate(
  payload: Pick<FormTemplate, "title" | "description" | "category" | "questions">
): Promise<FormTemplate> {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("form_templates")
    .insert({ ...payload, questions: payload.questions as any, user_id: user?.id, is_default: false } as any)
    .select()
    .single();
  if (error) throw error;
  return mapTemplate(data);
}

export async function updateFormTemplate(
  id: string,
  payload: Partial<Pick<FormTemplate, "title" | "description" | "category" | "questions">>
): Promise<void> {
  const { error } = await supabase
    .from("form_templates")
    .update(payload as any)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteFormTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from("form_templates")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ── Instances ─────────────────────────────────────────────────────────────────

export async function fetchFormInstances(): Promise<FormInstance[]> {
  const { data, error } = await supabase
    .from("form_instances")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapInstance);
}

export async function fetchInstancesByClient(clientId: string): Promise<FormInstance[]> {
  const { data, error } = await supabase
    .from("form_instances")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapInstance);
}

function generateToken(): string {
  const arr = new Uint8Array(18);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function createFormInstance(payload: {
  client_id: string;
  template_id?: string;
  title: string;
  questions: FormQuestion[];
  expires_at?: string;
}): Promise<FormInstance> {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("form_instances")
    .insert({
      ...payload,
      questions: payload.questions as any,
      user_id: user?.id,
      token: generateToken(),
      sent_at: new Date().toISOString(),
    } as any)
    .select()
    .single();
  if (error) throw error;
  return mapInstance(data);
}

export async function deleteFormInstance(id: string): Promise<void> {
  const { error } = await supabase.from("form_instances").delete().eq("id", id);
  if (error) throw error;
}

// ── Public: lookup by token (no auth required) ────────────────────────────────

export async function fetchInstanceByToken(token: string): Promise<FormInstance | null> {
  const { data, error } = await supabase
    .from("form_instances")
    .select("*")
    .eq("token", token)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapInstance(data);
}

export async function submitFormResponse(
  instanceId: string,
  answers: FormResponse["answers"]
): Promise<void> {
  // Insert response
  const { error: respErr } = await supabase
    .from("form_responses")
    .insert({ instance_id: instanceId, answers });
  if (respErr) throw respErr;
  // Mark instance as submitted
  const { error: instErr } = await supabase
    .from("form_instances")
    .update({ status: "submitted", submitted_at: new Date().toISOString() })
    .eq("id", instanceId);
  if (instErr) throw instErr;
}

// ── Responses ─────────────────────────────────────────────────────────────────

export async function fetchResponseByInstance(instanceId: string): Promise<FormResponse | null> {
  const { data, error } = await supabase
    .from("form_responses")
    .select("*")
    .eq("instance_id", instanceId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    instance_id: data.instance_id,
    answers: data.answers as FormResponse["answers"],
    submitted_at: data.submitted_at,
  };
}
