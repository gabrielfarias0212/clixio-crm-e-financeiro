
import { useTransactionCategories } from '@/hooks/useTransactionCategories';
import { ExpensesByCategoryChart } from './ExpensesByCategoryChart';
import { IncomesByCategoryChart } from './IncomesByCategoryChart';
import { Transaction } from '@/utils/types';

interface TransactionCategoryChartsProps {
  transactions: Transaction[];
}

export function TransactionCategoryCharts({ transactions }: TransactionCategoryChartsProps) {
  const { expenses, incomes, totalExpenses, totalIncomes } = useTransactionCategories(transactions);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <ExpensesByCategoryChart 
        data={expenses} 
        totalAmount={totalExpenses} 
      />
      <IncomesByCategoryChart 
        data={incomes} 
        totalAmount={totalIncomes} 
      />
    </div>
  );
}
