
import { supabase } from '@/integrations/supabase/client';
import { Transaction, TransactionType, TransactionCategory } from '../types';
import { parseDate, formatDateForSupabase } from './base';

export const parseTransaction = (transaction: any): Transaction => {
  return {
    id: transaction.id,
    amount: Number(transaction.amount),
    date: parseDate(transaction.date) || "",
    type: transaction.type as TransactionType,
    category: transaction.category as TransactionCategory,
    description: transaction.description,
    clientId: transaction.client_id,
    paymentId: transaction.payment_id,
    createdAt: parseDate(transaction.created_at) || "",
  };
};

export const fetchTransactions = async (): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('wedding_transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    return data?.map(parseTransaction) || [];
  } catch (err) {
    console.error('Exception fetching transactions:', err);
    return [];
  }
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
          notes: transaction.description,
          payment_status: 'pago' // Change from 'pendente' (default) to 'pago'
        });
    }

    return data ? parseTransaction(data) : null;
  } catch (error) {
    console.error('Exception creating transaction:', error);
    return null;
  }
};

export const deleteTransaction = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('wedding_transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transaction:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception deleting transaction:', error);
    return false;
  }
};
