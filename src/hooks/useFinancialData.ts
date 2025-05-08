
import { useEffect, useState, useCallback } from "react";
import { useTransactions } from "@/contexts/TransactionsContext";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export function useFinancialData() {
  const { transactions, refreshTransactions } = useTransactions();
  const [chartData, setChartData] = useState<any[]>([]);
  const [monthlyTotals, setMonthlyTotals] = useState({
    income: 0,
    expenses: 0,
    balance: 0
  });
  const [pieData, setPieData] = useState<any[]>([]);

  // Calculate all financial data
  const calculateFinancialData = useCallback(() => {
    // Get current month's transactions
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);

    const currentMonthTransactions = transactions.filter(
      (t) => {
        const date = new Date(t.date);
        return date >= currentMonthStart && date <= currentMonthEnd;
      }
    );

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

    // Prepare pie chart data
    const newPieData = [
      { name: "Entradas", value: totals.income, fill: "#8B5CF6" },
      { name: "Saídas", value: totals.expenses, fill: "#F43F5E" },
    ];
    setPieData(newPieData);

    // Prepare last 6 months data for chart
    const monthsData = Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(now, i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthTransactions = transactions.filter((t) => {
        const transDate = new Date(t.date);
        return transDate >= monthStart && transDate <= monthEnd;
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
    }).reverse();
    
    setChartData(monthsData);
  }, [transactions]);

  // Effect to calculate data when transactions change
  useEffect(() => {
    if (transactions.length > 0) {
      calculateFinancialData();
    }
  }, [transactions, calculateFinancialData]);

  // Effect to refresh financial data when component mounts
  useEffect(() => {
    refreshTransactions();
  }, [refreshTransactions]);

  return { 
    chartData,
    monthlyTotals,
    pieData,
    refreshTransactions,
    calculateFinancialData
  };
}
