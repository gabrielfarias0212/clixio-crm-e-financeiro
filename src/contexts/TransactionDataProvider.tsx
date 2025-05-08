
import React, { useState, useEffect, useCallback } from 'react';
import { useTransactions } from './TransactionsContext';
import { Transaction } from '@/utils/types';
import { processBatch } from '@/utils/dataUtils';
import { 
  FinancialSummary, 
  MonthlyData, 
  calculateSummary,
  getTransactionsByMonth as getTransactionsForMonth,
  getMonthSummary as getMonthSummaryData
} from '@/utils/finance/financialSummary';
import { TransactionDataContext, TransactionDataContextType } from './TransactionDataContext';
import { createCache } from '@/utils/finance/cacheUtils';

// Cache for expensive calculations
const summaryCache = createCache<string, FinancialSummary>(24); // Cache 24 month/year combinations

export function TransactionDataProvider({ children }: { children: React.ReactNode }) {
  const { transactions, loading, refreshTransactions } = useTransactions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [monthlyData, setMonthlyData] = useState<MonthlyData>({});
  const [currentMonthSummary, setCurrentMonthSummary] = useState<FinancialSummary>({ 
    income: 0, expenses: 0, balance: 0 
  });
  const [yearSummary, setYearSummary] = useState<FinancialSummary>({ 
    income: 0, expenses: 0, balance: 0 
  });

  // Process all transactions into monthly buckets
  const processTransactions = useCallback(async () => {
    if (loading || isProcessing || !transactions.length) return;
    
    setIsProcessing(true);
    
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      
      // Process transactions in batches to avoid blocking the UI
      await processBatch(
        transactions,
        () => {}, // Just a placeholder as the actual processing is done in calculateSummary
        50 // Process 50 transactions per batch
      );
      
      // Calculate all summaries
      const {
        totalIncome,
        totalExpenses,
        thisMonthIncome,
        thisMonthExpenses,
        monthlyData: calculatedMonthlyData
      } = calculateSummary(transactions);
      
      // Update state with all data
      setMonthlyData(calculatedMonthlyData);
      
      // Update current month summary
      const currentMonthBalance = thisMonthIncome - thisMonthExpenses;
      const currentMonthSummaryData = {
        income: thisMonthIncome,
        expenses: thisMonthExpenses,
        balance: currentMonthBalance
      };
      setCurrentMonthSummary(currentMonthSummaryData);
      
      // Update year summary
      const yearBalance = totalIncome - totalExpenses;
      const yearSummaryData = {
        income: totalIncome,
        expenses: totalExpenses,
        balance: yearBalance
      };
      setYearSummary(yearSummaryData);
      
      // Store in cache
      const currentMonthKey = `${currentYear}-${currentMonth}`;
      const yearKey = `${currentYear}-all`;
      
      summaryCache.set(currentMonthKey, currentMonthSummaryData);
      summaryCache.set(yearKey, yearSummaryData);
      
    } catch (err) {
      console.error("Error processing transaction data:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [transactions, loading, isProcessing]);
  
  // Process transactions when they change
  useEffect(() => {
    if (!loading) {
      processTransactions();
    }
  }, [transactions, loading, processTransactions]);
  
  // Helper function to get transactions for a specific month
  const getTransactionsByMonth = useCallback((year: number, month: number): Transaction[] => {
    return getTransactionsForMonth(monthlyData, year, month);
  }, [monthlyData]);
  
  // Helper function to get summary for a specific month
  const getMonthSummary = useCallback((year: number, month: number): FinancialSummary => {
    const monthKey = `${year}-${month}`;
    
    // Check cache first
    const cachedSummary = summaryCache.get(monthKey);
    if (cachedSummary) {
      return cachedSummary;
    }
    
    // If not in cache, get from processed data
    const summary = getMonthSummaryData(monthlyData, year, month);
    
    // Store in cache for future use
    summaryCache.set(monthKey, summary);
    
    return summary;
  }, [monthlyData]);
  
  // Refresh function
  const refresh = useCallback(async () => {
    summaryCache.clear();
    await refreshTransactions();
  }, [refreshTransactions]);

  // Context value
  const value: TransactionDataContextType = {
    isLoading: loading || isProcessing,
    refresh,
    currentMonthSummary,
    yearSummary,
    monthlyData,
    getTransactionsByMonth,
    getMonthSummary
  };

  return (
    <TransactionDataContext.Provider value={value}>
      {children}
    </TransactionDataContext.Provider>
  );
}

// Re-export the hook for convenience
export { useTransactionData } from '@/hooks/useTransactionDataContext';
