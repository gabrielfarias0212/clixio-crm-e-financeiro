
import { Client } from '../types';

/**
 * Parses a client from the database format to the application format
 */
export const parseClient = (client: any): Client => {
  return {
    id: client.id,
    name: client.name,
    coupleName: client.couple_name,
    email: client.email || '',
    phone: client.phone || '',
    weddingDate: client.wedding_date,
    weddingStartTime: client.wedding_start_time,
    weddingEndTime: client.wedding_end_time,
    contractValue: client.contract_value || 0,
    status: client.status || 'novo lead',
    nextAction: client.next_action || 'enviar proposta inicial',
    notes: client.notes || '',
    downPayment: client.down_payment || 0,
    eventCategory: client.event_category || 'Casamento',
    eventLocation: client.event_location,
    preWeddingDate: client.pre_wedding_date,
    preWeddingStartTime: client.pre_wedding_start_time,
    preWeddingEndTime: client.pre_wedding_end_time,
    contractLink: client.contract_link,
    hasPreWedding: client.has_pre_wedding !== false, // Default to true if undefined
    preWeddingScheduled: client.pre_wedding_scheduled,
    preWeddingCompleted: client.pre_wedding_completed,
    preWeddingDelivered: client.pre_wedding_delivered,
    weddingPhotographed: client.wedding_photographed,
    inEditing: client.in_editing,
    linkSent: client.link_sent,
    boxDelivered: client.box_delivered,
    albumDesigned: client.album_designed,
    albumApprovedDelivered: client.album_approved_delivered,
    payments: client.payments || [],
    createdAt: client.created_at,
    updatedAt: client.updated_at,
  };
};
