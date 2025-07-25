
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  fetchContractTemplates, 
  createContractTemplate, 
  updateContractTemplate, 
  deleteContractTemplate 
} from '@/utils/supabase/contracts';

export const useContractTemplates = () => {
  return useQuery({
    queryKey: ['contract-templates'],
    queryFn: fetchContractTemplates,
  });
};

export const useCreateContractTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, content, isDefault }: { name: string; content: string; isDefault?: boolean }) => 
      createContractTemplate(name, content, isDefault),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-templates'] });
      toast.success('Template criado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating template:', error);
      toast.error('Erro ao criar template');
    },
  });
};

export const useUpdateContractTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name, content }: { id: string; name: string; content: string }) => 
      updateContractTemplate(id, name, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-templates'] });
      toast.success('Template atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating template:', error);
      toast.error('Erro ao atualizar template');
    },
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
    onError: (error) => {
      console.error('Error deleting template:', error);
      toast.error('Erro ao excluir template');
    },
  });
};
