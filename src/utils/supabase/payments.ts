import { supabase } from '@/integrations/supabase/client';
import { Payment, PaymentStatus } from '../types';
import { parseDate, formatDateForSupabase } from './base';
import { createTransaction, deleteTransaction } from './transactions';

export const parsePayment = (payment: any): Payment => {
  return {
    id: payment.id,
    amount: Number(payment.amount),
    date: parseDate(payment.date) || "",
    notes: payment.notes,
    due_date: payment.due_date ? parseDate(payment.due_date) : undefined,
    payment_status: payment.payment_status as PaymentStatus || "pendente"
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

export const createPayment = async (payment: { 
  clientId: string, 
  amount: number, 
  date: string, 
  notes?: string,
  due_date?: string,
  payment_status?: string
}): Promise<Payment | null> => {
  try {
    const { data, error } = await supabase
      .from('wedding_payments')
      .insert({
        client_id: payment.clientId,
        amount: payment.amount,
        date: formatDateForSupabase(payment.date),
        notes: payment.notes,
        due_date: payment.due_date ? formatDateForSupabase(payment.due_date) : null,
        payment_status: payment.payment_status || 'pendente'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating payment:', error);
      return null;
    }

    // Only create a transaction if the payment is not pending
    if (data && (payment.payment_status !== 'pendente')) {
      // Create a corresponding transaction for this payment
      const transactionDescription = payment.notes 
        ? `Pagamento de cliente: ${payment.notes}`
        : `Pagamento de cliente`;
        
      await createTransaction({
        amount: payment.amount,
        date: payment.date,
        type: 'entrada',
        category: 'pagamento de cliente',
        description: transactionDescription,
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

// Update a payment's status
export const updatePaymentStatus = async (paymentId: string, status: PaymentStatus): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('wedding_payments')
      .update({ payment_status: status })
      .eq('id', paymentId);
    
    if (error) {
      console.error('Error updating payment status:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception updating payment status:', error);
    return false;
  }
};

// Update payment due date
export const updatePaymentDueDate = async (paymentId: string, dueDate: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('wedding_payments')
      .update({ due_date: formatDateForSupabase(dueDate) })
      .eq('id', paymentId);
    
    if (error) {
      console.error('Error updating payment due date:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception updating payment due date:', error);
    return false;
  }
};

// Update payment notes
export const updatePaymentNotes = async (paymentId: string, notes: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('wedding_payments')
      .update({ notes })
      .eq('id', paymentId);
    
    if (error) {
      console.error('Error updating payment notes:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception updating payment notes:', error);
    return false;
  }
};

// Utility function to check for overdue payments
export const checkAndUpdateOverduePayments = async (): Promise<void> => {
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
  
  try {
    // First get all payments that are due but still marked as 'pendente'
    const { data, error } = await supabase
      .from('wedding_payments')
      .select('id')
      .eq('payment_status', 'pendente')
      .lt('due_date', today);
    
    if (error) {
      console.error('Error checking for overdue payments:', error);
      return;
    }
    
    // Update all overdue payments to 'atrasado' status
    if (data && data.length > 0) {
      const paymentIds = data.map(p => p.id);
      
      const { error: updateError } = await supabase
        .from('wedding_payments')
        .update({ payment_status: 'atrasado' })
        .in('id', paymentIds);
      
      if (updateError) {
        console.error('Error updating overdue payments:', updateError);
      }
    }
  } catch (error) {
    console.error('Exception in checking overdue payments:', error);
  }
};

export const markContractAsPaid = async (clientId: string, createTransactionFlag: boolean = true): Promise<boolean> => {
  try {
    // First, get all pending payments for this client
    const { data: pendingPayments, error: fetchError } = await supabase
      .from('wedding_payments')
      .select('*')
      .eq('client_id', clientId)
      .neq('payment_status', 'pago');
    
    if (fetchError) {
      console.error('Error fetching pending payments:', fetchError);
      return false;
    }

    if (!pendingPayments || pendingPayments.length === 0) {
      console.log('No pending payments found for client');
      return true; // Already fully paid
    }

    // Update all pending payments to "pago" status
    const paymentIds = pendingPayments.map(p => p.id);
    
    const { error: updateError } = await supabase
      .from('wedding_payments')
      .update({ payment_status: 'pago' })
      .in('id', paymentIds);
    
    if (updateError) {
      console.error('Error updating payment status:', updateError);
      return false;
    }

    // Create transactions only if requested
    if (createTransactionFlag) {
      for (const payment of pendingPayments) {
        const transactionDescription = payment.notes 
          ? `Pagamento de cliente: ${payment.notes}`
          : `Pagamento de cliente - Contrato quitado`;
          
        await createTransaction({
          amount: Number(payment.amount),
          date: formatDateForSupabase(new Date().toISOString()),
          type: 'entrada',
          category: 'pagamento de cliente',
          description: transactionDescription,
          clientId: clientId,
          paymentId: payment.id
        });
      }
    }

    return true;
  } catch (error) {
    console.error('Exception in markContractAsPaid:', error);
    return false;
  }
};
