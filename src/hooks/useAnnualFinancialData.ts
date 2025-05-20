
import { useCallback, useState, useEffect, useMemo } from "react";
import { useTransactions } from "@/contexts/TransactionsContext";
import { format, startOfYear, endOfYear, eachMonthOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/components/dashboard/financial/ChartConstants";
import { stringToDate } from "@/utils/dateUtils";

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
  
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const yearStart = useMemo(() => startOfYear(new Date()), []);
  const yearEnd = useMemo(() => endOfYear(new Date()), []);
  
  // Calculate all financial data for the year
  const calculateAnnualData = useCallback(() => {
    if (transactions.length === 0) {
      setChartData([]);
      setYearTotals({ income: 0, expenses: 0, balance: 0 });
      setLoading(false);
      setHasCalculated(true);
      return;
    }
    
    try {
      console.log("Calculating annual financial data with", transactions.length, "transactions");
      
      // Get all months in the current year
      const allMonthsInYear = eachMonthOfInterval({
        start: yearStart,
        end: yearEnd
      });
      
      // Filter transactions for current year only
      const yearTransactions = transactions.filter(t => {
        try {
          if (!t.date) return false;
          const date = stringToDate(t.date);
          return date && date >= yearStart && date <= yearEnd;
        } catch (err) {
          console.error("Error processing transaction date:", err);
          return false;
        }
      });
      
      console.log(`Found ${yearTransactions.length} transactions for ${currentYear}`);

      // Calculate data for each month
      const annualData = allMonthsInYear.map(month => {
        const monthStart = new Date(month);
        const monthEnd = new Date(month);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(0); // Last day of the month
        
        // Filter transactions for this month
        const monthTransactions = yearTransactions.filter(t => {
          try {
            if (!t.date) return false;
            const date = stringToDate(t.date);
            return date && date >= monthStart && date <= monthEnd;
          } catch (err) {
            console.error("Error filtering month transactions:", err);
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
      
      console.log("Annual financial data calculated successfully");
    } catch (err) {
      console.error("Error in annual financial calculations:", err);
    } finally {
      setLoading(false);
      setHasCalculated(true);
    }
  }, [transactions, yearStart, yearEnd, currentYear]);

  // Effect to calculate data when transactions change
  useEffect(() => {
    if (!transactionsLoading) {
      setLoading(true);
      calculateAnnualData();
    }
  }, [calculateAnnualData, transactionsLoading]);

  // Format currency utility function for the tooltip
  const formatTooltipValue = useCallback((value: number) => {
    return formatCurrency(value);
  }, []);

  return {
    chartData,
    yearTotals,
    currentYear,
    loading: loading || transactionsLoading,
    hasCalculated,
    formatTooltipValue
  };
}
