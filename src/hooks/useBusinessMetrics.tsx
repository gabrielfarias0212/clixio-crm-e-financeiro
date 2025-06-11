
import { useClients } from "@/contexts/ClientsContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { startOfYear, endOfYear, isWithinInterval } from "date-fns";
import { stringToDate } from "@/utils/dateUtils";
import { Client } from "@/utils/types";
import { useMemo } from "react";

export function useBusinessMetrics() {
  const { clients } = useClients();
  const { transactions } = useTransactions();
  const currentYear = new Date().getFullYear();
  const yearStart = startOfYear(new Date());
  const yearEnd = endOfYear(new Date());

  // Calculate metrics using useMemo to avoid recalculations on every render
  const metrics = useMemo(() => {
    // 1. Total de contratos ativos no ano (exclude delivered/"pago" status)
    const activeContractsData = clients.filter(client => {
      if (!(client.status === "em andamento" || client.status === "fechado")) return false;
      if (!client.createdAt) return false;
      
      const createdAt = stringToDate(client.createdAt);
      return createdAt && isWithinInterval(createdAt, { start: yearStart, end: yearEnd });
    });
    
    const activeContracts = activeContractsData.length;

    // 2. Média de faturamento mensal
    const monthlyRevenueData = Array(12).fill(0);
    let totalRevenue = 0;

    // Agrupar transações por mês
    const monthlyTransactions = transactions
      .filter(t => {
        if (t.type !== "entrada") return false;
        if (!t.date) return false;
        
        const transactionDate = stringToDate(t.date);
        return transactionDate && isWithinInterval(transactionDate, { start: yearStart, end: yearEnd });
      });
      
    monthlyTransactions.forEach(t => {
      if (!t.date) return;
      
      const transactionDate = stringToDate(t.date);
      if (!transactionDate) return;
      
      const month = transactionDate.getMonth();
      const amount = Number(t.amount);
      
      if (!isNaN(amount)) {
        monthlyRevenueData[month] += amount;
        totalRevenue += amount;
      }
    });

    // Preparar dados para o mini gráfico de linha
    const chartData = monthlyRevenueData.map((value, index) => ({
      month: index + 1,
      value
    }));

    // Calcular média considerando apenas os meses que já passaram
    const currentMonth = new Date().getMonth();
    const monthsElapsed = currentMonth + 1; // +1 porque os meses são indexados de 0
    const averageMonthlyRevenue = monthsElapsed > 0 ? totalRevenue / monthsElapsed : 0;

    // 3. Taxa de conversão de leads em contratos
    const totalLeadsData = clients.filter(client => {
      if (!client.createdAt) return false;
      
      const createdAt = stringToDate(client.createdAt);
      return createdAt && isWithinInterval(createdAt, { start: yearStart, end: yearEnd });
    });
    
    const totalLeads = totalLeadsData.length;
    
    const closedContractsData = clients.filter(client => {
      if (!(client.status === "fechado" || client.status === "em andamento" || client.status === "pago")) return false;
      if (!client.createdAt) return false;
      
      const createdAt = stringToDate(client.createdAt);
      return createdAt && isWithinInterval(createdAt, { start: yearStart, end: yearEnd });
    });
    
    const closedContracts = closedContractsData.length;
    const conversionRate = totalLeads > 0 ? (closedContracts / totalLeads) * 100 : 0;

    // 4. Lucro líquido (Entradas - Saídas)
    const totalExpensesData = transactions
      .filter(t => {
        if (t.type !== "saída") return false;
        if (!t.date) return false;
        
        const transactionDate = stringToDate(t.date);
        return transactionDate && isWithinInterval(transactionDate, { start: yearStart, end: yearEnd });
      });
      
    const totalExpenses = totalExpensesData.reduce((sum, t) => {
      const amount = Number(t.amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const netProfit = totalRevenue - totalExpenses;

    // Extract non-zero revenue months for better display
    const revenueMonths = monthlyRevenueData
      .map((amount, index) => ({ month: index, amount }))
      .filter(item => item.amount > 0);

    return {
      activeContracts,
      activeContractsData,
      averageMonthlyRevenue,
      monthlyRevenueData,
      monthlyTransactions,
      chartData,
      conversionRate,
      totalLeadsData,
      closedContractsData,
      netProfit,
      totalRevenue,
      totalExpenses,
      totalExpensesData,
      revenueMonths,
      currentYear
    };
  }, [clients, transactions, yearStart, yearEnd]);

  return metrics;
}
