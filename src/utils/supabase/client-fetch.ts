
import { supabase } from '@/integrations/supabase/client';
import { Client } from '../types';
import { parseClient } from './client-parsers';
import { parsePayment } from './payments';

// Cache simples para evitar re-fetch desnecessário
const cache = {
  data: null as Client[] | null,
  timestamp: 0,
  ttl: 5000 // 5 segundos - mais agressivo para garantir dados atualizados
};

/**
 * Fetches all clients from the database with their payments in a single optimized query
 */
export const fetchClients = async (): Promise<Client[]> => {
  try {
    // Verificar cache primeiro
    const now = Date.now();
    if (cache.data && (now - cache.timestamp) < cache.ttl) {
      console.log('Returning cached clients data');
      return cache.data;
    }

    console.log('Fetching clients with optimized query...');
    
    // Query otimizada que busca clientes com seus pagamentos em uma única consulta
    const { data: clientsWithPayments, error } = await supabase
      .from('wedding_clients')
      .select(`
        id,
        name,
        email,
        phone,
        couple_name,
        wedding_date,
        wedding_start_time,
        wedding_end_time,
        contract_value,
        down_payment,
        status,
        next_action,
        event_category,
        event_location,
        pre_wedding_date,
        pre_wedding_start_time,
        pre_wedding_end_time,
        pre_wedding_scheduled,
        pre_wedding_completed,
        pre_wedding_delivered,
        contract_link,
        has_pre_wedding,
        sales_funnel_stage,
        lead_source,
        storage_location,
        notes,
        created_at,
        updated_at,
        
        workflow_stage,
        wedding_photographed,
        backup_completed,
        curation_completed,
        in_editing,
        link_ready,
        link_sent,
        box_delivered,
        album_designed,
        album_approved_delivered,
        
        wedding_payments (
          id,
          amount,
          date,
          notes,
          due_date,
          payment_status
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100); // Limitar para melhor performance inicial

    if (error) {
      console.error('Error fetching clients with payments:', error);
      return [];
    }

    // Processar dados e organizar pagamentos
    const clients = clientsWithPayments?.map(clientData => {
      const client = parseClient(clientData);
      
      // Processar pagamentos se existirem
      if (clientData.wedding_payments && Array.isArray(clientData.wedding_payments)) {
        client.payments = clientData.wedding_payments
          .map(parsePayment)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      } else {
        client.payments = [];
      }
      
      return client;
    }) || [];

    // Atualizar cache
    cache.data = clients;
    cache.timestamp = now;
    
    console.log(`Fetched ${clients.length} clients with payments in single query`);
    return clients;
    
  } catch (error) {
    console.error('Exception fetching clients:', error);
    return [];
  }
};

/**
 * Fetches a single client by ID with optimized query
 */
export const fetchClient = async (id: string): Promise<Client | null> => {
  try {
    console.log(`Fetching single client: ${id}`);
    
    const { data: clientData, error } = await supabase
      .from('wedding_clients')
      .select(`
        id,
        name,
        email,
        phone,
        couple_name,
        wedding_date,
        wedding_start_time,
        wedding_end_time,
        contract_value,
        down_payment,
        status,
        next_action,
        event_category,
        event_location,
        pre_wedding_date,
        pre_wedding_start_time,
        pre_wedding_end_time,
        pre_wedding_scheduled,
        pre_wedding_completed,
        pre_wedding_delivered,
        contract_link,
        has_pre_wedding,
        sales_funnel_stage,
        lead_source,
        storage_location,
        notes,
        created_at,
        updated_at,
        
        workflow_stage,
        wedding_photographed,
        backup_completed,
        curation_completed,
        in_editing,
        link_ready,
        link_sent,
        box_delivered,
        album_designed,
        album_approved_delivered,
        
        wedding_payments (
          id,
          amount,
          date,
          notes,
          due_date,
          payment_status
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching client:', error);
      return null;
    }

    const client = parseClient(clientData);
    
    // Processar pagamentos
    if (clientData.wedding_payments && Array.isArray(clientData.wedding_payments)) {
      client.payments = clientData.wedding_payments
        .map(parsePayment)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else {
      client.payments = [];
    }

    return client;
    
  } catch (error) {
    console.error('Exception fetching client:', error);
    return null;
  }
};

/**
 * Invalidates the clients cache - call this after mutations
 */
export const invalidateClientsCache = () => {
  cache.data = null;
  cache.timestamp = 0;
  console.log('Clients cache invalidated');
};
