
import { supabase } from '@/integrations/supabase/client';
import { FinancialCategory } from '../types';
import { dateToString } from '../dateUtils';

// Fetch all financial categories
export const fetchFinancialCategories = async (): Promise<FinancialCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('financial_categories')
      .select('*');
    
    if (error) throw error;
    
    // Map to our FinancialCategory type, converting dates to strings
    return data.map(category => ({
      id: category.id,
      name: category.name,
      type: category.type,
      createdAt: dateToString(new Date(category.created_at))
    }));
  } catch (error) {
    console.error('Error fetching financial categories:', error);
    return [];
  }
};

// Create a new financial category
export const createFinancialCategory = async ({ 
  name, 
  type 
}: { 
  name: string; 
  type: 'entrada' | 'saída';
}): Promise<FinancialCategory | null> => {
  try {
    const { data, error } = await supabase
      .from('financial_categories')
      .insert({
        name,
        type
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Return the created category
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      createdAt: dateToString(new Date(data.created_at))
    };
  } catch (error) {
    console.error('Error creating financial category:', error);
    return null;
  }
};
