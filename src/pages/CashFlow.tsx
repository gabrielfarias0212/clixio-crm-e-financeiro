import { useState, useEffect, useMemo, Suspense } from "react";
import Layout from "@/components/Layout";
import { useClients } from "@/contexts/ClientsContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { Button } from "@/components/ui/button";
import { PlusCircle, TrendingUp, Settings } from "lucide-react";
import { Transaction, TransactionType } from "@/utils/types";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WeeklyControls } from "@/components/WeeklyControls";
import { useWeeklyFilter } from "@/hooks/useWeeklyFilter";
import { useFinancialCategories } from "@/hooks/useFinancialCategories";
import { FinancialCategoryManager } from "@/components/financial/FinancialCategoryManager";
import { TransactionSection } from "@/components/financial/TransactionSection";
import { ProjectionsSection } from "@/components/financial/ProjectionsSection";
import { OptimizedFinancialSummary } from "@/components/financial/OptimizedFinancialSummary";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionImporter } from "@/components/transaction-importer/TransactionImporter";

export default function CashFlow() {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const { clients, refreshClients } = useClients();
  const { transactions, addTransaction, deleteTransaction, refreshTransactions } = useTransactions();
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const [weeklyBalance, setWeeklyBalance] = useState(0);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  
  // Estados para pesquisa e filtro mensal das transações
  const [searchQuery, setSearchQuery] = useState("");
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(currentDate.getMonth() + 1).padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const { categories, loading: loadingCategories, addCategory, removeCategory } = useFinancialCategories();
  
  // Hook para filtro semanal
  const weeklyFilter = useWeeklyFilter();

  useEffect(() => {
    document.title = "Financeiro | Wedding CRM";
    
    // Ensure we have the latest data when the page loads
    refreshTransactions();
    refreshClients();
  }, [refreshTransactions, refreshClients]);

  // Filtrar transações por tipo, pesquisa e mês
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filtro por tipo
    if (typeFilter !== "all") {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    // Filtro por pesquisa
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        (t.clientId && clients.find(c => c.id === t.clientId)?.name.toLowerCase().includes(query))
      );
    }

    // Filtro por mês/ano
    filtered = filtered.filter(transaction => {
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

      const transactionMonth = String(transactionDate.getMonth() + 1).padStart(2, '0');
      const transactionYear = transactionDate.getFullYear();
      
      return transactionMonth === selectedMonth && transactionYear === selectedYear;
    });

    return filtered;
  }, [transactions, typeFilter, searchQuery, selectedMonth, selectedYear, clients]);

  const handleAddTransaction = async (newTransaction: Omit<Transaction, "id" | "createdAt">) => {
    const result = await addTransaction(newTransaction);
    
    if (result) {
      setShowAddTransaction(false);
      
      // If this transaction is linked to a client and is an income, refresh clients data
      // to update the client's payment history
      if (result.clientId && result.type === "entrada") {
        toast.success("Transação registrada e adicionada ao histórico do cliente!");
        refreshClients();
      } else {
        toast.success("Transação registrada com sucesso!");
      }
      
      // Refresh transactions to update all views that depend on transaction data
      refreshTransactions();
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    await deleteTransaction(transactionId);
    
    // Refresh client data to update payment history
    refreshClients();
    
    // Also refresh transactions to update all views
    refreshTransactions();
  };

  const handleMonthChange = (month: string, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const handleImportComplete = () => {
    // Refresh data after import
    refreshTransactions();
    refreshClients();
    toast.success("Dados atualizados após importação!");
  };

  return (
    <Layout>
      <div className="max-w-screen-lg mx-auto px-4 py-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold">Financeiro</h1>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setShowAddTransaction(true)}
              disabled={showAddTransaction}
              className="gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Nova Transação
            </Button>
            <TransactionImporter onImportComplete={handleImportComplete} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCategoryManagerOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Categorias
            </Button>
          </div>
        </div>

        {/* Controles de Filtro Semanal */}
        <Suspense fallback={<Skeleton className="h-16 mb-6" />}>
          <WeeklyControls
            periodType={weeklyFilter.periodType}
            currentWeek={weeklyFilter.currentWeek}
            onTogglePeriod={weeklyFilter.togglePeriod}
            onPreviousWeek={weeklyFilter.goToPreviousWeek}
            onNextWeek={weeklyFilter.goToNextWeek}
            onCurrentWeek={weeklyFilter.goToCurrentWeek}
          />
        </Suspense>

        <OptimizedFinancialSummary 
          transactions={transactions} 
          className="mb-6"
          periodType={weeklyFilter.periodType}
          currentWeek={weeklyFilter.currentWeek}
          onWeeklyBalanceChange={setWeeklyBalance}
        />

        {/* Tabs para separar Transações e Projeções */}
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="projections" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Projeções & Pró-Labore
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-6">
            <Suspense fallback={<Skeleton className="h-96" />}>
              <TransactionSection
                showAddTransaction={showAddTransaction}
                onToggleAddTransaction={setShowAddTransaction}
                clients={clients}
                financialCategories={categories}
                onAddTransaction={handleAddTransaction}
                filteredTransactions={filteredTransactions}
                onDeleteTransaction={handleDeleteTransaction}
                allTransactions={transactions}
                periodType={weeklyFilter.periodType}
                currentWeek={weeklyFilter.currentWeek}
                typeFilter={typeFilter}
                onTypeFilterChange={setTypeFilter}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onMonthChange={handleMonthChange}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="projections">
            <Suspense fallback={<Skeleton className="h-96" />}>
              <ProjectionsSection />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
      <FinancialCategoryManager
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        categories={categories}
        addCategory={addCategory}
        removeCategory={removeCategory}
        loading={loadingCategories}
      />
    </Layout>
  );
}
