
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductSale, ProductPayment } from '@/utils/types';
import { 
  fetchProductSales, 
  createProductSale, 
  updateProductSale, 
  deleteProductSale,
  createProductPayment,
  updateProductPayment,
  deleteProductPayment
} from '@/utils/supabase/product-sales';
import { toast } from 'sonner';

export function useProductSales() {
  const queryClient = useQueryClient();

  const { 
    data: productSales = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['product-sales'],
    queryFn: fetchProductSales,
  });

  const createMutation = useMutation({
    mutationFn: createProductSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-sales'] });
      toast.success('Venda de produto criada com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating product sale:', error);
      toast.error('Erro ao criar venda de produto');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ProductSale> }) =>
      updateProductSale(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-sales'] });
      toast.success('Venda de produto atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating product sale:', error);
      toast.error('Erro ao atualizar venda de produto');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProductSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-sales'] });
      toast.success('Venda de produto excluída com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting product sale:', error);
      toast.error('Erro ao excluir venda de produto');
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: createProductPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-sales'] });
      toast.success('Pagamento adicionado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating product payment:', error);
      toast.error('Erro ao adicionar pagamento');
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ProductPayment> }) =>
      updateProductPayment(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-sales'] });
      toast.success('Pagamento atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating product payment:', error);
      toast.error('Erro ao atualizar pagamento');
    },
  });

  return {
    productSales,
    isLoading,
    error,
    createProductSale: createMutation.mutate,
    updateProductSale: updateMutation.mutate,
    deleteProductSale: deleteMutation.mutate,
    createProductPayment: createPaymentMutation.mutate,
    updateProductPayment: updatePaymentMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
