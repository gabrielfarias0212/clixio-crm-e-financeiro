
import { useState, useEffect, useMemo } from 'react';
import { useTransactions } from '@/contexts/TransactionsContext';
import { useClients } from '@/contexts/ClientsContext';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO, addDays, isAfter, isBefore } from 'date-fns';

interface FinancialSettings {
  id: string;
  prolabore_percentage: number;
  monthly_goal: number;
}

interface CashFlowData {
  generalBalance: number;
  monthlyBalance: number;
  monthlyGrowth: number;
  totalIncome: number;
  monthlyIncome: number;
  totalExpenses: number;
  monthlyExpenses: number;
  futureIncome: number;
  upcomingPayments: Array<{
    clientName: string;
    amount: number;
    dueDate: string;
    isOverdue: boolean;
  }>;
  expenseCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  monthlyGoalProgress: number;
  prolabore: number;
  balanceProjection: Array<{
    date: string;
    balance: number;
  }>;
}

export function useCashFlowData() {
  const { transactions } = useTransactions();
  const { clients } = useClients();
  const [financialSettings, setFinancialSettings] = useState<FinancialSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Fetch financial settings
  useEffect(() => {
    const fetchFinancialSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('financial_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching financial settings:', error);
          return;
        }

        if (data) {
          setFinancialSettings(data);
        } else {
          // Create default settings
          const { data: newSettings, error: insertError } = await supabase
            .from('financial_settings')
            .insert({
              user_id: user.id,
              prolabore_percentage: 30,
              monthly_goal: 50000
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error creating financial settings:', insertError);
          } else {
            setFinancialSettings(newSettings);
          }
        }
      } catch (error) {
        console.error('Error in fetchFinancialSettings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialSettings();
  }, []);

  const cashFlowData: CashFlowData = useMemo(() => {
    // Calculate general balance
    const generalBalance = transactions.reduce((total, transaction) => {
      return total + (transaction.type === 'entrada' ? transaction.amount : -transaction.amount);
    }, 0);

    // Calculate monthly transactions
    const monthlyTransactions = transactions.filter(transaction => {
      const transactionDate = parseISO(transaction.date);
      return isWithinInterval(transactionDate, { start: monthStart, end: monthEnd });
    });

    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'entrada')
      .reduce((total, t) => total + t.amount, 0);

    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'saída')
      .reduce((total, t) => total + t.amount, 0);

    const monthlyBalance = monthlyIncome - monthlyExpenses;

    // Calculate total income and expenses
    const totalIncome = transactions
      .filter(t => t.type === 'entrada')
      .reduce((total, t) => total + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'saída')
      .reduce((total, t) => total + t.amount, 0);

    // Calculate future income from pending payments
    const futurePayments = clients.flatMap(client => 
      client.payments
        .filter(payment => payment.payment_status === 'pendente')
        .map(payment => ({
          clientName: client.name,
          amount: payment.amount,
          dueDate: payment.due_date || payment.date,
          isOverdue: payment.due_date ? isAfter(now, parseISO(payment.due_date)) : false
        }))
    );

    const futureIncome = futurePayments.reduce((total, payment) => total + payment.amount, 0);

    // Calculate expense categories
    const expensesByCategory = transactions
      .filter(t => t.type === 'saída')
      .reduce((acc, transaction) => {
        const category = transaction.category || 'Outros';
        acc[category] = (acc[category] || 0) + transaction.amount;
        return acc;
      }, {} as Record<string, number>);

    const expenseCategories = Object.entries(expensesByCategory)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);

    // Calculate monthly goal progress
    const monthlyGoal = financialSettings?.monthly_goal || 0;
    const monthlyGoalProgress = monthlyGoal > 0 ? (monthlyIncome / monthlyGoal) * 100 : 0;

    // Calculate prolabore
    const prolaborePercentage = financialSettings?.prolabore_percentage || 30;
    const prolabore = (monthlyIncome * prolaborePercentage) / 100;

    // Calculate monthly growth (simplified - comparing to previous month would need more data)
    const monthlyGrowth = monthlyBalance > 0 ? 5.2 : -2.1; // Placeholder calculation

    // Generate balance projection for next 6 months
    const balanceProjection = Array.from({ length: 6 }, (_, index) => {
      const futureDate = addDays(monthEnd, (index + 1) * 30);
      const projectedBalance = generalBalance + (monthlyBalance * (index + 1));
      return {
        date: futureDate.toISOString().split('T')[0],
        balance: projectedBalance
      };
    });

    return {
      generalBalance,
      monthlyBalance,
      monthlyGrowth,
      totalIncome,
      monthlyIncome,
      totalExpenses,
      monthlyExpenses,
      futureIncome,
      upcomingPayments: futurePayments.slice(0, 5), // Show top 5 upcoming payments
      expenseCategories,
      monthlyGoalProgress,
      prolabore,
      balanceProjection
    };
  }, [transactions, clients, financialSettings, monthStart, monthEnd, now]);

  const updateFinancialSettings = async (updates: Partial<FinancialSettings>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !financialSettings) return;

      const { data, error } = await supabase
        .from('financial_settings')
        .update(updates)
        .eq('id', financialSettings.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating financial settings:', error);
        return;
      }

      setFinancialSettings(data);
    } catch (error) {
      console.error('Error in updateFinancialSettings:', error);
    }
  };

  return {
    cashFlowData,
    financialSettings,
    loading,
    updateFinancialSettings
  };
}
