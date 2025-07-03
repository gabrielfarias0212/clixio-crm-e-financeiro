
import { useOptimizedAnnualData } from "@/hooks/useOptimizedAnnualData";
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

export function CleanFinancialSummary() {
  const { chartData, yearTotals } = useOptimizedAnnualData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="p-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-50 rounded-full mx-auto mb-3">
            <ArrowUpCircle className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-sm text-gray-500 mb-1">Entradas</p>
          <p className="text-xl font-semibold text-green-600">
            {formatCurrency(yearTotals.income)}
          </p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-full mx-auto mb-3">
            <ArrowDownCircle className="h-6 w-6 text-red-600" />
          </div>
          <p className="text-sm text-gray-500 mb-1">Saídas</p>
          <p className="text-xl font-semibold text-red-600">
            {formatCurrency(yearTotals.expenses)}
          </p>
        </div>

        <div className="text-center">
          <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-3 ${
            yearTotals.balance >= 0 ? 'bg-green-50' : 'bg-red-50'
          }`}>
            {yearTotals.balance >= 0 ? (
              <TrendingUp className="h-6 w-6 text-green-600" />
            ) : (
              <TrendingDown className="h-6 w-6 text-red-600" />
            )}
          </div>
          <p className="text-sm text-gray-500 mb-1">Saldo</p>
          <p className={`text-xl font-semibold ${
            yearTotals.balance >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(yearTotals.balance)}
          </p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-full mx-auto mb-3">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-sm text-gray-500 mb-1">Crescimento</p>
          <p className="text-xl font-semibold text-blue-600">
            {yearTotals.balance > 0 ? '+' : ''}{((yearTotals.balance / Math.max(yearTotals.expenses, 1)) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              className="text-sm text-gray-500"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              className="text-sm text-gray-500"
              tickFormatter={(value) => `R$ ${(value / 1000)}k`}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), '']}
              labelClassName="text-gray-700"
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#incomeGradient)"
              name="Entradas"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#expenseGradient)"
              name="Saídas"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
