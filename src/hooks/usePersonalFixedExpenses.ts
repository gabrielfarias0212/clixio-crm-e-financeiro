
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  fetchPersonalFixedExpenses,
  createPersonalFixedExpense,
  updatePersonalFixedExpense,
  deletePersonalFixedExpense,
  getTotalFixedExpenses,
  type PersonalFixedExpense,
  type CreatePersonalFixedExpenseData,
  type UpdatePersonalFixedExpenseData,
} from '@/utils/supabase/personal-fixed-expenses';

export const usePersonalFixedExpenses = () => {
  const [expenses, setExpenses] = useState<PersonalFixedExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPersonalFixedExpenses();
      setExpenses(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar contas fixas';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expenseData: CreatePersonalFixedExpenseData): Promise<boolean> => {
    try {
      const newExpense = await createPersonalFixedExpense(expenseData);
      setExpenses(prev => [newExpense, ...prev]);
      toast({
        title: "Sucesso",
        description: "Conta fixa adicionada com sucesso!",
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar conta fixa';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  const updateExpense = async (id: string, expenseData: UpdatePersonalFixedExpenseData): Promise<boolean> => {
    try {
      const updatedExpense = await updatePersonalFixedExpense(id, expenseData);
      setExpenses(prev => prev.map(expense => 
        expense.id === id ? updatedExpense : expense
      ));
      toast({
        title: "Sucesso",
        description: "Conta fixa atualizada com sucesso!",
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar conta fixa';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  const removeExpense = async (id: string): Promise<boolean> => {
    try {
      await deletePersonalFixedExpense(id);
      setExpenses(prev => prev.filter(expense => expense.id !== id));
      toast({
        title: "Sucesso",
        description: "Conta fixa removida com sucesso!",
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover conta fixa';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleExpenseStatus = async (id: string, isActive: boolean): Promise<boolean> => {
    return updateExpense(id, { is_active: isActive });
  };

  const getTotalMonthly = (): number => {
    return getTotalFixedExpenses(expenses);
  };

  const getActiveExpenses = (): PersonalFixedExpense[] => {
    return expenses.filter(expense => expense.is_active);
  };

  const getInactiveExpenses = (): PersonalFixedExpense[] => {
    return expenses.filter(expense => !expense.is_active);
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  return {
    expenses,
    loading,
    error,
    addExpense,
    updateExpense,
    removeExpense,
    toggleExpenseStatus,
    getTotalMonthly,
    getActiveExpenses,
    getInactiveExpenses,
    refreshExpenses: loadExpenses,
  };
};
