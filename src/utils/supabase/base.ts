
import { supabase } from '@/integrations/supabase/client';
import { TIMEZONE } from '@/utils/dateUtils';
import { fromZonedTime } from 'date-fns-tz';

// Helper functions for date formatting/parsing
export const parseDate = (dateString: string | null): Date | null => {
  if (!dateString) return null;
  
  // Parse the date and convert it to São Paulo timezone
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  
  // Return the date in the local timezone context
  return date;
};

export const formatDateForSupabase = (date: Date | null): string | null => {
  if (!date) return null;
  
  // Garante que o dia seja preservado no fuso horário brasileiro
  // Cria um novo objeto de data para evitar mutar a data original
  const safeDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    12, 0, 0 // Meio-dia para evitar problemas de fuso
  );
  
  return safeDate.toISOString();
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
