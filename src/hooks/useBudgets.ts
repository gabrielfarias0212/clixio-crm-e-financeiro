import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchBudgets, 
  fetchBudgetWithItems, 
  createBudget, 
  updateBudget, 
  deleteBudget 
} from '@/utils/supabase/budgets';
import { CreateBudgetData } from '@/types/budget';
import { toast } from 'sonner';

export function useBudgets() {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: fetchBudgets,
  });
}

export function useBudget(budgetId: string) {
  return useQuery({
    queryKey: ['budget', budgetId],
    queryFn: () => fetchBudgetWithItems(budgetId),
    enabled: !!budgetId,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budgetData: CreateBudgetData) => {
      console.log('useCreateBudget - starting mutation with data:', {
        client_name: budgetData.client_name,
        budget_title: budgetData.budget_title,
        items_count: budgetData.items.length
      });
      
      try {
        const result = await createBudget(budgetData);
        console.log('useCreateBudget - mutation successful:', result);
        return result;
      } catch (error) {
        console.error('useCreateBudget - mutation failed:', error);
        throw error;
      }
    },
    onSuccess: (budgetId) => {
      console.log('useCreateBudget - onSuccess called with budgetId:', budgetId);
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Orçamento criado com sucesso!');
    },
    onError: (error) => {
      console.error('useCreateBudget - onError called:', error);
      toast.error('Erro ao criar orçamento');
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ budgetId, updates }: { budgetId: string; updates: any }) => 
      updateBudget(budgetId, updates),
    onSuccess: (_, { budgetId }) => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget', budgetId] });
      toast.success('Orçamento atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating budget:', error);
      toast.error('Erro ao atualizar orçamento');
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Orçamento excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting budget:', error);
      toast.error('Erro ao excluir orçamento');
    },
  });
}
