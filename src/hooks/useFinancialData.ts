
import { useEffect, useState, useCallback, useMemo } from "react";
import { useTransactions } from "@/contexts/TransactionsContext";
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { stringToDate } from "@/utils/dateUtils";
import { Transaction } from "@/utils/types";

export type FinancialPeriod = 'month' | 'year';

export type FinancialSnapshot = {
  income: number;
  expenses: number;
  balance: number;
};

export function useFinancialData() {
  const { transactions, loading: transactionsLoading } = useTransactions();
  const [loading, setLoading] = useState(true);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [monthlyTotals, setMonthlyTotals] = useState<FinancialSnapshot>({
    income: 0,
    expenses: 0,
    balance: 0
  });
  
  // Memoize the current date values to avoid recalculations
  const dateValues = useMemo(() => {
    const now = new Date();
    return {
      currentMonth: now.getMonth(),
      currentYear: now.getFullYear(),
      currentMonthStart: startOfMonth(now),
      currentMonthEnd: endOfMonth(now),
    };
  }, []);
  
  // Calculate current month transactions
  const currentMonthTransactions = useMemo(() => {
    if (!transactions.length) return [];
    
    return transactions.filter((t) => {
      try {
        if (!t.date) return false;
        const date = stringToDate(t.date);
        return date && isWithinInterval(date, {
          start: dateValues.currentMonthStart,
          end: dateValues.currentMonthEnd
        });
      } catch (err) {
        console.error("Error processing transaction date:", err);
        return false;
      }
    });
  }, [transactions, dateValues.currentMonthStart, dateValues.currentMonthEnd]);
  
  // Calculate all financial data with memoization
  const calculateFinancialData = useCallback(() => {
    if (transactions.length === 0) {
      setMonthlyTotals({ income: 0, expenses: 0, balance: 0 });
      setLoading(false);
      setHasCalculated(true);
      return;
    }
    
    try {
      // Calculate monthly totals
      const totals = {
        income: currentMonthTransactions
          .filter((t) => t.type === "entrada")
          .reduce((sum, t) => sum + Number(t.amount), 0),
        expenses: currentMonthTransactions
          .filter((t) => t.type === "saída")
          .reduce((sum, t) => sum + Number(t.amount), 0),
      };
      
      const balance = totals.income - totals.expenses;
      setMonthlyTotals({ ...totals, balance });
      
    } catch (err) {
      console.error("Error in financial calculations:", err);
    } finally {
      setLoading(false);
      setHasCalculated(true);
    }
  }, [currentMonthTransactions, transactions.length]);

  // Effect to calculate data when transactions change
  useEffect(() => {
    if (!transactionsLoading) {
      // Set loading state first
      if (transactions.length > 0) {
        setLoading(true);
        // Small delay to allow UI to update with loading state
        const timer = setTimeout(() => {
          calculateFinancialData();
        }, 10);
        return () => clearTimeout(timer);
      } else {
        // Empty data case
        setLoading(false);
        setHasCalculated(true);
        setMonthlyTotals({ income: 0, expenses: 0, balance: 0 });
      }
    }
  }, [transactions, calculateFinancialData, transactionsLoading]);

  return { 
    monthlyTotals,
    loading: loading || transactionsLoading,
    hasCalculated
  };
}
