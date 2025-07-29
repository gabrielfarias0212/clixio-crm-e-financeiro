
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Transaction } from '@/utils/types';
import { fetchTransactions, createTransaction, deleteTransaction as removeTransactionFromDB } from '@/utils/supabaseUtils';
import { toast } from 'sonner';

type TransactionsContextType = {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refreshTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<Transaction | null>;
  deleteTransaction: (transactionId: string) => Promise<void>;
};

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Usar refs para evitar múltiplas chamadas simultâneas
  const isRefreshing = useRef(false);
  const lastRefreshTime = useRef(0);
  const refreshCount = useRef(0);

  // Cache simples para evitar requests desnecessários
  const REFRESH_COOLDOWN = 1000; // 1 segundo

  const refreshTransactions = useCallback(async () => {
    // Prevenir múltiplas chamadas simultâneas
    if (isRefreshing.current) {
      console.log("Refresh já em andamento, ignorando");
      return;
    }

    // Implementar cooldown para evitar spam de requests
    const now = Date.now();
    if (now - lastRefreshTime.current < REFRESH_COOLDOWN) {
      console.log("Refresh em cooldown, ignorando");
      return;
    }
    
    const currentRefreshCount = refreshCount.current;
    
    try {
      isRefreshing.current = true;
      setLoading(true);
      setError(null);
      
      console.log("Buscando transações do banco...");
      const data = await fetchTransactions();
      console.log(`${data.length} transações carregadas`);
      
      setTransactions(data);
      lastRefreshTime.current = now;
      refreshCount.current++;
      
    } catch (err) {
      console.error('Erro ao buscar transações:', err);
      setError('Falha ao carregar as transações. Tente novamente.');
      toast.error('Falha ao carregar as transações');
    } finally {
      // Só alterar loading se esta ainda é a request mais recente
      if (currentRefreshCount === refreshCount.current - 1) {
        setLoading(false);
      }
      
      // Pequeno delay antes de permitir nova chamada
      setTimeout(() => {
        isRefreshing.current = false;
      }, 100);
    }
  }, []);

  const addTransaction = useCallback(async (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      const newTransaction = await createTransaction(transactionData);
      if (newTransaction) {
        // Update otimístico - adicionar imediatamente à lista local
        setTransactions(prev => [newTransaction, ...prev]);
        toast.success('Transação registrada com sucesso!');
        
        // Invalidar cache de outros hooks
        lastRefreshTime.current = 0;
        
        return newTransaction;
      }
      return null;
    } catch (err) {
      console.error('Erro ao adicionar transação:', err);
      toast.error('Falha ao adicionar transação');
      return null;
    }
  }, []);

  const deleteTransaction = useCallback(async (transactionId: string) => {
    try {
      // Capturar estado atual antes do update otimístico
      setTransactions(prev => {
        const originalTransactions = prev;
        const updatedTransactions = prev.filter(t => t.id !== transactionId);
        
        // Executar a exclusão no backend
        removeTransactionFromDB(transactionId)
          .then(() => {
            toast.success('Transação excluída com sucesso!');
            // Invalidar cache de outros hooks
            lastRefreshTime.current = 0;
          })
          .catch((err) => {
            console.error('Erro ao excluir transação:', err);
            // Reverter update otimístico em caso de erro
            setTransactions(originalTransactions);
            toast.error('Falha ao excluir transação');
          });
        
        return updatedTransactions;
      });
      
    } catch (err) {
      console.error('Erro ao excluir transação:', err);
      toast.error('Falha ao excluir transação');
    }
  }, []);

  // Carregar transações apenas uma vez na inicialização
  useEffect(() => {
    refreshTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array vazio intencional - só carregar uma vez

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        loading,
        error,
        refreshTransactions,
        addTransaction,
        deleteTransaction
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
}
