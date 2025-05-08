
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, PieChart, RefreshCw } from "lucide-react";
import { useFinancialData } from "@/hooks/useFinancialData";
import { FinancialStatCards } from "./financial/FinancialStatCards";
import { FinancialBarChart } from "./financial/FinancialBarChart";
import { FinancialPieChart } from "./financial/FinancialPieChart";
import { Button } from "@/components/ui/button";
import { useTransactions } from "@/contexts/TransactionsContext";
import { Skeleton } from "@/components/ui/skeleton";

export function FinancialSummary() {
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");
  const { chartData, monthlyTotals, pieData, loading, hasCalculated } = useFinancialData();
  const { refreshTransactions, loading: transactionsLoading } = useTransactions();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      console.log("Manual refresh of financial data requested");
      await refreshTransactions();
    } catch (error) {
      console.error("Error refreshing transactions:", error);
    } finally {
      // Set a small timeout to ensure the UI shows the refresh animation
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  // Determine if we should show empty state
  const showEmptyState = hasCalculated && chartData.length === 0 && !loading;
  
  // Determine if data is ready to display
  const dataReady = !loading && chartData.length > 0;

  return (
    <Card className="overflow-hidden shadow-md border-gray-100 dark:border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Resumo Financeiro do Mês</CardTitle>
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
            <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => setChartType("bar")}
                className={`flex items-center px-3 py-1.5 text-sm ${
                  chartType === "bar"
                    ? "bg-primary text-white"
                    : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                } transition-colors`}
                disabled={loading}
              >
                <BarChart className="h-4 w-4 mr-1.5" />
                Barras
              </button>
              <button
                onClick={() => setChartType("pie")}
                className={`flex items-center px-3 py-1.5 text-sm ${
                  chartType === "pie"
                    ? "bg-primary text-white"
                    : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                } transition-colors`}
                disabled={loading}
              >
                <PieChart className="h-4 w-4 mr-1.5" />
                Pizza
              </button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
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
              <BarChart className="h-12 w-12 mx-auto mb-2" />
              <h3 className="text-lg font-medium">Nenhum dado financeiro encontrado</h3>
            </div>
            <p className="text-gray-500 max-w-md mx-auto mb-4">
              Adicione transações financeiras para visualizar o resumo financeiro do mês.
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
              {chartType === "bar" ? (
                <FinancialBarChart chartData={chartData} />
              ) : (
                <FinancialPieChart 
                  pieData={pieData}
                  monthlyTotals={monthlyTotals}
                />
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
