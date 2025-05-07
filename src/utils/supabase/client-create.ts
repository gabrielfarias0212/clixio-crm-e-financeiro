
import { supabase } from '@/integrations/supabase/client';
import { Client } from '../types';
import { formatDateForSupabase } from './base';
import { parseClient } from './client-parsers';
import { fetchClient } from './client-fetch';
import { ClientCreateData } from './client-types';

/**
 * Creates a new client in the database
 */
export const createClient = async (client: ClientCreateData): Promise<Client | null> => {
  try {
    console.log('Creating client with data:', JSON.stringify(client, null, 2));
    
    const { data, error } = await supabase
      .from('wedding_clients')
      .insert({
        name: client.name,
        couple_name: client.coupleName,
        email: client.email,
        phone: client.phone,
        wedding_date: client.weddingDate ? formatDateForSupabase(client.weddingDate) : null,
        contract_value: client.contractValue,
        status: client.status,
        next_action: client.nextAction,
        notes: client.notes,
        down_payment: client.downPayment,
        event_category: client.eventCategory,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating client:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return null;
    }

    if (!data) {
      console.error('No data returned after creating client');
      return null;
    }

    const newClient = parseClient(data);
    newClient.payments = [];

    // Create initial payment if applicable
    if (client.downPayment > 0 && (client.status === 'fechado' || client.status === 'em andamento' || client.status === 'pago')) {
      const { createPayment } = await import('./payments');
      await createPayment({
        clientId: newClient.id,
        amount: client.downPayment,
        date: new Date(),
        notes: 'Entrada inicial'
      });
    }

    return fetchClient(newClient.id);
  } catch (error) {
    console.error('Exception creating client:', error);
    return null;
  }
};
