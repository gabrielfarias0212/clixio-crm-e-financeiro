
import { supabase } from '@/integrations/supabase/client';

// Helper functions for date formatting/parsing
export const parseDate = (dateString: string | null): Date | null => {
  if (!dateString) return null;
  return new Date(dateString);
};

export const formatDateForSupabase = (date: Date | null): string | null => {
  if (!date) return null;
  return date.toISOString();
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
