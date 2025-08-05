
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchContractTemplates,
  fetchContractTemplate,
  createContractTemplate,
  updateContractTemplate,
  deleteContractTemplate,
  fetchContractClauses,
  createContractClause,
  updateContractClause,
  deleteContractClause,
  fetchGeneratedContracts,
  createGeneratedContract,
  updateGeneratedContract
} from '@/utils/supabaseUtils';
import { ContractTemplate, ContractClause, GeneratedContract } from '@/types/contract';
import { toast } from 'sonner';

export const useContractTemplates = () => {
  return useQuery({
    queryKey: ['contract-templates'],
    queryFn: fetchContractTemplates,
  });
};

export const useContractTemplate = (id: string) => {
  return useQuery({
    queryKey: ['contract-template', id],
    queryFn: () => fetchContractTemplate(id),
    enabled: !!id,
  });
};

export const useContractClauses = () => {
  return useQuery({
    queryKey: ['contract-clauses'],
    queryFn: fetchContractClauses,
  });
};

export const useGeneratedContracts = () => {
  return useQuery({
    queryKey: ['generated-contracts'],
    queryFn: fetchGeneratedContracts,
  });
};

export const useCreateContractTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (template: Omit<ContractTemplate, 'id' | 'created_at' | 'updated_at'>) => 
      createContractTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-templates'] });
      toast.success('Template de contrato criado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao criar template de contrato');
    }
  });
};

export const useUpdateContractTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ContractTemplate> }) =>
      updateContractTemplate(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contract-templates'] });
      queryClient.invalidateQueries({ queryKey: ['contract-template', data.id] });
      toast.success('Template atualizado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar template');
    }
  });
};

export const useDeleteContractTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteContractTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-templates'] });
      toast.success('Template excluído com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao excluir template');
    }
  });
};

export const useCreateContractClause = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (clause: Omit<ContractClause, 'id' | 'created_at' | 'updated_at'>) =>
      createContractClause(clause),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-clauses'] });
      toast.success('Cláusula criada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao criar cláusula');
    }
  });
};

export const useUpdateContractClause = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ContractClause> }) =>
      updateContractClause(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-clauses'] });
      toast.success('Cláusula atualizada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar cláusula');
    }
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
    onError: () => {
      toast.error('Erro ao excluir cláusula');
    }
  });
};

export const useCreateGeneratedContract = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (contract: Omit<GeneratedContract, 'id' | 'created_at' | 'updated_at'>) =>
      createGeneratedContract(contract),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-contracts'] });
      toast.success('Contrato gerado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao gerar contrato');
    }
  });
};

export const useUpdateGeneratedContract = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<GeneratedContract> }) =>
      updateGeneratedContract(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['generated-contracts'] });
      queryClient.invalidateQueries({ queryKey: ['generated-contract', data.id] });
      toast.success('Contrato atualizado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar contrato');
    }
  });
};
