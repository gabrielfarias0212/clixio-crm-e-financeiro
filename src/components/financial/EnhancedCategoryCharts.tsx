
import { useMemo, useState } from 'react';
import { Transaction } from '@/utils/types';
import { useTransactionCategories, CategoryData } from '@/hooks/useTransactionCategories';
import { MonthFilter } from './MonthFilter';
import { CategoryChart } from './CategoryChart';
import { CategorySummaryCards } from './CategorySummaryCards';

interface EnhancedCategoryCha rtsProps {
  transactions: Transaction[];
}

export function EnhancedCategoryCharts({ transactions }: EnhancedCategoryCha rtsProps) {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(currentDate.getMonth() + 1).padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Filtrar transações pelo mês/ano selecionado
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const transactionMonth = String(transactionDate.getMonth() + 1).padStart(2, '0');
      const transactionYear = transactionDate.getFullYear();
      
      return transactionMonth === selectedMonth && transactionYear === selectedYear;
    });
  }, [transactions, selectedMonth, selectedYear]);

  const { expenses, incomes, totalExpenses, totalIncomes } = useTransactionCategories(filteredTransactions);

  const handleMonthChange = (month: string, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  return (
    <div className="space-y-6">
      <MonthFilter
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={handleMonthChange}
      />
      
      <CategorySummaryCards
        totalIncomes={totalIncomes}
        totalExpenses={totalExpenses}
        incomeCategoriesCount={incomes.length}
        expenseCategoriesCount={expenses.length}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart
          title="Saídas por Categoria"
          data={expenses}
          totalAmount={totalExpenses}
          type="expense"
        />
        <CategoryChart
          title="Entradas por Categoria"
          data={incomes}
          totalAmount={totalIncomes}
          type="income"
        />
      </div>
    </div>
  );
}
