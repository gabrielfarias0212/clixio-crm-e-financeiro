
import { useState, useEffect } from 'react';
import { QuickTransaction, QuickSaleFormData } from '@/utils/types';
import {
  fetchQuickTransactions,
  createQuickSale,
  updateQuickTransactionPaymentStatus
} from '@/utils/supabase/quick-sales';
import { toast } from 'sonner';

export function useQuickSales() {
  const [quickTransactions, setQuickTransactions] = useState<QuickTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshQuickTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchQuickTransactions();
      setQuickTransactions(data);
    } catch (err) {
      console.error('Error fetching quick transactions:', err);
      setError('Falha ao carregar transações rápidas');
      toast.error('Falha ao carregar transações rápidas');
    } finally {
      setLoading(false);
    }
  };

  const addQuickSale = async (saleData: QuickSaleFormData) => {
    try {
      const newTransaction = await createQuickSale(saleData);
      setQuickTransactions(prev => [newTransaction, ...prev]);
      toast.success('Venda registrada com sucesso!');
      return newTransaction;
    } catch (err) {
      console.error('Error creating quick sale:', err);
      toast.error('Falha ao registrar venda');
      throw err;
    }
  };

  const updatePaymentStatus = async (id: string, status: string) => {
    try {
      const updated = await updateQuickTransactionPaymentStatus(id, status);
      setQuickTransactions(prev => prev.map(transaction => 
        transaction.id === id ? updated : transaction
      ));
      toast.success('Status de pagamento atualizado!');
      return updated;
    } catch (err) {
      console.error('Error updating payment status:', err);
      toast.error('Falha ao atualizar status de pagamento');
      throw err;
    }
  };

  useEffect(() => {
    refreshQuickTransactions();
  }, []);

  return {
    quickTransactions,
    loading,
    error,
    refreshQuickTransactions,
    addQuickSale,
    updatePaymentStatus
  };
}
