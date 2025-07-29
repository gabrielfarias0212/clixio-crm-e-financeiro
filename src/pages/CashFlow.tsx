
import { useState, useEffect } from "react";
import { useTransactions } from "@/contexts/TransactionsContext";
import { OptimizedFinancialSummary } from "@/components/financial/OptimizedFinancialSummary";
import { TransactionSection } from "@/components/financial/TransactionSection";
import { ProjectionsSection } from "@/components/financial/ProjectionsSection";
import { ProLaboreSection } from "@/components/financial/ProLaboreSection";
import { ProLaboreHistorySection } from "@/components/financial/ProLaboreHistorySection";
import { LazyTransactionCharts } from "@/components/financial/LazyTransactionCharts";
import { MonthFilter } from "@/components/financial/MonthFilter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CashFlowPage() {
  const { refreshTransactions } = useTransactions();
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  useEffect(() => {
    document.title = "Financeiro | Wedding CRM";
    refreshTransactions();
  }, [refreshTransactions]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Controle Financeiro</h1>
        <MonthFilter
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />
      </div>

      <OptimizedFinancialSummary selectedMonth={selectedMonth} />

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
          <TabsTrigger value="projections">Projeções</TabsTrigger>
          <TabsTrigger value="prolabore">Pró-Labore</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">
          <TransactionSection selectedMonth={selectedMonth} />
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <LazyTransactionCharts selectedMonth={selectedMonth} />
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
