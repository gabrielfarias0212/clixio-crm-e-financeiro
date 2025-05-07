
import { supabase } from '@/integrations/supabase/client';
import { Client, ClientStatus, NextAction, EventCategory } from '../types';
import { parseDate, formatDateForSupabase } from './base';
import { fetchPaymentsForClient } from './payments';

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
    payments: [],
    createdAt: parseDate(client.created_at) || new Date(),
    updatedAt: parseDate(client.updated_at) || new Date(),
  };
};

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

export const createClient = async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'payments'>): Promise<Client | null> => {
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

export const updateClient = async (id: string, updates: Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'payments'>>): Promise<Client | null> => {
  const updateData: any = {
    name: updates.name,
    couple_name: updates.coupleName,
    email: updates.email,
    phone: updates.phone,
    wedding_date: updates.weddingDate ? formatDateForSupabase(updates.weddingDate) : undefined,
    contract_value: updates.contractValue,
    status: updates.status,
    next_action: updates.nextAction,
    notes: updates.notes,
    down_payment: updates.downPayment,
    event_category: updates.eventCategory,
    updated_at: new Date().toISOString()
  };

  Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

  const { data, error } = await supabase
    .from('wedding_clients')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating client:', error);
    return null;
  }

  return fetchClient(id);
};

export const deleteClient = async (id: string): Promise<boolean> => {
  try {
    // First, delete the payments related to this client
    const { error: paymentsError } = await supabase
      .from('wedding_payments')
      .delete()
      .eq('client_id', id);

    if (paymentsError) {
      console.error('Error deleting client payments:', paymentsError);
      return false;
    }

    // Delete the transactions related to this client
    const { error: transactionsError } = await supabase
      .from('wedding_transactions')
      .delete()
      .eq('client_id', id);

    if (transactionsError) {
      console.error('Error deleting client transactions:', transactionsError);
      return false;
    }

    // Finally, delete the client
    const { error: clientError } = await supabase
      .from('wedding_clients')
      .delete()
      .eq('id', id);

    if (clientError) {
      console.error('Error deleting client:', clientError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception deleting client:', error);
    return false;
  }
};
