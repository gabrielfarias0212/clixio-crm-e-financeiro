
import { useCallback, useState, useEffect, useMemo } from "react";
import { useTransactions } from "@/contexts/TransactionsContext";
import { format, startOfYear, endOfYear, eachMonthOfInterval, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/components/dashboard/financial/ChartConstants";
import { stringToDate } from "@/utils/dateUtils";
import { Transaction } from "@/utils/types";

export type AnnualChartDataPoint = {
  month: string;
  shortMonth: string;
  income: number;
  expenses: number;
  balance: number;
};

export function useAnnualFinancialData() {
  const { transactions, loading: transactionsLoading } = useTransactions();
  const [chartData, setChartData] = useState<AnnualChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [yearTotals, setYearTotals] = useState({
    income: 0,
    expenses: 0,
    balance: 0
  });
  
  // Memoize date-related values to avoid unnecessary recalculations
  const dateValues = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    return {
      currentYear: year,
      yearStart: startOfYear(now),
      yearEnd: endOfYear(now),
      allMonthsInYear: eachMonthOfInterval({
        start: startOfYear(now),
        end: endOfYear(now)
      })
    };
  }, []);
  
  // Filter year transactions with memoization
  const yearTransactions = useMemo(() => {
    if (!transactions.length) return [];
    
    return transactions.filter(t => {
      try {
        if (!t.date) return false;
        const date = stringToDate(t.date);
        return date && isWithinInterval(date, {
          start: dateValues.yearStart,
          end: dateValues.yearEnd
        });
      } catch (err) {
        return false;
      }
    });
  }, [transactions, dateValues.yearStart, dateValues.yearEnd]);
  
  // Calculate all financial data for the year
  const calculateAnnualData = useCallback(() => {
    if (yearTransactions.length === 0) {
      setChartData([]);
      setYearTotals({ income: 0, expenses: 0, balance: 0 });
      setLoading(false);
      setHasCalculated(true);
      return;
    }
    
    try {
      // Calculate data for each month using memoized values
      const annualData = dateValues.allMonthsInYear.map(month => {
        const monthStart = new Date(month);
        const monthEnd = new Date(month);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(0); // Last day of the month
        
        // Filter transactions for this month
        const monthTransactions = yearTransactions.filter(t => {
          try {
            if (!t.date) return false;
            const date = stringToDate(t.date);
            return date && isWithinInterval(date, {
              start: monthStart, 
              end: monthEnd
            });
          } catch (err) {
            return false;
          }
        });
        
        // Calculate income and expenses for this month
        const income = monthTransactions
          .filter(t => t.type === "entrada")
          .reduce((sum, t) => sum + Number(t.amount), 0);
          
        const expenses = monthTransactions
          .filter(t => t.type === "saída")
          .reduce((sum, t) => sum + Number(t.amount), 0);
          
        const balance = income - expenses;
        
        return {
          month: format(month, "MMMM", { locale: ptBR }),
          shortMonth: format(month, "MMM", { locale: ptBR }),
          income,
          expenses,
          balance
        };
      });
      
      setChartData(annualData);
      
      // Calculate year totals
      const totalIncome = annualData.reduce((sum, month) => sum + month.income, 0);
      const totalExpenses = annualData.reduce((sum, month) => sum + month.expenses, 0);
      const totalBalance = totalIncome - totalExpenses;
      
      setYearTotals({
        income: totalIncome,
        expenses: totalExpenses,
        balance: totalBalance
      });
      
    } catch (err) {
      console.error("Error in annual financial calculations:", err);
    } finally {
      setLoading(false);
      setHasCalculated(true);
    }
  }, [yearTransactions, dateValues.allMonthsInYear]);

  // Effect to calculate data when transactions change
  useEffect(() => {
    if (!transactionsLoading) {
      setLoading(true);
      // Small delay to allow UI to update with loading state
      const timer = setTimeout(() => {
        calculateAnnualData();
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [calculateAnnualData, transactionsLoading]);

  // Format currency utility function for the tooltip
  const formatTooltipValue = useCallback((value: number) => {
    return formatCurrency(value);
  }, []);

  return {
    chartData,
    yearTotals,
    currentYear: dateValues.currentYear,
    loading: loading || transactionsLoading,
    hasCalculated,
    formatTooltipValue
  };
}
