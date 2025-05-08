
import { supabase } from '@/integrations/supabase/client';

/**
 * Delete a payment and its associated transaction (if exists)
 */
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
