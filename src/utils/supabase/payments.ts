
import { supabase } from '@/integrations/supabase/client';
import { Payment } from '../types';
import { parseDate, formatDateForSupabase } from './base';
import { createTransaction } from './transactions';

export const parsePayment = (payment: any): Payment => {
  return {
    id: payment.id,
    amount: Number(payment.amount),
    date: parseDate(payment.date) || new Date(),
    notes: payment.notes,
  };
};

export const fetchPaymentsForClient = async (clientId: string): Promise<Payment[]> => {
  const { data: paymentsData, error: paymentsError } = await supabase
    .from('wedding_payments')
    .select('*')
    .eq('client_id', clientId)
    .order('date', { ascending: false });
  
  if (paymentsError) {
    console.error('Error fetching payments for client:', paymentsError);
    return [];
  }

  return paymentsData?.map(parsePayment) || [];
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
