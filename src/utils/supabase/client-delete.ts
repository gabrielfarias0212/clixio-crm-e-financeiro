
import { supabase } from '@/integrations/supabase/client';

/**
 * Deletes a client and all related data from the database
 */
export const deleteClient = async (id: string): Promise<boolean> => {
  try {
    // Delete calendar events related to this client
    const { error: calendarEventsError } = await supabase
      .from('calendar_events')
      .delete()
      .eq('client_id', id);

    if (calendarEventsError) {
      console.error('Error deleting client calendar events:', calendarEventsError);
      // Continue with other deletions, this might not have any records
    }

    // Delete payments related to this client
    const { error: paymentsError } = await supabase
      .from('wedding_payments')
      .delete()
      .eq('client_id', id);

    if (paymentsError) {
      console.error('Error deleting client payments:', paymentsError);
      // Continue with other deletions
    }

    // Delete transactions related to this client
    const { error: transactionsError } = await supabase
      .from('wedding_transactions')
      .delete()
      .eq('client_id', id);

    if (transactionsError) {
      console.error('Error deleting client transactions:', transactionsError);
      // Continue with other deletions
    }

    // Delete contract form submissions related to this client
    const { error: contractFormError } = await supabase
      .from('contract_form_submissions')
      .delete()
      .eq('client_id', id);

    if (contractFormError) {
      console.error('Error deleting client contract forms:', contractFormError);
      // Continue with other deletions
    }

    // Delete product sales related to this client
    const { error: productSalesError } = await supabase
      .from('product_sales')
      .delete()
      .eq('client_id', id);

    if (productSalesError) {
      console.error('Error deleting client product sales:', productSalesError);
      // Continue with other deletions
    }

    // Finally, delete the client
    const { error: clientError } = await supabase
      .from('wedding_clients')
      .delete()
      .eq('id', id);

    if (clientError) {
      console.error('Error deleting client:', clientError);
      return false;
    }

    console.log('Client deleted successfully:', id);
    return true;
  } catch (error) {
    console.error('Exception deleting client:', error);
    return false;
  }
};
