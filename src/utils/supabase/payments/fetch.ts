
import { supabase } from '@/integrations/supabase/client';
import { Payment } from '../../types';
import { parsePayment } from './parsers';

/**
 * Fetch all payments for a specific client
 */
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
