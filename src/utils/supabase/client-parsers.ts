
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
    contractLink: client.contract_link || '',
    payments: [],
    createdAt: parseDate(client.created_at) || new Date(),
    updatedAt: parseDate(client.updated_at) || new Date(),
  };
};
