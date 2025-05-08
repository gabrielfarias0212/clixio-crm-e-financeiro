
import { Transaction } from "@/utils/types";
import { isWithinInterval, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { stringToDate } from '@/utils/dateUtils';

export type FinancialSummary = {
  income: number;
  expenses: number;
  balance: number;
};

export type MonthlyData = {
  [monthKey: string]: {
    transactions: Transaction[];
    summary: FinancialSummary;
  };
};

/**
 * Calculate financial summary from transactions
 */
export function calculateSummary(transactions: Transaction[]): {
  totalIncome: number;
  totalExpenses: number;
  thisMonthIncome: number;
  thisMonthExpenses: number;
  monthlyData: MonthlyData;
} {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const yearStart = startOfYear(now);
  const yearEnd = endOfYear(now);
  
  // Initialize temporary monthly data structure
  const monthlyData: MonthlyData = {};
  
  // Initialize current month and year summaries
  let totalIncome = 0;
  let totalExpenses = 0;
  let thisMonthIncome = 0;
  let thisMonthExpenses = 0;
  
  // Process each transaction
  transactions.forEach(transaction => {
    try {
      if (!transaction.date) return;
      
      const date = stringToDate(transaction.date);
      if (!date) return;
      
      const year = date.getFullYear();
      const month = date.getMonth();
      const monthKey = `${year}-${month}`;
      
      // Initialize month data if it doesn't exist
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          transactions: [],
          summary: { income: 0, expenses: 0, balance: 0 }
        };
      }
      
      // Add transaction to the month
      monthlyData[monthKey].transactions.push(transaction);
      
      // Update month summary
      const amount = Number(transaction.amount) || 0;
      if (transaction.type === "entrada") {
        monthlyData[monthKey].summary.income += amount;
        totalIncome += amount;
        
        // Update current month summary if applicable
        if (isWithinInterval(date, { start: currentMonthStart, end: currentMonthEnd })) {
          thisMonthIncome += amount;
        }
      } else if (transaction.type === "saída") {
        monthlyData[monthKey].summary.expenses += amount;
        totalExpenses += amount;
        
        // Update current month summary if applicable
        if (isWithinInterval(date, { start: currentMonthStart, end: currentMonthEnd })) {
          thisMonthExpenses += amount;
        }
      }
      
      // Calculate balance
      monthlyData[monthKey].summary.balance = 
        monthlyData[monthKey].summary.income - monthlyData[monthKey].summary.expenses;
    } catch (err) {
      console.error("Error processing transaction:", err);
    }
  });

  // Return all calculated data
  return {
    totalIncome,
    totalExpenses,
    thisMonthIncome,
    thisMonthExpenses,
    monthlyData
  };
}

/**
 * Get transactions for a specific month
 */
export function getTransactionsByMonth(
  monthlyData: MonthlyData,
  year: number,
  month: number
): Transaction[] {
  const monthKey = `${year}-${month}`;
  return monthlyData[monthKey]?.transactions || [];
}

/**
 * Get financial summary for a specific month
 */
export function getMonthSummary(
  monthlyData: MonthlyData, 
  year: number, 
  month: number
): FinancialSummary {
  const monthKey = `${year}-${month}`;
  return monthlyData[monthKey]?.summary || { income: 0, expenses: 0, balance: 0 };
}
