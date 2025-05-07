
import { supabase } from '@/integrations/supabase/client';
import { formatDateForSupabase, formatDate } from '@/utils/dateUtils';

// Helper functions for date formatting/parsing
export const parseDate = (dateString: string | null): string | null => {
  if (!dateString) return null;
  
  // Parse the date and convert it to our standard format DD/MM/YYYY
  return formatDate(dateString);
};

export const formatDateForSupabase = (date: string | Date | null): string | null => {
  if (!date) return null;
  
  return formatDateForSupabase(date);
};

// Generic delete function for clearing all data
export const clearAllData = async (): Promise<boolean> => {
  try {
    await supabase
      .from('wedding_transactions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    await supabase
      .from('wedding_payments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    await supabase
      .from('wedding_clients')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};
