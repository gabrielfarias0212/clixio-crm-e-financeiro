
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CHART_COLORS, formatCurrency } from "./ChartConstants";

interface BarChartProps {
  chartData: Array<{
    name: string;
    income: number;
    expenses: number;
    balance: number;
  }>;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-900 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="text-sm font-medium">{label}</p>
        <div className="mt-2 space-y-1">
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-gray-600 dark:text-gray-300">
                {item.name}: {formatCurrency(item.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Custom legend component
const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mt-2">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-600 dark:text-gray-300">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function FinancialBarChart({ chartData }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        barGap={4}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.graph.gridLines} />
        <XAxis 
          dataKey="name" 
          tick={{ fill: CHART_COLORS.graph.axisText, fontSize: 12 }}
        />
        <YAxis 
          tick={{ fill: CHART_COLORS.graph.axisText, fontSize: 12 }}
          tickFormatter={(value) => 
            new Intl.NumberFormat('pt-BR', { 
              notation: 'compact',
              compactDisplay: 'short'
            }).format(value)
          }
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
        <Bar 
          dataKey="income" 
          name="Entradas" 
          fill={CHART_COLORS.income} 
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
        <Bar 
          dataKey="expenses" 
          name="Saídas" 
          fill={CHART_COLORS.expenses} 
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
