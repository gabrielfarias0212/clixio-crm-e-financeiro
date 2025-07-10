
import { supabase } from '@/integrations/supabase/client';

export interface PersonalFixedExpense {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  due_date: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePersonalFixedExpenseData {
  description: string;
  amount: number;
  due_date?: number | null;
  is_active?: boolean;
}

export interface UpdatePersonalFixedExpenseData {
  description?: string;
  amount?: number;
  due_date?: number | null;
  is_active?: boolean;
}

export const fetchPersonalFixedExpenses = async (): Promise<PersonalFixedExpense[]> => {
  const { data, error } = await supabase
    .from('personal_fixed_expenses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching personal fixed expenses:', error);
    throw error;
  }

  return data || [];
};

export const createPersonalFixedExpense = async (expenseData: CreatePersonalFixedExpenseData): Promise<PersonalFixedExpense> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('personal_fixed_expenses')
    .insert({
      ...expenseData,
      user_id: user.id,
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error creating personal fixed expense:', error);
    throw error;
  }

  return data;
};

export const updatePersonalFixedExpense = async (id: string, expenseData: UpdatePersonalFixedExpenseData): Promise<PersonalFixedExpense> => {
  const { data, error } = await supabase
    .from('personal_fixed_expenses')
    .update(expenseData)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('Error updating personal fixed expense:', error);
    throw error;
  }

  return data;
};

export const deletePersonalFixedExpense = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('personal_fixed_expenses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting personal fixed expense:', error);
    throw error;
  }
};

export const getTotalFixedExpenses = (expenses: PersonalFixedExpense[]): number => {
  return expenses
    .filter(expense => expense.is_active)
    .reduce((total, expense) => total + Number(expense.amount), 0);
};
