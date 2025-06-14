
import { supabase } from '@/integrations/supabase/client';
import { FinancialCategory, TransactionType } from '../types';
import { dateToString } from '../dateUtils';

// Helper function to convert database type to app type
const mapDbTypeToAppType = (dbType: string): TransactionType => {
  return dbType === 'entrada' || dbType === 'income' ? 'entrada' : 'saída';
};

// Helper function to convert app type to database type
const mapAppTypeToDbType = (appType: TransactionType): 'income' | 'expense' => {
  return appType === 'entrada' ? 'income' : 'expense';
};

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
      type: mapDbTypeToAppType(category.type),
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
  type: TransactionType;
}): Promise<FinancialCategory | null> => {
  try {
    // Get the current user's ID to use as photographer_id
    const { data: { session } } = await supabase.auth.getSession();
    const photographerId = session?.user?.id;
    
    if (!photographerId) {
      throw new Error('User not authenticated');
    }
    
    const dbType = mapAppTypeToDbType(type);
    
    const { data, error } = await supabase
      .from('financial_categories')
      .insert({
        name,
        type: dbType, // Use converted type for DB insertion
        photographer_id: photographerId
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Return the created category
    return {
      id: data.id,
      name: data.name,
      type: mapDbTypeToAppType(data.type),
      createdAt: dateToString(new Date(data.created_at))
    };
  } catch (error) {
    console.error('Error creating financial category:', error);
    return null;
  }
};

// Delete a financial category
export const deleteFinancialCategory = async (categoryId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('financial_categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.error('Error deleting financial category:', error.message);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting financial category:', error);
    return false;
  }
};
