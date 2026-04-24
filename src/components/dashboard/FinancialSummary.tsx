import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RefreshCw, CalendarDays } from "lucide-react";
import { useAnnualFinancialData } from "@/hooks/useAnnualFinancialData";
import { useFinancialData } from "@/hooks/useFinancialData";
import { FinancialStatCards } from "./financial/FinancialStatCards";
import { AnnualFinancialBarChart } from "./financial/AnnualFinancialBarChart";
import { useTransactions } from "@/contexts/TransactionsContext";
import { Skeleton } from "@/components/ui/skeleton";

export function FinancialSummary() {
  const { chartData: annualChartData, currentYear, loading: annualLoading, hasCalculated: annualHasCalculated } = useAnnualFinancialData();
  const { monthlyTotals, loading: monthlyLoading } = useFinancialData();
  const { refreshTransactions, loading: transactionsLoading } = useTransactions();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await refreshTransactions();
    } catch (error) {
      console.error("Error refreshing transactions:", error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const isLoading = annualLoading || monthlyLoading;
  const showEmptyState = annualHasCalculated && annualChartData.length === 0 && !isLoading;
  const dataReady = !isLoading && annualChartData.length > 0;

  return (
    <Card className="rounded-xl border-stone-200 shadow-sm overflow-hidden">
      <CardHeader className="px-5 py-4 border-b border-stone-100">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium tracking-widest uppercase text-stone-400">
            Resumo Financeiro {currentYear}
          </p>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || transactionsLoading}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors disabled:opacity-40"
            title="Atualizar dados financeiros"
          >
            <RefreshCw
              size={13}
              strokeWidth={1.5}
              className={isRefreshing || transactionsLoading ? "animate-spin" : ""}
            />
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        {isLoading && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 rounded-lg bg-stone-100" />
              ))}
            </div>
            <Skeleton className="h-52 rounded-lg bg-stone-100" />
          </div>
        )}

        {showEmptyState && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CalendarDays size={32} strokeWidth={1} className="text-stone-300 mb-3" />
            <p className="text-sm font-medium text-stone-500 mb-1">
              Nenhum dado financeiro encontrado
            </p>
            <p className="text-[11px] text-stone-400 mb-4">
              Adicione transações para visualizar o resumo.
            </p>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-[11px] text-stone-500 hover:text-stone-700 underline underline-offset-2 transition-colors"
            >
              {isRefreshing ? "Atualizando..." : "Atualizar dados"}
            </button>
          </div>
        )}

        {dataReady && (
          <div className="space-y-4">
            <FinancialStatCards monthlyTotals={monthlyTotals} />
            <div className="h-52">
              <AnnualFinancialBarChart
                chartData={annualChartData}
                loading={annualLoading}
                currentYear={currentYear}
              />
            </div>
            <p className="text-[11px] text-stone-400 text-center">
              Resumo financeiro anual de {currentYear}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
