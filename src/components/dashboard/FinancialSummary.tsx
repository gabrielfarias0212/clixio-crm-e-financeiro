
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, PieChart, RefreshCw } from "lucide-react";
import { useFinancialData } from "@/hooks/useFinancialData";
import { FinancialStatCards } from "./financial/FinancialStatCards";
import { FinancialBarChart } from "./financial/FinancialBarChart";
import { FinancialPieChart } from "./financial/FinancialPieChart";
import { Button } from "@/components/ui/button";
import { useTransactions } from "@/contexts/TransactionsContext";

export function FinancialSummary() {
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");
  const { chartData, monthlyTotals, pieData, refreshTransactions } = useFinancialData();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshTransactions();
    setTimeout(() => setIsRefreshing(false), 500);
  };

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
              disabled={isRefreshing}
              title="Atualizar dados financeiros"
              className="h-8 w-8"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
            <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => setChartType("bar")}
                className={`flex items-center px-3 py-1.5 text-sm ${
                  chartType === "bar"
                    ? "bg-primary text-white"
                    : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                } transition-colors`}
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
              >
                <PieChart className="h-4 w-4 mr-1.5" />
                Pizza
              </button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
