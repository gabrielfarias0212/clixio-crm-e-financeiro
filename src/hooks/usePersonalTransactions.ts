
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  fetchPersonalTransactions, 
  createPersonalTransaction, 
  deletePersonalTransaction,
  migrateLocalStorageToDatabase,
  PersonalTransaction
} from "@/utils/supabase/personal-transactions";

export type { PersonalTransaction };

export function usePersonalTransactions() {
  const [transactions, setTransactions] = useState<PersonalTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar transações do banco de dados
  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Executar migração se necessário
      await migrateLocalStorageToDatabase();
      
      // Buscar transações do banco
      const data = await fetchPersonalTransactions();
      console.log('📋 Transações carregadas:', data);
      setTransactions(data);
    } catch (err) {
      console.error('Erro ao carregar transações:', err);
      setError('Erro ao carregar transações');
      toast.error('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  // Carregar transações na inicialização
  useEffect(() => {
    loadTransactions();
  }, []);

  const addTransaction = async (
    type: 'entrada' | 'saida', 
    amount: string, 
    description: string, 
    category?: string,
    proLaboreWeekKey?: string
  ) => {
    if (!amount || !description) {
      toast.error('Preencha todos os campos');
      return false;
    }

    try {
      console.log('💾 Criando transação:', { type, amount, description, category, proLaboreWeekKey });
      
      const newTransaction = await createPersonalTransaction(
        type,
        parseFloat(amount),
        description,
        category,
        proLaboreWeekKey
      );

      console.log('✅ Transação criada:', newTransaction);

      // Atualizar estado local imediatamente
      setTransactions(prev => {
        const updated = [newTransaction, ...prev];
        console.log('🔄 Estado atualizado:', updated);
        return updated;
      });
      
      const successMessage = type === 'entrada' ? 'Entrada registrada com sucesso!' : 'Saída registrada com sucesso!';
      toast.success(successMessage);
      
      return true;
    } catch (err) {
      console.error('Erro ao adicionar transação:', err);
      toast.error('Erro ao registrar transação');
      return false;
    }
  };

  const removeTransaction = async (transactionId: string) => {
    try {
      console.log('🗑️ Removendo transação:', transactionId);
      
      await deletePersonalTransaction(transactionId);
      
      // Atualizar estado local imediatamente
      setTransactions(prev => {
        const updated = prev.filter(t => t.id !== transactionId);
        console.log('🔄 Estado atualizado após remoção:', updated);
        return updated;
      });
      
      toast.success('Transação removida com sucesso!');
    } catch (err) {
      console.error('Erro ao remover transação:', err);
      toast.error('Erro ao remover transação');
    }
  };

  const getTotals = () => {
    const totalEntries = transactions
      .filter(t => t.type === 'entrada')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'saida')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalEntries - totalExpenses;

    return { totalEntries, totalExpenses, balance };
  };

  return {
    transactions,
    loading,
    error,
    addTransaction,
    removeTransaction,
    getTotals,
    refreshTransactions: loadTransactions
  };
}
