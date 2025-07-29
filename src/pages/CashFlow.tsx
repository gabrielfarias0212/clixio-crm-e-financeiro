import { useState, useEffect, useMemo } from "react";
import { useTransactions } from "@/contexts/TransactionsContext";
import { useClients } from "@/contexts/ClientsContext";
import { useFinancialCategories } from "@/hooks/useFinancialCategories";
import { useWeeklyFilter } from "@/hooks/useWeeklyFilter";
import { OptimizedFinancialSummary } from "@/components/financial/OptimizedFinancialSummary";
import { TransactionSection } from "@/components/financial/TransactionSection";
import { ProjectionsSection } from "@/components/financial/ProjectionsSection";
import { ProLaboreSection } from "@/components/financial/ProLaboreSection";
import { ProLaboreHistorySection } from "@/components/financial/ProLaboreHistorySection";
import { LazyTransactionCharts } from "@/components/financial/LazyTransactionCharts";
import { MonthFilter } from "@/components/financial/MonthFilter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TransactionType, Transaction } from "@/utils/types";

export default function CashFlowPage() {
  const { transactions, addTransaction, deleteTransaction } = useTransactions();
  const { clients } = useClients();
  const { categories: financialCategories } = useFinancialCategories();
  
  // Estado para filtros
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return (now.getMonth() + 1).toString().padStart(2, '0');
  });
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Configurar filtro semanal
  const {
    periodType,
    currentWeek,
    weeklyBalance,
    setWeeklyBalance
  } = useWeeklyFilter();

  // Filtrar transações por mês/ano e outros filtros
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const transactionMonth = (transactionDate.getMonth() + 1).toString().padStart(2, '0');
      const transactionYear = transactionDate.getFullYear();
      
      // Filtro por período
      if (transactionMonth !== selectedMonth || transactionYear !== selectedYear) {
        return false;
      }
      
      // Filtro por tipo
      if (typeFilter !== "all" && transaction.type !== typeFilter) {
        return false;
      }
      
      // Filtro por busca
      if (searchQuery && !transaction.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [transactions, selectedMonth, selectedYear, typeFilter, searchQuery]);

  const handleMonthChange = (month: string, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  // Wrapper para addTransaction para compatibilidade de tipos
  const handleAddTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    await addTransaction(transaction);
  };

  useEffect(() => {
    document.title = "Financeiro | Wedding CRM";
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Controle Financeiro</h1>
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => setShowAddTransaction(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Transação
          </Button>
        </div>
      </div>

      <MonthFilter
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={handleMonthChange}
      />

      <OptimizedFinancialSummary
        transactions={filteredTransactions}
        periodType={periodType}
        currentWeek={currentWeek}
        onWeeklyBalanceChange={setWeeklyBalance}
      />

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
          <TabsTrigger value="projections">Projeções</TabsTrigger>
          <TabsTrigger value="prolabore">Pró-Labore</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">
          <TransactionSection
            showAddTransaction={showAddTransaction}
            onToggleAddTransaction={setShowAddTransaction}
            clients={clients}
            financialCategories={financialCategories}
            onAddTransaction={handleAddTransaction}
            filteredTransactions={filteredTransactions}
            onDeleteTransaction={deleteTransaction}
            allTransactions={transactions}
            periodType={periodType}
            currentWeek={currentWeek}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={handleMonthChange}
          />
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <LazyTransactionCharts
            transactions={filteredTransactions}
            periodType={periodType}
            currentWeek={currentWeek}
          />
        </TabsContent>

        <TabsContent value="projections" className="space-y-6">
          <ProjectionsSection />
        </TabsContent>

        <TabsContent value="prolabore" className="space-y-6">
          <ProLaboreSection />
          <ProLaboreHistorySection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
