
import { supabase } from '@/integrations/supabase/client';

/**
 * Check for and update overdue payments
 */
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
