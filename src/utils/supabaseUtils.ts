import { supabase } from '@/integrations/supabase/client';
import { Client, ClientStatus, NextAction, EventCategory, Payment, Transaction, TransactionType, TransactionCategory } from './types';
import type { Database } from '@/integrations/supabase/types';
import type { FinancialCategory } from './types';

export const parseDate = (dateString: string | null): Date | null => {
  if (!dateString) return null;
  return new Date(dateString);
};

export const formatDateForSupabase = (date: Date | null): string | null => {
  if (!date) return null;
  return date.toISOString();
};

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

export const parsePayment = (payment: any): Payment => {
  return {
    id: payment.id,
    amount: Number(payment.amount),
    date: parseDate(payment.date) || new Date(),
    notes: payment.notes,
  };
};

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

    const { data: paymentsData, error: paymentsError } = await supabase
      .from('wedding_payments')
      .select('*')
      .eq('client_id', id)
      .order('date', { ascending: false });
    
    if (!paymentsError && paymentsData) {
      client.payments = paymentsData.map(parsePayment);
    }

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
    // Primeiro, excluímos os pagamentos relacionados a esse cliente
    const { error: paymentsError } = await supabase
      .from('wedding_payments')
      .delete()
      .eq('client_id', id);

    if (paymentsError) {
      console.error('Error deleting client payments:', paymentsError);
      return false;
    }

    // Excluímos as transações relacionadas a esse cliente
    const { error: transactionsError } = await supabase
      .from('wedding_transactions')
      .delete()
      .eq('client_id', id);

    if (transactionsError) {
      console.error('Error deleting client transactions:', transactionsError);
      return false;
    }

    // Por fim, excluímos o cliente
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

export const deletePayment = async (paymentId: string): Promise<boolean> => {
  try {
    // First check if there's a transaction linked to this payment
    const { data: transactionData, error: transactionError } = await supabase
      .from('wedding_transactions')
      .select('id')
      .eq('payment_id', paymentId)
      .single();
    
    if (transactionError && transactionError.code !== 'PGRST116') {
      // PGRST116 is "Row not found" which is fine, means no transaction to delete
      console.error('Error checking for transaction:', transactionError);
      return false;
    }
    
    // If a transaction exists, delete it first
    if (transactionData) {
      const { error: deleteTransactionError } = await supabase
        .from('wedding_transactions')
        .delete()
        .eq('id', transactionData.id);
      
      if (deleteTransactionError) {
        console.error('Error deleting transaction:', deleteTransactionError);
        return false;
      }
    }
    
    // Now delete the payment itself
    const { error: deletePaymentError } = await supabase
      .from('wedding_payments')
      .delete()
      .eq('id', paymentId);
    
    if (deletePaymentError) {
      console.error('Error deleting payment:', deletePaymentError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception deleting payment:', error);
    return false;
  }
};

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
    // First, create the transaction record
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

    // If this is a client payment and no payment record exists yet, create one
    if (transaction.type === 'entrada' && transaction.clientId && !transaction.paymentId) {
      await supabase
        .from('wedding_payments')
        .insert({
          client_id: transaction.clientId,
          amount: transaction.amount,
          date: formatDateForSupabase(transaction.date),
          notes: transaction.description
        });
    }

    return data ? parseTransaction(data) : null;
  } catch (error) {
    console.error('Exception creating transaction:', error);
    return null;
  }
};

export const fetchFinancialCategories = async (): Promise<FinancialCategory[]> => {
  const { data, error } = await supabase
    .from('financial_categories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar categorias financeiras:', error);
    return [];
  }
  return (data || []).map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    type: cat.type,
    createdAt: cat.created_at ? new Date(cat.created_at) : new Date(),
  }));
};

export const createFinancialCategory = async ({
  name,
  type,
  photographer_id = '00000000-0000-0000-0000-000000000000',
}: { name: string; type: "entrada" | "saída"; photographer_id?: string }) => {
  try {
    console.log('Criando categoria financeira:', { name, type, photographer_id });
    
    const { data, error } = await supabase
      .from('financial_categories')
      .insert([
        {
          name,
          type,
          photographer_id
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar categoria financeira:', error);
      return null;
    }
    
    console.log('Categoria financeira criada com sucesso:', data);
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    } as FinancialCategory;
  } catch (error) {
    console.error('Exceção ao criar categoria financeira:', error);
    return null;
  }
};

export const clearAllData = async (): Promise<boolean> => {
  try {
    await supabase
      .from('wedding_transactions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    await supabase
      .from('wedding_payments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
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

export const deleteTransaction = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('wedding_transactions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};
