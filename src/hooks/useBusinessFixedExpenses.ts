import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  fetchBusinessFixedExpenses,
  createBusinessFixedExpense,
  updateBusinessFixedExpense,
  deleteBusinessFixedExpense,
  BusinessFixedExpense
} from "@/utils/supabase/business-fixed-expenses";

export type { BusinessFixedExpense };

export function useBusinessFixedExpenses() {
  const [expenses, setExpenses] = useState<BusinessFixedExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchBusinessFixedExpenses();
      setExpenses(data);
    } catch (err) {
      console.error('Erro ao carregar despesas fixas:', err);
      setError('Erro ao carregar despesas fixas');
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
      const newExpense = await createBusinessFixedExpense(description.trim(), amount, dueDate);
      setExpenses(prev => [...prev, newExpense]);
      toast.success('Despesa fixa cadastrada com sucesso!');
      return true;
    } catch (err) {
      console.error('Erro ao criar despesa fixa:', err);
      toast.error('Erro ao cadastrar despesa fixa');
      return false;
    }
  };

  const updateExpense = async (
    id: string,
    updates: Partial<Pick<BusinessFixedExpense, 'description' | 'amount' | 'due_date' | 'is_active'>>
  ) => {
    try {
      const updated = await updateBusinessFixedExpense(id, updates);
      setExpenses(prev => prev.map(e => e.id === id ? updated : e));
      toast.success('Despesa fixa atualizada!');
      return true;
    } catch (err) {
      console.error('Erro ao atualizar despesa fixa:', err);
      toast.error('Erro ao atualizar despesa fixa');
      return false;
    }
  };

  const removeExpense = async (id: string) => {
    try {
      await deleteBusinessFixedExpense(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
      toast.success('Despesa fixa removida!');
      return true;
    } catch (err) {
      console.error('Erro ao remover despesa fixa:', err);
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
