
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshTransactions = useCallback(async () => {
    // Prevent multiple refreshes within a short time period
    if (isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      setLoading(true);
      setError(null);
      console.log("Fetching transactions from database...");
      const data = await fetchTransactions();
      console.log(`Fetched ${data.length} transactions`);
      setTransactions(data);
      setLastRefreshTime(Date.now());
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Falha ao carregar as transações. Por favor, tente novamente.');
      toast.error('Falha ao carregar as transações');
    } finally {
      setLoading(false);
      // Add a small delay before allowing another refresh
      setTimeout(() => {
        setIsRefreshing(false);
      }, 300);
    }
  }, [isRefreshing]);

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      const newTransaction = await createTransaction(transactionData);
      if (newTransaction) {
        // Immediately update the local state for responsive UI
        setTransactions(prev => [newTransaction, ...prev]);
        toast.success('Transação registrada com sucesso!');
        
        // Refresh transactions to ensure consistency
        refreshTransactions();
        
        return newTransaction;
      }
      return null;
    } catch (err) {
      console.error('Error adding transaction:', err);
      toast.error('Falha ao adicionar transação');
      return null;
    }
  };

  const deleteTransaction = async (transactionId: string) => {
    try {
      await removeTransactionFromDB(transactionId);
      // Immediately update the local state for responsive UI
      setTransactions(prev => prev.filter(t => t.id !== transactionId));
      toast.success('Transação excluída com sucesso!');
      
      // Refresh transactions to ensure consistency
      refreshTransactions();
    } catch (err) {
      console.error('Error deleting transaction:', err);
      toast.error('Falha ao excluir transação');
    }
  };

  useEffect(() => {
    refreshTransactions();
  }, []);

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
