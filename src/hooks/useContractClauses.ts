
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  fetchContractClauses, 
  createContractClause, 
  updateContractClause, 
  deleteContractClause,
  reorderContractClauses
} from '@/utils/supabase/contracts';
import { ContractClause } from '@/types/contract';

export const useContractClauses = () => {
  return useQuery({
    queryKey: ['contract-clauses'],
    queryFn: fetchContractClauses,
  });
};

export const useCreateContractClause = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ title, content, clauseOrder, isRequired }: { 
      title: string; 
      content: string; 
      clauseOrder: number;
      isRequired: boolean;
    }) => createContractClause(title, content, clauseOrder, isRequired),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-clauses'] });
      toast.success('Cláusula criada com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating clause:', error);
      toast.error('Erro ao criar cláusula');
    },
  });
};

export const useUpdateContractClause = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, title, content, clauseOrder, isRequired }: { 
      id: string; 
      title: string; 
      content: string;
      clauseOrder: number;
      isRequired: boolean;
    }) => updateContractClause(id, title, content, clauseOrder, isRequired),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-clauses'] });
      toast.success('Cláusula atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating clause:', error);
      toast.error('Erro ao atualizar cláusula');
    },
  });
};

export const useDeleteContractClause = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteContractClause,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-clauses'] });
      toast.success('Cláusula excluída com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting clause:', error);
      toast.error('Erro ao excluir cláusula');
    },
  });
};

export const useReorderContractClauses = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reorderContractClauses,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-clauses'] });
      toast.success('Ordem das cláusulas atualizada!');
    },
    onError: (error) => {
      console.error('Error reordering clauses:', error);
      toast.error('Erro ao reordenar cláusulas');
    },
  });
};
