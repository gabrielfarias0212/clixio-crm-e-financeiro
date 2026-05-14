import { useState, useEffect, useMemo, Suspense } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Layout from "@/components/Layout";
import { useClients } from "@/contexts/ClientsContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { PlusCircle, TrendingUp, Settings, Calendar } from "lucide-react";
import { Transaction, TransactionType } from "@/utils/types";
import { toast } from "sonner";
import { WeeklyControls } from "@/components/WeeklyControls";
import { useWeeklyFilter } from "@/hooks/useWeeklyFilter";
import { useFinancialCategories } from "@/hooks/useFinancialCategories";
import { FinancialCategoryManager } from "@/components/financial/FinancialCategoryManager";
import { TransactionSection } from "@/components/financial/TransactionSection";
import { ProjectionsSection } from "@/components/financial/ProjectionsSection";
import { OptimizedFinancialSummary } from "@/components/financial/OptimizedFinancialSummary";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionImporter } from "@/components/transaction-importer/TransactionImporter";
import { BusinessFixedExpensesManager } from "@/components/financial/BusinessFixedExpensesManager";
import { FixedExpensesAlerts } from "@/components/financial/FixedExpensesAlerts";

// ── Design tokens ─────────────────────────────────────────────────────────────

const C = {
  text:    "#1a1a1a",
  textSub: "#9A9590",
  divider: "#F0EDE8",
  itemBg:  "#FAFAF8",
  navy:    "#1E3A5F",
  navyBg:  "#E8EEF6",
  border:  "#E8E4DE",
};

const CARD = {
  background: "#FFFFFF",
  borderRadius: 14,
  boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 6px 20px rgba(0,0,0,0.07)",
} as const;

type TabKey = "transactions" | "projections" | "fixed-expenses";

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CashFlow() {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const isMobile = useIsMobile();
  const { clients, refreshClients } = useClients();
  const { transactions, addTransaction, updateTransaction, deleteTransaction, refreshTransactions } = useTransactions();
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const [weeklyBalance, setWeeklyBalance] = useState(0);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("transactions");

  const [searchQuery, setSearchQuery] = useState("");
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(currentDate.getMonth() + 1).padStart(2, "0"));
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const { categories, loading: loadingCategories, addCategory, removeCategory } = useFinancialCategories();
  const weeklyFilter = useWeeklyFilter();

  useEffect(() => {
    document.title = "Financeiro | GCLIXIO";
    refreshTransactions();
    refreshClients();
  }, [refreshTransactions, refreshClients]);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;
    if (typeFilter !== "all") filtered = filtered.filter(t => t.type === typeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.clientId && clients.find(c => c.id === t.clientId)?.name.toLowerCase().includes(q))
      );
    }
    filtered = filtered.filter(t => {
      try {
        let d: Date;
        if (t.date.includes("/")) {
          const [day, month, year] = t.date.split("/").map(Number);
          d = new Date(year, month - 1, day);
        } else {
          d = new Date(t.date);
        }
        if (isNaN(d.getTime())) return false;
        return String(d.getMonth() + 1).padStart(2, "0") === selectedMonth && d.getFullYear() === selectedYear;
      } catch { return false; }
    });
    return filtered;
  }, [transactions, typeFilter, searchQuery, selectedMonth, selectedYear, clients]);

  const handleAddTransaction = async (newTransaction: Omit<Transaction, "id" | "createdAt">) => {
    const result = await addTransaction(newTransaction);
    if (result) {
      setShowAddTransaction(false);
      if (result.clientId && result.type === "entrada") {
        toast.success("Transação registrada e adicionada ao histórico do cliente!");
        refreshClients();
      } else {
        toast.success("Transação registrada com sucesso!");
      }
      refreshTransactions();
    }
  };

  const handleUpdateTransaction = async (id: string, updates: Partial<Omit<Transaction, "id" | "createdAt">>) => {
    const result = await updateTransaction(id, updates);
    if (result) {
      if (result.clientId) refreshClients();
      refreshTransactions();
    }
    return result;
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    await deleteTransaction(transactionId);
    refreshClients();
    refreshTransactions();
  };

  const tabs: { key: TabKey; label: string; labelMobile: string; icon?: typeof TrendingUp }[] = [
    { key: "transactions",    label: "Transações",             labelMobile: "Transações" },
    { key: "projections",     label: "Projeções & Pró-Labore", labelMobile: "Projeções", icon: TrendingUp },
    { key: "fixed-expenses",  label: "Despesas Fixas",         labelMobile: "Desp. Fixas", icon: Calendar },
  ];

  return (
    <Layout>
      <div style={{ maxWidth: 1024, margin: "0 auto", padding: isMobile ? "14px 10px" : "24px 16px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Page header */}
        <div style={{ ...CARD, padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 12 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>Financeiro</h1>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, alignItems: "center" }}>
            <button
              onClick={() => setShowAddTransaction(true)}
              disabled={showAddTransaction}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "8px 16px", borderRadius: 8,
                background: C.navy, border: "none",
                fontSize: 12, fontWeight: 700, color: "#FFFFFF",
                cursor: showAddTransaction ? "not-allowed" : "pointer",
                opacity: showAddTransaction ? 0.6 : 1,
              }}
            >
              <PlusCircle style={{ width: 13, height: 13 }} />
              Nova Transação
            </button>

            <TransactionImporter onImportComplete={() => { refreshTransactions(); refreshClients(); toast.success("Dados atualizados!"); }} />

            <button
              onClick={() => setIsCategoryManagerOpen(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "8px 12px", borderRadius: 8,
                border: `1px solid ${C.border}`, background: C.itemBg,
                fontSize: 12, fontWeight: 600, color: C.text, cursor: "pointer",
              }}
            >
              <Settings style={{ width: 13, height: 13 }} />
              Categorias
            </button>
          </div>
        </div>

        {/* Weekly controls */}
        <Suspense fallback={<Skeleton className="h-14" />}>
          <WeeklyControls
            periodType={weeklyFilter.periodType}
            currentWeek={weeklyFilter.currentWeek}
            onTogglePeriod={weeklyFilter.togglePeriod}
            onPreviousWeek={weeklyFilter.goToPreviousWeek}
            onNextWeek={weeklyFilter.goToNextWeek}
            onCurrentWeek={weeklyFilter.goToCurrentWeek}
          />
        </Suspense>

        {/* Summary KPIs */}
        <OptimizedFinancialSummary
          transactions={transactions}
          periodType={weeklyFilter.periodType}
          currentWeek={weeklyFilter.currentWeek}
          onWeeklyBalanceChange={setWeeklyBalance}
        />

        {/* Tabs */}
        <div>
          {/* Tab bar */}
          <div style={{ display: "flex", borderBottom: `2px solid ${C.divider}`, marginBottom: 18, overflowX: "auto", WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: isMobile ? "8px 12px" : "10px 18px", border: "none", background: "none",
                    fontSize: isMobile ? 12 : 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" as const,
                    color: active ? C.navy : C.textSub,
                    borderBottom: active ? `2px solid ${C.navy}` : "2px solid transparent",
                    marginBottom: -2,
                  }}
                >
                  {Icon && <Icon style={{ width: 13, height: 13 }} />}
                  {isMobile ? tab.labelMobile : tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          {activeTab === "transactions" && (
            <Suspense fallback={<Skeleton className="h-96" />}>
              <TransactionSection
                showAddTransaction={showAddTransaction}
                onToggleAddTransaction={setShowAddTransaction}
                clients={clients}
                financialCategories={categories}
                onAddTransaction={handleAddTransaction}
                onUpdateTransaction={handleUpdateTransaction}
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
                onMonthChange={(month, year) => { setSelectedMonth(month); setSelectedYear(year); }}
              />
            </Suspense>
          )}

          {activeTab === "projections" && (
            <Suspense fallback={<Skeleton className="h-96" />}>
              <ProjectionsSection />
            </Suspense>
          )}

          {activeTab === "fixed-expenses" && (
            <Suspense fallback={<Skeleton className="h-96" />}>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <FixedExpensesAlerts />
                <BusinessFixedExpensesManager />
              </div>
            </Suspense>
          )}
        </div>
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
