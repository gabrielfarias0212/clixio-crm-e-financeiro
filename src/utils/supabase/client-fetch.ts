
import { supabase } from '@/integrations/supabase/client';
import { Client } from '../types';
import { parseClient } from './client-parsers';
import { fetchPaymentsForClient } from './payments';

/**
 * Fetches all clients from the database
 */
export const fetchClients = async (): Promise<Client[]> => {
  try {
    const { data: clientsData, error: clientsError } = await supabase
      .from('wedding_clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (clientsError) {
      console.error('Error fetching clients:', clientsError);
      return [];
    }

    const clients = clientsData?.map(parseClient) || [];

    // Load payments for each client
    for (const client of clients) {
      const payments = await fetchPaymentsForClient(client.id);
      client.payments = payments;
    }

    return clients;
  } catch (error) {
    console.error('Exception fetching clients:', error);
    return [];
  }
};

/**
 * Fetches a single client by ID
 */
export const fetchClient = async (id: string): Promise<Client | null> => {
  try {
    const { data: clientData, error: clientError } = await supabase
      .from('wedding_clients')
      .select('*')
      .eq('id', id)
      .single();

    if (clientError) {
      console.error('Error fetching client:', clientError);
      return null;
    }

    const client = parseClient(clientData);

    // Load payments for this client
    const payments = await fetchPaymentsForClient(id);
    client.payments = payments;

    return client;
  } catch (error) {
    console.error('Exception fetching client:', error);
    return null;
  }
};
