
import { supabase } from '@/integrations/supabase/client';
import { Client, ClientStatus, NextAction, Payment, Transaction, TransactionType, TransactionCategory } from './types';
import type { Database } from '@/integrations/supabase/types';

// Convert Supabase date strings to Date objects
export const parseDate = (dateString: string | null): Date | null => {
  if (!dateString) return null;
  return new Date(dateString);
};

// Format Date objects to ISO strings for Supabase
export const formatDateForSupabase = (date: Date | null): string | null => {
  if (!date) return null;
  return date.toISOString();
};

// Parse client data from Supabase
export const parseClient = (client: any): Client => {
  return {
    id: client.id,
    name: client.name,
    weddingDate: parseDate(client.wedding_date),
    contractValue: Number(client.contract_value) || 0,
    status: client.status as ClientStatus,
    nextAction: client.next_action as NextAction,
    email: client.email || '',
    phone: client.phone || '',
    notes: client.notes || '',
    downPayment: Number(client.down_payment) || 0,
    payments: [], // Payments will be populated separately
    createdAt: parseDate(client.created_at) || new Date(),
    updatedAt: parseDate(client.updated_at) || new Date(),
  };
};

// Parse payment data from Supabase
export const parsePayment = (payment: any): Payment => {
  return {
    id: payment.id,
    amount: Number(payment.amount),
    date: parseDate(payment.date) || new Date(),
    notes: payment.notes,
  };
};

// Parse transaction data from Supabase
export const parseTransaction = (transaction: any): Transaction => {
  return {
    id: transaction.id,
    amount: Number(transaction.amount),
    date: parseDate(transaction.date) || new Date(),
    type: transaction.type as TransactionType,
    category: transaction.category as TransactionCategory,
    description: transaction.description,
    clientId: transaction.client_id,
    paymentId: transaction.payment_id,
    createdAt: parseDate(transaction.created_at) || new Date(),
  };
};

// Client API functions
export const fetchClients = async (): Promise<Client[]> => {
  const { data: clientsData, error: clientsError } = await supabase
    .from('wedding_clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (clientsError) {
    console.error('Error fetching clients:', clientsError);
    return [];
  }

  const clients = clientsData?.map(parseClient) || [];

  // Fetch payments for all clients
  for (const client of clients) {
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('wedding_payments')
      .select('*')
      .eq('client_id', client.id)
      .order('date', { ascending: false });
    
    if (!paymentsError && paymentsData) {
      client.payments = paymentsData.map(parsePayment);
    }
  }

  return clients;
};

export const fetchClient = async (id: string): Promise<Client | null> => {
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

  // Fetch payments for this client
  const { data: paymentsData, error: paymentsError } = await supabase
    .from('wedding_payments')
    .select('*')
    .eq('client_id', id)
    .order('date', { ascending: false });
  
  if (!paymentsError && paymentsData) {
    client.payments = paymentsData.map(parsePayment);
  }

  return client;
};

export const createClient = async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'payments'>): Promise<Client | null> => {
  try {
    const { data, error } = await supabase
      .from('wedding_clients')
      .insert({
        name: client.name,
        email: client.email,
        phone: client.phone,
        wedding_date: client.weddingDate ? formatDateForSupabase(client.weddingDate) : null,
        contract_value: client.contractValue,
        status: client.status,
        next_action: client.nextAction,
        notes: client.notes,
        down_payment: client.downPayment,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating client:', error);
      return null;
    }

    if (!data) {
      console.error('No data returned after creating client');
      return null;
    }

    const newClient = parseClient(data);
    newClient.payments = [];

    // If there's a down payment, create a payment record
    if (client.downPayment > 0 && (client.status === 'fechado' || client.status === 'em andamento' || client.status === 'pago')) {
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
    email: updates.email,
    phone: updates.phone,
    wedding_date: updates.weddingDate ? formatDateForSupabase(updates.weddingDate) : undefined,
    contract_value: updates.contractValue,
    status: updates.status,
    next_action: updates.nextAction,
    notes: updates.notes,
    down_payment: updates.downPayment,
    updated_at: new Date().toISOString()
  };

  // Remove undefined fields
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

// Payment API functions
export const createPayment = async (payment: { clientId: string, amount: number, date: Date, notes?: string }): Promise<Payment | null> => {
  try {
    const { data, error } = await supabase
      .from('wedding_payments')
      .insert({
        client_id: payment.clientId,
        amount: payment.amount,
        date: formatDateForSupabase(payment.date),
        notes: payment.notes
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating payment:', error);
      return null;
    }

    // Create a corresponding transaction entry
    if (data) {
      await createTransaction({
        amount: payment.amount,
        date: payment.date,
        type: 'entrada',
        category: 'pagamento de cliente',
        description: `Pagamento de cliente ${payment.clientId}`,
        clientId: payment.clientId,
        paymentId: data.id
      });
    }

    return data ? parsePayment(data) : null;
  } catch (error) {
    console.error('Exception creating payment:', error);
    return null;
  }
};

// Transaction API functions
export const fetchTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('wedding_transactions')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  return data?.map(parseTransaction) || [];
};

export const createTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction | null> => {
  try {
    const { data, error } = await supabase
      .from('wedding_transactions')
      .insert({
        amount: transaction.amount,
        date: formatDateForSupabase(transaction.date),
        type: transaction.type,
        category: transaction.category,
        description: transaction.description,
        client_id: transaction.clientId,
        payment_id: transaction.paymentId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      return null;
    }

    return data ? parseTransaction(data) : null;
  } catch (error) {
    console.error('Exception creating transaction:', error);
    return null;
  }
};

// Função para limpar dados de teste
export const clearAllData = async (): Promise<boolean> => {
  try {
    // Limpar transações
    await supabase
      .from('wedding_transactions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Limpar pagamentos
    await supabase
      .from('wedding_payments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Limpar clientes
    await supabase
      .from('wedding_clients')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};
