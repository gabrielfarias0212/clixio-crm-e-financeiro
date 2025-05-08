
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTransactions } from './TransactionsContext';
import { Transaction } from '@/utils/types';
import { createCache, processBatch } from '@/utils/dataUtils';
import { format, isWithinInterval, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { stringToDate } from '@/utils/dateUtils';

type FinancialSummary = {
  income: number;
  expenses: number;
  balance: number;
};

type MonthlyData = {
  [monthKey: string]: {
    transactions: Transaction[];
    summary: FinancialSummary;
  };
};

type TransactionDataContextType = {
  isLoading: boolean;
  refresh: () => Promise<void>;
  currentMonthSummary: FinancialSummary;
  yearSummary: FinancialSummary;
  monthlyData: MonthlyData;
  getTransactionsByMonth: (year: number, month: number) => Transaction[];
  getMonthSummary: (year: number, month: number) => FinancialSummary;
};

const TransactionDataContext = createContext<TransactionDataContextType | undefined>(undefined);

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
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);
      const yearStart = startOfYear(now);
      const yearEnd = endOfYear(now);
      
      // Initialize temporary monthly data structure
      const tempMonthlyData: MonthlyData = {};
      
      // Initialize current month and year summaries
      let tempCurrentMonthIncome = 0;
      let tempCurrentMonthExpenses = 0;
      let tempYearIncome = 0;
      let tempYearExpenses = 0;
      
      // Process transactions in batches to avoid blocking the UI
      await processBatch(
        transactions,
        (transaction) => {
          try {
            if (!transaction.date) return;
            
            const date = stringToDate(transaction.date);
            if (!date) return;
            
            const year = date.getFullYear();
            const month = date.getMonth();
            const monthKey = `${year}-${month}`;
            
            // Initialize month data if it doesn't exist
            if (!tempMonthlyData[monthKey]) {
              tempMonthlyData[monthKey] = {
                transactions: [],
                summary: { income: 0, expenses: 0, balance: 0 }
              };
            }
            
            // Add transaction to the month
            tempMonthlyData[monthKey].transactions.push(transaction);
            
            // Update month summary
            const amount = Number(transaction.amount) || 0;
            if (transaction.type === "entrada") {
              tempMonthlyData[monthKey].summary.income += amount;
              
              // Update current month and year summaries if applicable
              if (isWithinInterval(date, { start: currentMonthStart, end: currentMonthEnd })) {
                tempCurrentMonthIncome += amount;
              }
              
              if (isWithinInterval(date, { start: yearStart, end: yearEnd })) {
                tempYearIncome += amount;
              }
            } else if (transaction.type === "saída") {
              tempMonthlyData[monthKey].summary.expenses += amount;
              
              // Update current month and year summaries if applicable
              if (isWithinInterval(date, { start: currentMonthStart, end: currentMonthEnd })) {
                tempCurrentMonthExpenses += amount;
              }
              
              if (isWithinInterval(date, { start: yearStart, end: yearEnd })) {
                tempYearExpenses += amount;
              }
            }
            
            // Calculate balance
            tempMonthlyData[monthKey].summary.balance = 
              tempMonthlyData[monthKey].summary.income - tempMonthlyData[monthKey].summary.expenses;
          } catch (err) {
            console.error("Error processing transaction:", err);
          }
        },
        50 // Process 50 transactions per batch
      );
      
      // Update state with all data
      setMonthlyData(tempMonthlyData);
      
      // Update current month summary
      const currentMonthBalance = tempCurrentMonthIncome - tempCurrentMonthExpenses;
      setCurrentMonthSummary({
        income: tempCurrentMonthIncome,
        expenses: tempCurrentMonthExpenses,
        balance: currentMonthBalance
      });
      
      // Update year summary
      const yearBalance = tempYearIncome - tempYearExpenses;
      setYearSummary({
        income: tempYearIncome,
        expenses: tempYearExpenses,
        balance: yearBalance
      });
      
      // Store in cache
      const currentMonthKey = `${currentYear}-${currentMonth}`;
      const yearKey = `${currentYear}-all`;
      
      summaryCache.set(currentMonthKey, {
        income: tempCurrentMonthIncome,
        expenses: tempCurrentMonthExpenses,
        balance: currentMonthBalance
      });
      
      summaryCache.set(yearKey, {
        income: tempYearIncome,
        expenses: tempYearExpenses,
        balance: yearBalance
      });
      
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
    const monthKey = `${year}-${month}`;
    return monthlyData[monthKey]?.transactions || [];
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
    const summary = monthlyData[monthKey]?.summary || { income: 0, expenses: 0, balance: 0 };
    
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
  const value = {
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

export function useTransactionData() {
  const context = useContext(TransactionDataContext);
  if (context === undefined) {
    throw new Error('useTransactionData must be used within a TransactionDataProvider');
  }
  return context;
}
