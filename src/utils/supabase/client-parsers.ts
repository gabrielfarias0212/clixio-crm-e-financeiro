
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
    weddingPhotographed: data.wedding_photographed,
    inEditing: data.in_editing,
    linkSent: data.link_sent,
    boxDelivered: data.box_delivered,
    albumDesigned: data.album_designed,
    albumApprovedDelivered: data.album_approved_delivered,
    // Novos campos do workflow
    backupCompleted: data.backup_completed,
    curationCompleted: data.curation_completed,
    linkReady: data.link_ready,
    workflowStage: data.workflow_stage,
    contractLink: data.contract_link,
    hasPreWedding: data.has_pre_wedding,
    salesFunnelStage: data.sales_funnel_stage || 'primeiro_contato',
    leadSource: data.lead_source,
    notes: data.notes,
    payments: [], // Will be loaded separately
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};
