
import { useState } from "react";
import { Client, Transaction, TransactionType, FinancialCategory } from "@/utils/types";
import { AddTransactionForm } from "@/components/AddTransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { TransactionCategoryCharts } from "@/components/TransactionCategoryCharts";
import { TransactionFilters } from "@/components/financial/TransactionFilters";
import { PeriodType, WeekInfo } from "@/hooks/useWeeklyFilter";

interface TransactionSectionProps {
  showAddTransaction: boolean;
  onToggleAddTransaction: (show: boolean) => void;
  clients: Client[];
  financialCategories: FinancialCategory[];
  onAddTransaction: (transaction: Omit<Transaction, "id" | "createdAt">) => Promise<void>;
  filteredTransactions: Transaction[];
  onDeleteTransaction: (transactionId: string) => Promise<void>;
  allTransactions: Transaction[];
  periodType: PeriodType;
  currentWeek: WeekInfo;
  typeFilter: TransactionType | "all";
  onTypeFilterChange: (filter: TransactionType | "all") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedMonth: string;
  selectedYear: number;
  onMonthChange: (month: string, year: number) => void;
}

export function TransactionSection({
  showAddTransaction,
  onToggleAddTransaction,
  clients,
  financialCategories,
  onAddTransaction,
  filteredTransactions,
  onDeleteTransaction,
  allTransactions,
  periodType,
  currentWeek,
  typeFilter,
  onTypeFilterChange,
  searchQuery,
  onSearchChange,
  selectedMonth,
  selectedYear,
  onMonthChange
}: TransactionSectionProps) {
  return (
    <div className="space-y-6">
      {showAddTransaction && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-lg font-medium mb-4">Registrar Nova Transação</h2>
          <AddTransactionForm 
            clients={clients}
            onAddTransaction={onAddTransaction}
            onCancel={() => onToggleAddTransaction(false)}
            financialCategories={financialCategories}
          />
        </div>
      )}

      {/* Seção de filtros para transações */}
      <TransactionFilters
        typeFilter={typeFilter}
        onTypeFilterChange={onTypeFilterChange}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={onMonthChange}
      />

      <TransactionList 
        transactions={filteredTransactions} 
        clients={clients} 
        onDeleteTransaction={onDeleteTransaction}
      />

      {/* Gráficos de categorias sincronizados com o período principal */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Análise por Categorias</h2>
        <TransactionCategoryCharts 
          transactions={allTransactions}
          periodType={periodType}
          currentWeek={currentWeek}
        />
      </div>
    </div>
  );
}
