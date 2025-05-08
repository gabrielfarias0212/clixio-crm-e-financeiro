
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
  TooltipProps
} from "recharts";
import { AnnualChartDataPoint } from "@/hooks/useAnnualFinancialData";
import { CHART_COLORS, formatCurrency } from "./ChartConstants";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AnnualFinancialBarChartProps {
  chartData: AnnualChartDataPoint[];
  loading: boolean;
  currentYear: number;
}

export function AnnualFinancialBarChart({ 
  chartData, 
  loading,
  currentYear 
}: AnnualFinancialBarChartProps) {
  if (loading) {
    return <Skeleton className="h-[240px] w-full" />;
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[240px] text-gray-400">
        Nenhuma transação registrada para {currentYear}
      </div>
    );
  }

  // Custom tooltip component
  const CustomTooltip = ({ 
    active, 
    payload, 
    label 
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as AnnualChartDataPoint;
      return (
        <Card className="p-0 border shadow-lg">
          <CardContent className="p-3 space-y-1">
            <p className="font-medium text-sm">{data.month} {currentYear}</p>
            <div className="space-y-1 text-xs">
              <p className="text-emerald-600 flex justify-between">
                <span>Entradas:</span> 
                <span className="font-medium ml-4">{formatCurrency(data.income)}</span>
              </p>
              <p className="text-rose-600 flex justify-between">
                <span>Saídas:</span> 
                <span className="font-medium ml-4">{formatCurrency(data.expenses)}</span>
              </p>
              <div className="border-t pt-1 mt-1">
                <p className={`flex justify-between font-medium ${data.balance >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                  <span>Saldo:</span> 
                  <span className="ml-4">{formatCurrency(data.balance)}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
        barGap={0}
        barCategoryGap="20%"
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          vertical={false}
          stroke={CHART_COLORS.graph.gridLines} 
        />
        <XAxis 
          dataKey="shortMonth" 
          tick={{ fill: CHART_COLORS.graph.axisText, fontSize: 12 }}
          axisLine={{ stroke: CHART_COLORS.graph.gridLines }}
          tickLine={false}
        />
        <YAxis 
          tick={{ fill: CHART_COLORS.graph.axisText, fontSize: 12 }}
          axisLine={{ stroke: CHART_COLORS.graph.gridLines }}
          tickLine={false}
          tickFormatter={(value) => `R$${value / 1000}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ paddingTop: '10px' }}
          formatter={(value) => {
            const labels = {
              income: "Entradas",
              expenses: "Saídas",
              balance: "Saldo"
            };
            return labels[value as keyof typeof labels] || value;
          }}
        />
        <Bar 
          dataKey="income" 
          fill={CHART_COLORS.income} 
          radius={[4, 4, 0, 0]}
          name="income"
          animationDuration={1000}
        />
        <Bar 
          dataKey="expenses" 
          fill={CHART_COLORS.expenses}
          radius={[4, 4, 0, 0]}
          name="expenses"
          animationDuration={1000}
        />
        <Line
          type="monotone"
          dataKey="balance"
          stroke="#8884d8"
          name="balance"
          strokeWidth={2}
          dot={{ fill: '#8884d8', r: 4 }}
          activeDot={{ r: 6 }}
          animationDuration={1000}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
