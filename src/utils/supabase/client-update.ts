import { supabase } from '@/integrations/supabase/client';
import { Client, SalesFunnelStage } from '../types';
import { formatDateForSupabase } from './base';
import { parseClient } from './client-parsers';
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  fetchCalendarEvents,
} from './calendar-events';
import { v4 as uuidv4 } from 'uuid';

// Mapeia status -> etapa do funil (apenas usado se o caller mandar status)
const mapStatusToFunnelStage = (status: string): SalesFunnelStage => {
  switch (status.toLowerCase()) {
    case 'primeiro_contato':
      return 'primeiro_contato';
    case 'orçamento enviado':
      return 'orcamento_enviado';
    case 'negociacao':
    case 'follow-up':
      return 'negociacao';
    case 'fechado':
    case 'em andamento':
    case 'pago':
      return 'contrato_fechado';
    case 'projeto_finalizado':
    case 'entregue':
      return 'projeto_finalizado';
    case 'contrato_perdido':
      return 'contrato_perdido';
    default:
      return 'primeiro_contato';
  }
};

// Mapeamento camelCase -> snake_case (somente para colunas existentes em wedding_clients)
const FIELD_MAP: Record<string, string> = {
  name: 'name',
  email: 'email',
  phone: 'phone',
  coupleName: 'couple_name',
  weddingStartTime: 'wedding_start_time',
  weddingEndTime: 'wedding_end_time',
  contractValue: 'contract_value',
  downPayment: 'down_payment',
  status: 'status',
  nextAction: 'next_action',
  eventCategory: 'event_category',
  eventLocation: 'event_location',
  preWeddingStartTime: 'pre_wedding_start_time',
  preWeddingEndTime: 'pre_wedding_end_time',
  contractLink: 'contract_link',
  hasPreWedding: 'has_pre_wedding',
  notes: 'notes',
  workflowStage: 'workflow_stage',
  weddingPhotographed: 'wedding_photographed',
  previasSent: 'previas_sent',
  inEditing: 'in_editing',
  linkReady: 'link_ready',
  linkSent: 'link_sent',
  boxDelivered: 'box_delivered',
  albumApprovedDelivered: 'album_approved_delivered',
  albumDesigned: 'album_designed',
  hasAlbum: 'has_album',
  albumLinkSent: 'album_link_sent',
  albumClientChose: 'album_client_chose',
  albumDiagrammed: 'album_diagrammed',
  albumClientApproved: 'album_client_approved',
  albumOrdered: 'album_ordered',
  storageLocation: 'storage_location',
  semEntregaFisica: 'sem_entrega_fisica',
  packageId: 'package_id',
  leadSource: 'lead_source',
  preWeddingScheduled: 'pre_wedding_scheduled',
  preWeddingCompleted: 'pre_wedding_completed',
  preWeddingDelivered: 'pre_wedding_delivered',
  salesFunnelStage: 'sales_funnel_stage',
};

export const updateClient = async (
  id: string,
  clientData: Partial<Client>
): Promise<Client | null> => {
  try {
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    // Itera apenas sobre os campos realmente enviados — update parcial real
    for (const key of Object.keys(clientData) as (keyof Client)[]) {
      const value = clientData[key];
      if (value === undefined) continue;
      const column = FIELD_MAP[key as string];
      if (column) updatePayload[column] = value;
    }

    // Datas precisam de formatação especial; null é permitido apenas se vier explicitamente
    if ('weddingDate' in clientData) {
      updatePayload.wedding_date = clientData.weddingDate
        ? formatDateForSupabase(clientData.weddingDate)
        : null;
    }
    if ('preWeddingDate' in clientData) {
      updatePayload.pre_wedding_date = clientData.preWeddingDate
        ? formatDateForSupabase(clientData.preWeddingDate)
        : null;
      // Sincroniza preWeddingScheduled se não vier explicitamente
      if (!('preWeddingScheduled' in clientData)) {
        updatePayload.pre_wedding_scheduled = !!clientData.preWeddingDate;
      }
      // Auto-ativa has_pre_wedding quando uma data é fornecida
      if (clientData.preWeddingDate && !('hasPreWedding' in clientData)) {
        updatePayload.has_pre_wedding = true;
      }
    }

    // Sincronia entre campos legados e atuais para Cópia/Backup e Curadoria
    if ('backupCompleted' in clientData) {
      updatePayload.backup_completed = clientData.backupCompleted;
      updatePayload.backup_done = clientData.backupCompleted;
    }
    if ('backupDone' in clientData) {
      updatePayload.backup_done = clientData.backupDone;
      updatePayload.backup_completed = clientData.backupDone;
    }
    if ('curationCompleted' in clientData) {
      updatePayload.curation_completed = clientData.curationCompleted;
      updatePayload.curadoria_done = clientData.curationCompleted;
    }
    if ('curadoriaDone' in clientData) {
      updatePayload.curadoria_done = clientData.curadoriaDone;
      updatePayload.curation_completed = clientData.curadoriaDone;
    }
    if ('edicaoBaseDone' in clientData) {
      updatePayload.edicao_base_done = clientData.edicaoBaseDone;
    }

    // Funil derivado de status, somente se status foi enviado e funil não
    if (clientData.status && !clientData.salesFunnelStage) {
      updatePayload.sales_funnel_stage = mapStatusToFunnelStage(clientData.status);
    }

    console.log(`[ClientUpdate] Partial update for ${id}:`, Object.keys(updatePayload));

    const { data, error } = await supabase
      .from('wedding_clients')
      .update(updatePayload)
      .eq('id', id)
      .select(`
        *,
        wedding_payments ( id, amount, date, notes, due_date, payment_status )
      `)
      .single();

    if (error) {
      console.error('[ClientUpdate] Error updating client:', error);
      return null;
    }

    const updatedClient = data ? parseClient(data) : null;

    // Gerenciar evento de pré-wedding no calendário apenas se algo relevante mudou
    if (
      updatedClient &&
      ('preWeddingDate' in clientData ||
        'hasPreWedding' in clientData ||
        'preWeddingStartTime' in clientData ||
        'preWeddingEndTime' in clientData ||
        'name' in clientData)
    ) {
      await managePreWeddingCalendarEvent(updatedClient);
    }

    return updatedClient;
  } catch (error) {
    console.error('Exception updating client:', error);
    return null;
  }
};

// Gerencia o evento de pré-wedding no calendário
const managePreWeddingCalendarEvent = async (client: Client) => {
  try {
    const allEvents = await fetchCalendarEvents();
    const existingEvent = allEvents.find(
      (event) => event.type === 'pre-wedding' && event.clientId === client.id
    );

    if (!client.hasPreWedding || !client.preWeddingDate) {
      if (existingEvent) await deleteCalendarEvent(existingEvent.id);
      return;
    }

    const eventData = {
      id: existingEvent?.id || uuidv4(),
      title: `Pré-Wedding - ${client.name}`,
      description: `Sessão de pré-wedding para ${client.name}`,
      date: client.preWeddingDate,
      startTime: client.preWeddingStartTime || '09:00',
      endTime: client.preWeddingEndTime || '10:00',
      type: 'pre-wedding' as const,
      color: 'purple' as const,
      clientId: client.id,
    };

    if (existingEvent) {
      await updateCalendarEvent(eventData);
    } else {
      await createCalendarEvent(eventData);
    }
  } catch (error) {
    console.error('[ClientUpdate] Erro ao gerenciar evento de pré-wedding:', error);
  }
};
