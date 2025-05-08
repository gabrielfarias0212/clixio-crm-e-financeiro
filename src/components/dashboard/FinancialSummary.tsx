
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, CalendarDays } from "lucide-react";
import { useAnnualFinancialData } from "@/hooks/useAnnualFinancialData";
import { useFinancialData } from "@/hooks/useFinancialData";
import { FinancialStatCards } from "./financial/FinancialStatCards";
import { AnnualFinancialBarChart } from "./financial/AnnualFinancialBarChart";
import { Button } from "@/components/ui/button";
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
    } finally {
      // Set a small timeout to ensure the UI shows the refresh animation
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  // Determine loading and empty states
  const isLoading = annualLoading || monthlyLoading;
  const showEmptyState = annualHasCalculated && annualChartData.length === 0 && !isLoading;
  const dataReady = !isLoading && annualChartData.length > 0;

  return (
    <Card className="overflow-hidden shadow-md border-gray-100 dark:border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Resumo Financeiro</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleRefresh} 
              disabled={isRefreshing || transactionsLoading}
              title="Atualizar dados financeiros"
              className="h-8 w-8"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing || transactionsLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
            <Skeleton className="h-[240px]" />
          </div>
        )}
        
        {showEmptyState && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-gray-400 mb-4">
              <CalendarDays className="h-12 w-12 mx-auto mb-2" />
              <h3 className="text-lg font-medium">Nenhum dado financeiro encontrado</h3>
            </div>
            <p className="text-gray-500 max-w-md mx-auto mb-4">
              Adicione transações financeiras para visualizar o resumo financeiro.
            </p>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              Atualizar dados
              {isRefreshing && <RefreshCw className="ml-2 h-4 w-4 animate-spin" />}
            </Button>
          </div>
        )}
        
        {dataReady && (
          <>
            <FinancialStatCards monthlyTotals={monthlyTotals} />
            
            <div className="h-[240px] mt-4">
              <AnnualFinancialBarChart 
                chartData={annualChartData}
                loading={annualLoading}
                currentYear={currentYear}
              />
            </div>
            
            <div className="mt-4 text-sm text-center text-gray-500">
              Resumo financeiro anual de {currentYear}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
