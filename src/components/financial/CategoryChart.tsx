
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryData } from '@/hooks/useTransactionCategories';
import { formatCurrency } from '@/utils/currency';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface CategoryChartProps {
  title: string;
  data: CategoryData[];
  totalAmount: number;
  type: 'income' | 'expense';
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <span className="font-medium">{data.category}</span>
        </div>
        <p className="text-sm">
          <span className="font-semibold">{formatCurrency(data.amount)}</span>
          <span className="text-gray-500 ml-2">({data.percentage.toFixed(1)}%)</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {data.transactions.length} transação{data.transactions.length !== 1 ? 'ões' : ''}
        </p>
      </div>
    );
  }
  return null;
};

export function CategoryChart({ title, data, totalAmount, type }: CategoryChartProps) {
  const isEmpty = data.length === 0 || totalAmount === 0;
  const Icon = type === 'income' ? TrendingUp : TrendingDown;
  const colorClass = type === 'income' ? 'text-green-600' : 'text-red-600';

  return (
    <Card className="h-[500px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${colorClass}`} />
          {title}
        </CardTitle>
        <div className={`text-2xl font-bold ${colorClass}`}>
          {formatCurrency(totalAmount)}
        </div>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <Icon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma transação encontrada</p>
              <p className="text-sm">para o período selecionado</p>
            </div>
          </div>
        ) : (
          <>
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="amount"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {data.slice(0, 5).map((category, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="truncate">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(category.amount)}</div>
                    <div className="text-xs text-gray-500">{category.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
              {data.length > 5 && (
                <div className="text-xs text-gray-500 text-center pt-2">
                  +{data.length - 5} outras categorias
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
