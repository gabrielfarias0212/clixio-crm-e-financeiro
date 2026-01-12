import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

export function usePersonalFixedExpenses() {
  const [expenses, setExpenses] = useState<PersonalFixedExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error: fetchError } = await supabase
        .from('personal_fixed_expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (fetchError) throw fetchError;

      setExpenses(data as PersonalFixedExpense[]);
    } catch (err) {
      console.error('Erro ao carregar despesas fixas pessoais:', err);
      setError('Erro ao carregar despesas fixas pessoais');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const addExpense = async (description: string, amount: number, dueDate: number | null) => {
    if (!description.trim()) {
      toast.error('Descrição é obrigatória');
      return false;
    }
    if (amount <= 0) {
      toast.error('Valor deve ser maior que zero');
      return false;
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('personal_fixed_expenses')
        .insert({
          user_id: user.id,
          description: description.trim(),
          amount,
          due_date: dueDate,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      setExpenses(prev => [...prev, data as PersonalFixedExpense]);
      toast.success('Despesa fixa cadastrada com sucesso!');
      return true;
    } catch (err) {
      console.error('Erro ao criar despesa fixa pessoal:', err);
      toast.error('Erro ao cadastrar despesa fixa');
      return false;
    }
  };

  const updateExpense = async (
    id: string,
    updates: Partial<Pick<PersonalFixedExpense, 'description' | 'amount' | 'due_date' | 'is_active'>>
  ) => {
    try {
      const { data, error } = await supabase
        .from('personal_fixed_expenses')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setExpenses(prev => prev.map(e => e.id === id ? data as PersonalFixedExpense : e));
      toast.success('Despesa fixa atualizada!');
      return true;
    } catch (err) {
      console.error('Erro ao atualizar despesa fixa pessoal:', err);
      toast.error('Erro ao atualizar despesa fixa');
      return false;
    }
  };

  const removeExpense = async (id: string) => {
    try {
      const { error } = await supabase
        .from('personal_fixed_expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setExpenses(prev => prev.filter(e => e.id !== id));
      toast.success('Despesa fixa removida!');
      return true;
    } catch (err) {
      console.error('Erro ao remover despesa fixa pessoal:', err);
      toast.error('Erro ao remover despesa fixa');
      return false;
    }
  };

  const getActiveExpenses = useCallback(() => {
    return expenses.filter(e => e.is_active);
  }, [expenses]);

  const getTotalMonthlyExpenses = useCallback(() => {
    return getActiveExpenses().reduce((sum, e) => sum + e.amount, 0);
  }, [getActiveExpenses]);

  return {
    expenses,
    loading,
    error,
    addExpense,
    updateExpense,
    removeExpense,
    getActiveExpenses,
    getTotalMonthlyExpenses,
    refreshExpenses: loadExpenses
  };
}
