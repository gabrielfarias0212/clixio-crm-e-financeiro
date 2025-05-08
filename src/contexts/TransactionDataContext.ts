
import { createContext } from 'react';
import { Transaction } from '@/utils/types';
import { FinancialSummary, MonthlyData } from '@/utils/finance/financialSummary';

export type TransactionDataContextType = {
  isLoading: boolean;
  refresh: () => Promise<void>;
  currentMonthSummary: FinancialSummary;
  yearSummary: FinancialSummary;
  monthlyData: MonthlyData;
  getTransactionsByMonth: (year: number, month: number) => Transaction[];
  getMonthSummary: (year: number, month: number) => FinancialSummary;
};

export const TransactionDataContext = createContext<TransactionDataContextType | undefined>(undefined);
