
import { supabase } from '@/integrations/supabase/client';
import { formatDate } from '@/utils/dates';

// Helper functions for date formatting/parsing
export const parseDate = (dateString: string | null): string | null => {
  if (!dateString) return null;
  
  // Parse the date and convert it to our standard format DD/MM/YYYY
  return formatDate(dateString);
};

// Format date for Supabase database format (YYYY-MM-DD)
export const formatDateForSupabase = (date: string | Date | null): string | null => {
  if (!date) return null;
  
  // If it's already a string in DD/MM/YYYY format, convert to database format
  if (typeof date === "string") {
    if (date.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = date.split('/').map(Number);
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    
    // If it's already in YYYY-MM-DD format, return as is
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return date;
    }
    
    // Try to parse as ISO date
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return null;
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    } catch (e) {
      return null;
    }
  }
  
  // If it's a Date object
  if (date instanceof Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  
  return null;
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
