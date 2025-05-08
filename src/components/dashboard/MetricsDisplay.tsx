
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useBusinessMetrics } from "@/hooks/useBusinessMetrics";
import { MetricsCard } from "./MetricsCard";
import { 
  FileCheck, 
  BarChart3, 
  TrendingUp, 
  DollarSign 
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import { formatCurrency } from "./MetricsDetailDialog";

interface MetricsDisplayProps {
  onCardClick: (type: "contracts" | "revenue" | "conversion" | "profit") => void;
}

export function MetricsDisplay({ onCardClick }: MetricsDisplayProps) {
  const metrics = useBusinessMetrics();

  return (
    <Card className="overflow-hidden border-0 shadow-md bg-white dark:bg-slate-900">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-2">
        <CardTitle className="text-lg font-medium text-gray-700 dark:text-gray-300">
          Métricas principais
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Contratos Ativos */}
          <MetricsCard 
            icon={<FileCheck />}
            iconColor="text-blue-600 dark:text-blue-400"
            iconBgColor="bg-blue-50 dark:bg-blue-950"
            title="Contratos Ativos no Ano"
            value={metrics.activeContracts}
            onClick={() => onCardClick("contracts")}
          />

          {/* Média de Faturamento */}
          <MetricsCard 
            icon={<BarChart3 />}
            iconColor="text-green-600 dark:text-green-400"
            iconBgColor="bg-green-50 dark:bg-green-950"
            title="Faturamento Mensal Médio"
            value={formatCurrency(metrics.averageMonthlyRevenue)}
            valueColor="text-green-600 dark:text-green-400"
            chart={
              metrics.chartData.some(item => item.value > 0) && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.chartData}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#22c55e" 
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )
            }
            onClick={() => onCardClick("revenue")}
          />

          {/* Taxa de Conversão */}
          <MetricsCard 
            icon={<TrendingUp />}
            iconColor="text-orange-600 dark:text-orange-400"
            iconBgColor="bg-orange-50 dark:bg-orange-950"
            title="Taxa de Conversão"
            value={`${metrics.conversionRate.toFixed(1)}%`}
            valueColor="text-orange-600 dark:text-orange-400"
            chart={
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full mt-3 overflow-hidden">
                <div 
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${Math.min(metrics.conversionRate, 100)}%` }}
                />
              </div>
            }
            onClick={() => onCardClick("conversion")}
          />

          {/* Lucro Líquido */}
          <MetricsCard 
            icon={<DollarSign />}
            iconColor="text-purple-600 dark:text-purple-400"
            iconBgColor="bg-purple-50 dark:bg-purple-950"
            title="Lucro Líquido"
            value={formatCurrency(metrics.netProfit)}
            valueColor={`${metrics.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
            subtext="Receitas vs Despesas"
            onClick={() => onCardClick("profit")}
          />
        </div>
      </CardContent>
    </Card>
  );
}
