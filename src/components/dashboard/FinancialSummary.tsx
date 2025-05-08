
import { useTransactions } from "@/contexts/TransactionsContext";
import { Transaction } from "@/utils/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownCircle, ArrowUpCircle, TrendingDown, TrendingUp, BarChart, PieChart } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  LabelList
} from "recharts";
import { useEffect, useState } from "react";

// Updated modern color palette
const CHART_COLORS = {
  income: "#8B5CF6",  // purple
  expenses: "#F43F5E", // rose
  graph: {
    gridLines: "#e5e7eb",
    axisText: "#6b7280",
  },
  background: {
    light: "rgba(255, 255, 255, 0.5)",
    dark: "rgba(30, 41, 59, 0.5)"
  }
};

export function FinancialSummary() {
  const { transactions, refreshTransactions } = useTransactions();
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");
  const [chartData, setChartData] = useState<any[]>([]);
  const [monthlyTotals, setMonthlyTotals] = useState({
    income: 0,
    expenses: 0,
    balance: 0
  });
  
  // Use effect to process transactions whenever they change
  useEffect(() => {
    calculateFinancialData();
  }, [transactions]);
  
  // Function to calculate all financial data
  const calculateFinancialData = () => {
    // Get current month's transactions
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);

    const currentMonthTransactions = transactions.filter(
      (t) => {
        const date = new Date(t.date);
        return date >= currentMonthStart && date <= currentMonthEnd;
      }
    );

    // Calculate monthly totals
    const totals = {
      income: currentMonthTransactions
        .filter((t) => t.type === "entrada")
        .reduce((sum, t) => sum + Number(t.amount), 0),
      expenses: currentMonthTransactions
        .filter((t) => t.type === "saída")
        .reduce((sum, t) => sum + Number(t.amount), 0),
    };
    
    const balance = totals.income - totals.expenses;
    setMonthlyTotals({ ...totals, balance });

    // Prepare last 6 months data for chart
    const monthsData = Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(now, i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthTransactions = transactions.filter((t) => {
        const transDate = new Date(t.date);
        return transDate >= monthStart && transDate <= monthEnd;
      });

      const income = monthTransactions
        .filter((t) => t.type === "entrada")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expenses = monthTransactions
        .filter((t) => t.type === "saída")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        name: format(date, "MMM", { locale: ptBR }),
        income,
        expenses,
        balance: income - expenses
      };
    }).reverse();
    
    setChartData(monthsData);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Prepare pie chart data
  const pieData = [
    { name: "Entradas", value: monthlyTotals.income, fill: CHART_COLORS.income },
    { name: "Saídas", value: monthlyTotals.expenses, fill: CHART_COLORS.expenses },
  ];

  // Custom tooltip components
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
              ({((payload[0].value / (monthlyTotals.income + monthlyTotals.expenses || 1)) * 100).toFixed(1)}%)
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

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

  // Effect to refresh financial data when component mounts
  useEffect(() => {
    // Ensure we have the latest transactions when component mounts
    refreshTransactions();
  }, []);

  return (
    <Card className="overflow-hidden shadow-md border-gray-100 dark:border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Resumo Financeiro do Mês</CardTitle>
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
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 p-4 rounded-xl">
            <p className="text-sm text-green-700 dark:text-green-400 mb-1">Entradas</p>
            <div className="flex items-center">
              <ArrowUpCircle className="h-5 w-5 mr-2 text-green-500" />
              <span className="text-xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(monthlyTotals.income)}
              </span>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 p-4 rounded-xl">
            <p className="text-sm text-red-700 dark:text-red-400 mb-1">Saídas</p>
            <div className="flex items-center">
              <ArrowDownCircle className="h-5 w-5 mr-2 text-red-500" />
              <span className="text-xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(monthlyTotals.expenses)}
              </span>
            </div>
          </div>
          
          <div className={`bg-gradient-to-r ${
            monthlyTotals.balance >= 0 
              ? "from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30" 
              : "from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30"
          } p-4 rounded-xl`}>
            <p className={`text-sm ${
              monthlyTotals.balance >= 0 
                ? "text-purple-700 dark:text-purple-400" 
                : "text-red-700 dark:text-red-400"
            } mb-1`}>Saldo</p>
            <div className="flex items-center">
              {monthlyTotals.balance >= 0 ? (
                <TrendingUp className="h-5 w-5 mr-2 text-purple-500" />
              ) : (
                <TrendingDown className="h-5 w-5 mr-2 text-red-500" />
              )}
              <span 
                className={`text-xl font-bold ${
                  monthlyTotals.balance >= 0 
                    ? "text-purple-600 dark:text-purple-400" 
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatCurrency(monthlyTotals.balance)}
              </span>
            </div>
          </div>
        </div>

        <div className="h-[240px] mt-4">
          {chartType === "bar" ? (
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
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={90}
                  innerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
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
                      const entry = pieData.find(item => item.name === value);
                      const total = monthlyTotals.income + monthlyTotals.expenses;
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
          )}
        </div>
      </CardContent>
    </Card>
  );
}
