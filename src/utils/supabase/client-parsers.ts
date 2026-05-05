import { Client } from '../types';

export const parseClient = (data: any): Client => {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    coupleName: data.couple_name,
    weddingDate: data.wedding_date,
    weddingStartTime: data.wedding_start_time,
    weddingEndTime: data.wedding_end_time,
    contractValue: Number(data.contract_value) || 0,
    downPayment: Number(data.down_payment) || 0,
    status: data.status,
    nextAction: data.next_action,
    eventCategory: data.event_category,
    eventLocation: data.event_location,
    preWeddingDate: data.pre_wedding_date,
    preWeddingStartTime: data.pre_wedding_start_time,
    preWeddingEndTime: data.pre_wedding_end_time,
    preWeddingScheduled: data.pre_wedding_scheduled,
    preWeddingCompleted: data.pre_wedding_completed,
    preWeddingDelivered: data.pre_wedding_delivered,
    contractLink: data.contract_link,
    hasPreWedding: data.has_pre_wedding,
    salesFunnelStage: data.sales_funnel_stage || 'primeiro_contato',
    leadSource: data.lead_source,
    storageLocation: data.storage_location,
    semEntregaFisica: data.sem_entrega_fisica ?? false,
    notes: data.notes,
    workflowStage: data.workflow_stage,

    // ── Workflow principal ──────────────────────────
    weddingPhotographed: data.wedding_photographed ?? false,
    backupDone: data.backup_done ?? false,
    curadoriaDone: data.curadoria_done ?? false,
    edicaoBaseDone: data.edicao_base_done ?? false,
    inEditing: data.in_editing ?? false,
    linkSent: data.link_sent ?? false,
    boxDelivered: data.box_delivered ?? false,

    // ── Álbum ───────────────────────────────────────
    hasAlbum: data.has_album ?? false,
    albumLinkSent: data.album_link_sent ?? false,
    albumClientChose: data.album_client_chose ?? false,
    albumDiagrammed: data.album_diagrammed ?? false,
    albumClientApproved: data.album_client_approved ?? false,
    albumOrdered: data.album_ordered ?? false,

    // ── Legados (compatibilidade) ───────────────────
    albumDesigned: data.album_designed,
    albumApprovedDelivered: data.album_approved_delivered,
    backupCompleted: data.backup_completed,
    curationCompleted: data.curation_completed,
    linkReady: data.link_ready,

    payments: [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};
