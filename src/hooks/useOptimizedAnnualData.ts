
import { useCallback, useState, useEffect, useMemo } from "react";
import { useTransactions } from "@/contexts/TransactionsContext";
import { format, startOfYear, endOfYear, eachMonthOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/components/dashboard/financial/ChartConstants";
import { stringToDate } from "@/utils/dateUtils";

export type OptimizedChartDataPoint = {
  month: string;
  shortMonth: string;
  income: number;
  expenses: number;
  balance: number;
};

interface AnnualDataCache {
  data: OptimizedChartDataPoint[];
  yearTotals: {
    income: number;
    expenses: number;
    balance: number;
  };
  timestamp: number;
  transactionCount: number;
}

// Cache com TTL de 3 minutos
const CACHE_TTL = 3 * 60 * 1000;
let annualDataCache: AnnualDataCache | null = null;

export function useOptimizedAnnualData() {
  const { transactions, loading: transactionsLoading } = useTransactions();
  const [chartData, setChartData] = useState<OptimizedChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearTotals, setYearTotals] = useState({
    income: 0,
    expenses: 0,
    balance: 0
  });
  
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const yearStart = useMemo(() => startOfYear(new Date()), []);
  const yearEnd = useMemo(() => endOfYear(new Date()), []);

  // Memoizar dados de entrada
  const transactionsData = useMemo(() => transactions, [transactions]);

  // Função otimizada para verificar cache
  const getCachedData = useCallback(() => {
    if (annualDataCache && 
        Date.now() - annualDataCache.timestamp < CACHE_TTL &&
        annualDataCache.transactionCount === transactionsData.length) {
      return annualDataCache;
    }
    return null;
  }, [transactionsData.length]);
  
  // Calculate all financial data for the year
  const calculateAnnualData = useCallback(() => {
    console.log("=== Iniciando cálculo anual otimizado ===");
    
    // Verificar cache primeiro
    const cached = getCachedData();
    if (cached) {
      console.log("Usando dados anuais do cache");
      setChartData(cached.data);
      setYearTotals(cached.yearTotals);
      setLoading(false);
      return;
    }

    if (transactionsData.length === 0) {
      setChartData([]);
      setYearTotals({ income: 0, expenses: 0, balance: 0 });
      setLoading(false);
      return;
    }
    
    try {
      console.log("Calculando dados anuais com", transactionsData.length, "transações");
      
      // Get all months in the current year
      const allMonthsInYear = eachMonthOfInterval({
        start: yearStart,
        end: yearEnd
      });
      
      // Filter transactions for current year only
      const yearTransactions = transactionsData.filter(t => {
        try {
          if (!t.date) return false;
          const date = stringToDate(t.date);
          return date && date >= yearStart && date <= yearEnd;
        } catch (err) {
          console.error("Error processing transaction date:", err);
          return false;
        }
      });
      
      console.log(`Encontradas ${yearTransactions.length} transações para ${currentYear}`);

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
      
      const yearTotalsResult = {
        income: totalIncome,
        expenses: totalExpenses,
        balance: totalBalance
      };
      
      setYearTotals(yearTotalsResult);
      
      // Cache do resultado
      annualDataCache = {
        data: annualData,
        yearTotals: yearTotalsResult,
        timestamp: Date.now(),
        transactionCount: transactionsData.length
      };
      
      console.log("Dados anuais calculados com sucesso");
    } catch (err) {
      console.error("Erro nos cálculos anuais:", err);
    } finally {
      setLoading(false);
    }
  }, [transactionsData, yearStart, yearEnd, currentYear, getCachedData]);

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
    formatTooltipValue
  };
}
