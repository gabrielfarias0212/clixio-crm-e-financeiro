
import { supabase } from '@/integrations/supabase/client';

/**
 * Deletes a client and all related data from the database
 */
export const deleteClient = async (id: string): Promise<boolean> => {
  try {
    // First, delete the payments related to this client
    const { error: paymentsError } = await supabase
      .from('wedding_payments')
      .delete()
      .eq('client_id', id);

    if (paymentsError) {
      console.error('Error deleting client payments:', paymentsError);
      return false;
    }

    // Delete the transactions related to this client
    const { error: transactionsError } = await supabase
      .from('wedding_transactions')
      .delete()
      .eq('client_id', id);

    if (transactionsError) {
      console.error('Error deleting client transactions:', transactionsError);
      return false;
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

    return true;
  } catch (error) {
    console.error('Exception deleting client:', error);
    return false;
  }
};
