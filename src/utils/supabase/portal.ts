import { supabase } from "@/integrations/supabase/client";

export interface PortalTransaction {
  amount: number;
  date: string | null;
  description: string | null;
  type: string;
}

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
  // transactions (real payments received)
  transactions?: PortalTransaction[];
}

export interface PortalStudio {
  name: string;
  avatarUrl?: string | null;
  website?: string | null;
}

export async function fetchPortalData(token: string): Promise<{ client: PortalClient; studio: PortalStudio } | null> {
  // Fetch client by token
  const { data: client, error } = await supabase
    .from("wedding_clients")
    .select(`
      id, name, couple_name, wedding_date, contract_value, status,
      workflow_stage, portal_deadline, portal_message, contract_link,
      has_album, wedding_photographed, backup_completed, curation_completed,
      previas_sent, in_editing, link_sent, box_delivered, sem_entrega_fisica
    `)
    .eq("portal_token", token)
    .eq("portal_enabled", true)
    .maybeSingle();

  if (error || !client) return null;

  // Fetch transactions (actual payments received)
  const { data: transactions } = await supabase
    .from("wedding_transactions")
    .select("amount, date, description, type")
    .eq("client_id", client.id)
    .order("date", { ascending: true });

  // Fetch studio info
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
      transactions: (transactions ?? []).map(t => ({
        amount: Number(t.amount),
        date: t.date,
        description: t.description,
        type: t.type,
      })),
    },
    studio: {
      name: profile?.company_name || profile?.name || "Fotografia",
      avatarUrl: profile?.avatar_url ?? null,
      website: profile?.website ?? null,
    },
  };
}
