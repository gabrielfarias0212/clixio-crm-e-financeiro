
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  fetchContracts, 
  fetchContract, 
  createContract, 
  updateContract, 
  deleteContract 
} from '@/utils/supabase/contracts';
import { ContractFormData } from '@/types/contract';

export const useContracts = () => {
  return useQuery({
    queryKey: ['contracts'],
    queryFn: fetchContracts,
  });
};

export const useContract = (id: string) => {
  return useQuery({
    queryKey: ['contract', id],
    queryFn: () => fetchContract(id),
    enabled: !!id,
  });
};

export const useCreateContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast.success('Contrato criado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating contract:', error);
      toast.error('Erro ao criar contrato');
    },
  });
};

export const useUpdateContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ContractFormData> }) => 
      updateContract(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast.success('Contrato atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating contract:', error);
      toast.error('Erro ao atualizar contrato');
    },
  });
};

export const useDeleteContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast.success('Contrato excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting contract:', error);
      toast.error('Erro ao excluir contrato');
    },
  });
};
