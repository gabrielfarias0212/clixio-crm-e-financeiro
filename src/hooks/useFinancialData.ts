
import { useEffect, useState, useCallback } from "react";
import { useTransactions } from "@/contexts/TransactionsContext";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export function useFinancialData() {
  const { transactions, loading: transactionsLoading } = useTransactions();
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlyTotals, setMonthlyTotals] = useState({
    income: 0,
    expenses: 0,
    balance: 0
  });
  const [pieData, setPieData] = useState<any[]>([]);
  const [hasCalculated, setHasCalculated] = useState(false);
  
  // Calculate all financial data
  const calculateFinancialData = useCallback(() => {
    if (transactions.length === 0) {
      setChartData([]);
      setPieData([]);
      setMonthlyTotals({ income: 0, expenses: 0, balance: 0 });
      setLoading(false);
      setHasCalculated(true);
      return;
    }
    
    console.log("Calculating financial data with", transactions.length, "transactions");
    
    try {
      // Get current month's transactions
      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);

      const currentMonthTransactions = transactions.filter(
        (t) => {
          try {
            if (!t.date) return false;
            const date = new Date(t.date);
            return date >= currentMonthStart && date <= currentMonthEnd;
          } catch (err) {
            console.error("Error processing transaction date:", err);
            return false;
          }
        }
      );

      console.log("Current month transactions:", currentMonthTransactions.length);

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
      console.log("Monthly totals calculated:", totals);

      // Prepare pie chart data
      const newPieData = [
        { name: "Entradas", value: totals.income, fill: "#8B5CF6" },
        { name: "Saídas", value: totals.expenses, fill: "#F43F5E" },
      ];
      setPieData(newPieData);
      console.log("Pie data updated");

      // Prepare last 6 months data for chart
      const monthsData = Array.from({ length: 6 }).map((_, i) => {
        try {
          const date = subMonths(now, i);
          const monthStart = startOfMonth(date);
          const monthEnd = endOfMonth(date);
          
          const monthTransactions = transactions.filter((t) => {
            try {
              if (!t.date) return false;
              const transDate = new Date(t.date);
              return transDate >= monthStart && transDate <= monthEnd;
            } catch (err) {
              console.error("Error filtering month transactions:", err);
              return false;
            }
          });

          const income = monthTransactions
            .filter((t) => t.type === "entrada")
            .reduce((sum, t) => sum + Number(t.amount), 0);

          const expenses = monthTransactions
            .filter((t) => t.type === "saída")
            .reduce((sum, t) => sum + Number(t.amount), 0);

          return {
            name: format(date, "MMM", { locale: ptBR }),
            income,
            expenses,
            balance: income - expenses
          };
        } catch (err) {
          console.error("Error processing month data:", err);
          return {
            name: `Month ${i}`,
            income: 0,
            expenses: 0,
            balance: 0
          };
        }
      }).reverse();
      
      setChartData(monthsData);
      console.log("Chart data updated with months:", monthsData.map(m => m.name).join(", "));
      
    } catch (err) {
      console.error("Error in financial calculations:", err);
    } finally {
      setLoading(false);
      setHasCalculated(true);
    }
  }, [transactions]);

  // Effect to calculate data when transactions change
  useEffect(() => {
    if (!transactionsLoading && transactions.length > 0) {
      // Only recalculate if we have transactions and they're not loading
      setLoading(true);
      calculateFinancialData();
    } else if (!transactionsLoading && transactions.length === 0) {
      // If we have no transactions but they're loaded, set empty data
      setLoading(false);
      setHasCalculated(true);
      setChartData([]);
      setPieData([]);
      setMonthlyTotals({ income: 0, expenses: 0, balance: 0 });
    }
  }, [transactions, calculateFinancialData, transactionsLoading]);

  return { 
    chartData,
    monthlyTotals,
    pieData,
    loading: loading || transactionsLoading,
    hasCalculated
  };
}
