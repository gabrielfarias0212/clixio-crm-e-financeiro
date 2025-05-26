
import { useMemo } from "react";
import { useClients } from "@/contexts/ClientsContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { startOfMonth, endOfMonth, addMonths, isWithinInterval, parseISO, format } from "date-fns";
import { stringToDate } from "@/utils/dateUtils";
import { Client, Transaction, Payment } from "@/utils/types";

export interface MonthlyProjection {
  month: string;
  shortMonth: string;
  year: number;
  projectedIncome: number;
  scheduledPayments: number;
  confirmedIncome: number;
  expenses: number;
  balance: number;
}

export interface FinancialMetrics {
  currentMonthIncome: number;
  currentMonthExpenses: number;
  currentMonthBalance: number;
  totalBalance: number;
  previousMonthBalance: number;
  monthlyGrowth: number;
  averageTicket: number;
  overduePayments: number;
  pendingPayments: number;
  projectedQuarterIncome: number;
}

export function useAdvancedFinancialData() {
  const { clients } = useClients();
  const { transactions } = useTransactions();

  const financialData = useMemo(() => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const previousMonthStart = startOfMonth(addMonths(now, -1));
    const previousMonthEnd = endOfMonth(addMonths(now, -1));

    // Current month transactions
    const currentMonthTransactions = transactions.filter(t => {
      if (!t.date) return false;
      const date = stringToDate(t.date);
      return date && isWithinInterval(date, { start: currentMonthStart, end: currentMonthEnd });
    });

    // Previous month transactions
    const previousMonthTransactions = transactions.filter(t => {
      if (!t.date) return false;
      const date = stringToDate(t.date);
      return date && isWithinInterval(date, { start: previousMonthStart, end: previousMonthEnd });
    });

    // Calculate current month metrics
    const currentMonthIncome = currentMonthTransactions
      .filter(t => t.type === "entrada")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const currentMonthExpenses = currentMonthTransactions
      .filter(t => t.type === "saída")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const currentMonthBalance = currentMonthIncome - currentMonthExpenses;

    // Previous month balance
    const previousMonthIncome = previousMonthTransactions
      .filter(t => t.type === "entrada")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const previousMonthExpenses = previousMonthTransactions
      .filter(t => t.type === "saída")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const previousMonthBalance = previousMonthIncome - previousMonthExpenses;

    // Total balance
    const totalIncome = transactions
      .filter(t => t.type === "entrada")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = transactions
      .filter(t => t.type === "saída")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalBalance = totalIncome - totalExpenses;

    // Monthly growth
    const monthlyGrowth = previousMonthBalance !== 0 
      ? ((currentMonthBalance - previousMonthBalance) / Math.abs(previousMonthBalance)) * 100 
      : 0;

    // Calculate average ticket (based on paid clients)
    const paidClients = clients.filter(c => c.status === "pago" || c.status === "entregue");
    const averageTicket = paidClients.length > 0 
      ? paidClients.reduce((sum, c) => sum + (c.contractValue || 0), 0) / paidClients.length 
      : 0;

    // Overdue and pending payments analysis
    const allPayments = clients.flatMap(client => 
      client.payments?.map(payment => ({ ...payment, clientName: client.name })) || []
    );

    const today = new Date();
    const overduePayments = allPayments.filter(payment => 
      payment.payment_status === "atrasado" || 
      (payment.due_date && stringToDate(payment.due_date) && stringToDate(payment.due_date)! < today && payment.payment_status === "pendente")
    ).length;

    const pendingPayments = allPayments.filter(payment => 
      payment.payment_status === "pendente"
    ).length;

    // Calculate projections for next 6 months
    const projections: MonthlyProjection[] = [];
    for (let i = 0; i < 6; i++) {
      const projectionMonth = addMonths(now, i);
      const monthStart = startOfMonth(projectionMonth);
      const monthEnd = endOfMonth(projectionMonth);

      // Scheduled payments for this month
      const scheduledPayments = allPayments
        .filter(payment => {
          if (!payment.due_date) return false;
          const dueDate = stringToDate(payment.due_date);
          return dueDate && isWithinInterval(dueDate, { start: monthStart, end: monthEnd });
        })
        .reduce((sum, payment) => sum + Number(payment.amount), 0);

      // Active contracts that might generate income
      const activeClients = clients.filter(c => 
        c.status === "fechado" || c.status === "em andamento"
      );

      // Estimate potential income from active contracts
      const projectedFromContracts = activeClients
        .filter(client => {
          if (!client.weddingDate) return false;
          const weddingDate = stringToDate(client.weddingDate);
          return weddingDate && isWithinInterval(weddingDate, { start: monthStart, end: monthEnd });
        })
        .reduce((sum, client) => {
          const remainingPayment = (client.contractValue || 0) - (client.downPayment || 0);
          return sum + remainingPayment;
        }, 0);

      // Confirmed income (already received)
      const confirmedIncome = i === 0 ? currentMonthIncome : 0;

      // Estimated expenses (average of last 3 months)
      const estimatedExpenses = i === 0 ? currentMonthExpenses : 
        transactions
          .filter(t => t.type === "saída")
          .slice(-90)
          .reduce((sum, t) => sum + Number(t.amount), 0) / 3;

      const totalProjectedIncome = scheduledPayments + projectedFromContracts + confirmedIncome;
      const projectedBalance = totalProjectedIncome - estimatedExpenses;

      projections.push({
        month: format(projectionMonth, "MMMM yyyy"),
        shortMonth: format(projectionMonth, "MMM"),
        year: projectionMonth.getFullYear(),
        projectedIncome: totalProjectedIncome,
        scheduledPayments,
        confirmedIncome,
        expenses: estimatedExpenses,
        balance: projectedBalance
      });
    }

    // Quarter projection
    const projectedQuarterIncome = projections.slice(0, 3)
      .reduce((sum, month) => sum + month.projectedIncome, 0);

    const metrics: FinancialMetrics = {
      currentMonthIncome,
      currentMonthExpenses,
      currentMonthBalance,
      totalBalance,
      previousMonthBalance,
      monthlyGrowth,
      averageTicket,
      overduePayments,
      pendingPayments,
      projectedQuarterIncome
    };

    return {
      metrics,
      projections,
      currentMonthTransactions,
      allPayments: allPayments.filter(p => p.payment_status === "pendente" || p.payment_status === "atrasado")
    };
  }, [clients, transactions]);

  return financialData;
}
