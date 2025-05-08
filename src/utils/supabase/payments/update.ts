
import { supabase } from '@/integrations/supabase/client';
import { Payment, PaymentStatus } from '../../types';
import { formatDateForSupabase } from '../base';
import { parsePayment } from './parsers';

/**
 * Update an existing payment
 */
export const updatePayment = async (
  paymentId: string, 
  updates: Partial<Payment>
): Promise<Payment | null> => {
  try {
    // Make sure we don't update the id
    const { id, ...updateData } = updates;
    
    const { data, error } = await supabase
      .from('wedding_payments')
      .update(updateData)
      .eq('id', paymentId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating payment:', error);
      return null;
    }

    // Parse the payment data
    return parsePayment(data);
  } catch (error) {
    console.error('Error updating payment:', error);
    return null;
  }
};

/**
 * Update a payment's status
 */
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

/**
 * Update a payment's due date
 */
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
