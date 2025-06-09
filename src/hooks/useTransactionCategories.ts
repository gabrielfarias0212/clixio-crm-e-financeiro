
import { useMemo } from 'react';
import { Transaction } from '@/utils/types';

export interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
  transactions: Transaction[];
  color: string;
}

export interface TransactionCategoriesData {
  expenses: CategoryData[];
  incomes: CategoryData[];
  totalExpenses: number;
  totalIncomes: number;
}

const EXPENSE_COLORS = [
  '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d',
  '#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12',
  '#eab308', '#ca8a04', '#a16207', '#854d0e', '#713f12'
];

const INCOME_COLORS = [
  '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d',
  '#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63',
  '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'
];

export function useTransactionCategories(transactions: Transaction[]): TransactionCategoriesData {
  return useMemo(() => {
    console.log("Processing transaction categories for", transactions.length, "transactions");
    
    // Separar transações por tipo
    const expenseTransactions = transactions.filter(t => t.type === 'saída');
    const incomeTransactions = transactions.filter(t => t.type === 'entrada');
    
    // Função para agrupar por categoria
    const groupByCategory = (txns: Transaction[], colors: string[]) => {
      const categoryMap = new Map<string, Transaction[]>();
      
      txns.forEach(transaction => {
        const category = transaction.category || 'Sem categoria';
        if (!categoryMap.has(category)) {
          categoryMap.set(category, []);
        }
        categoryMap.get(category)!.push(transaction);
      });
      
      const total = txns.reduce((sum, t) => sum + Number(t.amount), 0);
      
      return Array.from(categoryMap.entries()).map(([category, txnList], index) => {
        const amount = txnList.reduce((sum, t) => sum + Number(t.amount), 0);
        return {
          category,
          amount,
          percentage: total > 0 ? (amount / total) * 100 : 0,
          transactions: txnList,
          color: colors[index % colors.length]
        };
      }).sort((a, b) => b.amount - a.amount);
    };
    
    const expenses = groupByCategory(expenseTransactions, EXPENSE_COLORS);
    const incomes = groupByCategory(incomeTransactions, INCOME_COLORS);
    
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalIncomes = incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    
    console.log("Categories processed:", {
      expenses: expenses.length,
      incomes: incomes.length,
      totalExpenses,
      totalIncomes
    });
    
    return {
      expenses,
      incomes,
      totalExpenses,
      totalIncomes
    };
  }, [transactions]);
}
