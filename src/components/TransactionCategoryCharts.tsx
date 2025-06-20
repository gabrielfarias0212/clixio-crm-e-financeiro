
import { useState, useMemo } from 'react';
import { useTransactionCategories } from '@/hooks/useTransactionCategories';
import { ExpensesByCategoryChart } from './ExpensesByCategoryChart';
import { IncomesByCategoryChart } from './IncomesByCategoryChart';
import { MonthFilter } from './financial/MonthFilter';
import { Transaction } from '@/utils/types';

interface TransactionCategoryChartsProps {
  transactions: Transaction[];
}

export function TransactionCategoryCharts({ transactions }: TransactionCategoryChartsProps) {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(currentDate.getMonth() + 1).padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Filtrar transações pelo mês/ano selecionado APENAS para os gráficos
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
      {/* Filtro de mês */}
      <MonthFilter
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={handleMonthChange}
      />
      
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
