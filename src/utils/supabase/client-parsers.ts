
import { Client, ClientStatus, NextAction, EventCategory } from '../types';
import { parseDate } from './base';

/**
 * Parses client data from Supabase format to application format
 */
export const parseClient = (client: any): Client => {
  return {
    id: client.id,
    name: client.name,
    coupleName: client.couple_name || '',
    weddingDate: parseDate(client.wedding_date),
    weddingStartTime: client.wedding_start_time || '',
    weddingEndTime: client.wedding_end_time || '',
    contractValue: Number(client.contract_value) || 0,
    status: client.status as ClientStatus,
    nextAction: client.next_action as NextAction,
    email: client.email || '',
    phone: client.phone || '',
    notes: client.notes || '',
    downPayment: Number(client.down_payment) || 0,
    eventCategory: client.event_category as EventCategory || 'Casamento',
    eventLocation: client.event_location || '',
    preWeddingDate: parseDate(client.pre_wedding_date),
    preWeddingStartTime: client.pre_wedding_start_time || '',
    preWeddingEndTime: client.pre_wedding_end_time || '',
    contractLink: client.contract_link || '',
    // Delivery workflow fields
    preWeddingScheduled: client.pre_wedding_scheduled || false,
    preWeddingCompleted: client.pre_wedding_completed || false,
    preWeddingDelivered: client.pre_wedding_delivered || false,
    weddingPhotographed: client.wedding_photographed || false,
    inEditing: client.in_editing || false,
    linkSent: client.link_sent || false,
    boxDelivered: client.box_delivered || false,
    albumDesigned: client.album_designed || false,
    albumApprovedDelivered: client.album_approved_delivered || false,
    payments: [],
    createdAt: parseDate(client.created_at) || new Date(),
    updatedAt: parseDate(client.updated_at) || new Date(),
  };
};
