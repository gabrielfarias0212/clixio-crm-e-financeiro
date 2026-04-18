import { supabase } from '@/integrations/supabase/client';
import { Client } from '../types';
import { parseClient } from './client-parsers';
import { parsePayment } from './payments';

const cache = {
  data: null as Client[] | null,
  timestamp: 0,
  ttl: 5000
};

const CLIENT_SELECT = `
  id, name, email, phone, couple_name,
  wedding_date, wedding_start_time, wedding_end_time,
  contract_value, down_payment, status, next_action,
  event_category, event_location,
  pre_wedding_date, pre_wedding_start_time, pre_wedding_end_time,
  pre_wedding_scheduled, pre_wedding_completed, pre_wedding_delivered,
  contract_link, has_pre_wedding,
  sales_funnel_stage, lead_source, storage_location, notes,
  created_at, updated_at, workflow_stage,

  wedding_photographed,
  backup_done,
  curadoria_done,
  in_editing,
  link_sent,
  box_delivered,

  has_album,
  album_link_sent,
  album_client_chose,
  album_diagrammed,
  album_client_approved,
  album_ordered,

  backup_completed,
  curation_completed,
  link_ready,
  album_designed,
  album_approved_delivered,

  wedding_payments (
    id, amount, date, notes, due_date, payment_status
  )
`;

export const fetchClients = async (): Promise<Client[]> => {
  try {
    const now = Date.now();
    if (cache.data && (now - cache.timestamp) < cache.ttl) {
      return cache.data;
    }

    const { data, error } = await supabase
      .from('wedding_clients')
      .select(CLIENT_SELECT)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching clients:', error);
      return [];
    }

    const clients = data?.map(clientData => {
      const client = parseClient(clientData);
      client.payments = clientData.wedding_payments?.map(parsePayment)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) ?? [];
      return client;
    }) ?? [];

    cache.data = clients;
    cache.timestamp = now;
    return clients;

  } catch (error) {
    console.error('Exception fetching clients:', error);
    return [];
  }
};

export const fetchClient = async (id: string): Promise<Client | null> => {
  try {
    const { data, error } = await supabase
      .from('wedding_clients')
      .select(CLIENT_SELECT)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching client:', error);
      return null;
    }

    const client = parseClient(data);
    client.payments = data.wedding_payments?.map(parsePayment)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) ?? [];
    return client;

  } catch (error) {
    console.error('Exception fetching client:', error);
    return null;
  }
};

export const invalidateClientsCache = () => {
  cache.data = null;
  cache.timestamp = 0;
};
