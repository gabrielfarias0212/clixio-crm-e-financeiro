
import { useMemo } from 'react';
import { useTransactionCategories } from '@/hooks/useTransactionCategories';
import { ExpensesByCategoryChart } from './ExpensesByCategoryChart';
import { IncomesByCategoryChart } from './IncomesByCategoryChart';
import { Transaction } from '@/utils/types';
import { isTransactionInWeek, WeekInfo } from '@/utils/dates/weekUtils';
import { PeriodType } from '@/hooks/useWeeklyFilter';

interface TransactionCategoryChartsProps {
  transactions: Transaction[];
  periodType?: PeriodType;
  currentWeek?: WeekInfo;
}

export function TransactionCategoryCharts({ 
  transactions, 
  periodType = "monthly", 
  currentWeek 
}: TransactionCategoryChartsProps) {
  
  // Filtrar transações usando a mesma lógica do TransactionSummary
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return transactions.filter(transaction => {
      // Parse transaction date
      let transactionDate: Date;
      try {
        if (transaction.date.includes('/')) {
          const [day, month, year] = transaction.date.split('/').map(Number);
          transactionDate = new Date(year, month - 1, day);
        } else {
          transactionDate = new Date(transaction.date);
        }
        
        if (isNaN(transactionDate.getTime())) {
          return false;
        }
      } catch (err) {
        return false;
      }

      // Aplicar o mesmo filtro usado no TransactionSummary
      if (periodType === "monthly") {
        const transactionMonth = transactionDate.getMonth();
        const transactionYear = transactionDate.getFullYear();
        return transactionMonth === currentMonth && transactionYear === currentYear;
      } else if (periodType === "weekly" && currentWeek) {
        return isTransactionInWeek(transaction.date, currentWeek);
      }
      
      return true;
    });
  }, [transactions, periodType, currentWeek]);

  const { expenses, incomes, totalExpenses, totalIncomes } = useTransactionCategories(filteredTransactions);

  const periodLabel = periodType === "monthly" ? "Mês Atual" : "Semana Selecionada";

  return (
    <div className="space-y-6">
      {/* Indicador do período sendo exibido */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Dados exibidos para: <span className="font-medium">{periodLabel}</span>
        </p>
      </div>
      
      {/* Gráficos lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpensesByCategoryChart 
          data={expenses} 
          totalAmount={totalExpenses} 
        />
        <IncomesByCategoryChart 
          data={incomes} 
          totalAmount={totalIncomes} 
        />
      </div>
    </div>
  );
}
