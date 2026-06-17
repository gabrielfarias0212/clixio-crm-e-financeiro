import { supabase } from "@/integrations/supabase/client";

export interface PortalClient {
  id: string;
  name: string;
  coupleName?: string;
  weddingDate?: string | null;
  contractValue?: number;
  status?: string;
  workflowStage?: string;
  portalDeadline?: string | null;
  portalMessage?: string | null;
  contractLink?: string | null;
  hasAlbum?: boolean;
  // workflow booleans
  weddingPhotographed?: boolean;
  backupCompleted?: boolean;
  curationCompleted?: boolean;
  previasSent?: boolean;
  inEditing?: boolean;
  linkSent?: boolean;
  boxDelivered?: boolean;
  semEntregaFisica?: boolean;
  // payments
  payments?: { amount: number; date: string; payment_status: string; notes?: string }[];
}

export interface PortalStudio {
  name: string;
  avatarUrl?: string | null;
  website?: string | null;
}

export async function fetchPortalData(token: string): Promise<{ client: PortalClient; studio: PortalStudio } | null> {
  // Fetch client by token (RLS allows public read when portal_enabled=true)
  const { data: client, error } = await supabase
    .from("wedding_clients")
    .select(`
      id, name, couple_name, wedding_date, contract_value, status,
      workflow_stage, portal_deadline, portal_message, contract_link,
      has_album, wedding_photographed, backup_completed, curation_completed,
      previas_sent, in_editing, link_sent, box_delivered, sem_entrega_fisica,
      wedding_payments(amount, date, payment_status, notes)
    `)
    .eq("portal_token", token)
    .eq("portal_enabled", true)
    .maybeSingle();

  if (error || !client) return null;

  // Fetch studio info from photographer_profiles
  const { data: profile } = await supabase
    .from("photographer_profiles")
    .select("name, company_name, avatar_url, website")
    .limit(1)
    .maybeSingle();

  return {
    client: {
      id: client.id,
      name: client.name,
      coupleName: client.couple_name ?? undefined,
      weddingDate: client.wedding_date,
      contractValue: client.contract_value,
      status: client.status,
      workflowStage: client.workflow_stage ?? undefined,
      portalDeadline: client.portal_deadline,
      portalMessage: client.portal_message,
      contractLink: client.contract_link,
      hasAlbum: client.has_album ?? false,
      weddingPhotographed: client.wedding_photographed ?? false,
      backupCompleted: client.backup_completed ?? false,
      curationCompleted: client.curation_completed ?? false,
      previasSent: client.previas_sent ?? false,
      inEditing: client.in_editing ?? false,
      linkSent: client.link_sent ?? false,
      boxDelivered: client.box_delivered ?? false,
      semEntregaFisica: client.sem_entrega_fisica ?? false,
      payments: (client.wedding_payments as any[]) ?? [],
    },
    studio: {
      name: profile?.company_name || profile?.name || "Fotografia",
      avatarUrl: profile?.avatar_url ?? null,
      website: profile?.website ?? null,
    },
  };
}
