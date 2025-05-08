
import { supabase } from '@/integrations/supabase/client';
import { Payment } from '../../types';
import { formatDateForSupabase } from '../base';
import { parsePayment } from './parsers';
import { createTransaction } from '../transactions';
import { CreatePaymentParams } from './types';

/**
 * Create a new payment for a client
 */
export const createPayment = async (payment: CreatePaymentParams): Promise<Payment | null> => {
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
