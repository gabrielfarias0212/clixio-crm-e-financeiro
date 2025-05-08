
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  LabelList
} from "recharts";
import { CHART_COLORS, formatCurrency } from "./ChartConstants";

interface PieChartProps {
  pieData: Array<{
    name: string;
    value: number;
    fill: string;
  }>;
  monthlyTotals: {
    income: number;
    expenses: number;
    balance: number;
  };
}

// Custom tooltip for pie chart
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-900 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: payload[0].payload.fill }}
          />
          <span className="text-sm font-medium">{payload[0].name}</span>
        </div>
        <p className="text-sm mt-1">
          {formatCurrency(payload[0].value)}
          <span className="text-xs text-gray-500 ml-2">
            ({((payload[0].value / (payload[0].payload.total || 1)) * 100).toFixed(1)}%)
          </span>
        </p>
      </div>
    );
  }
  return null;
};

// Custom legend for pie chart
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

export function FinancialPieChart({ pieData, monthlyTotals }: PieChartProps) {
  const total = monthlyTotals.income + monthlyTotals.expenses;
  
  // Add total to each data item for percentage calculation
  const enrichedPieData = pieData.map(item => ({
    ...item,
    total
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          data={enrichedPieData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={90}
          innerRadius={60}
          paddingAngle={2}
          dataKey="value"
        >
          {enrichedPieData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.fill}
              stroke="rgba(255,255,255,0.5)"
              strokeWidth={1}
            />
          ))}
          <LabelList 
            dataKey="name" 
            position="outside"
            offset={20}
            fill="#6B7280"
            formatter={(value: string) => {
              const entry = enrichedPieData.find(item => item.name === value);
              if (!entry || total === 0) return value;
              return `${value} (${((entry.value / total) * 100).toFixed(1)}%)`;
            }}
          />
        </Pie>
        <Tooltip content={<CustomPieTooltip />} />
        <Legend 
          payload={[
            { value: 'Entradas', color: CHART_COLORS.income, type: 'square' },
            { value: 'Saídas', color: CHART_COLORS.expenses, type: 'square' },
          ]}
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          content={<CustomLegend />}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
