
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { CategoryData } from '@/hooks/useTransactionCategories';
import { TransactionCategoryModal } from './TransactionCategoryModal';
import { TrendingUp } from 'lucide-react';

interface IncomesByCategoryChartProps {
  data: CategoryData[];
  totalAmount: number;
}

export function IncomesByCategoryChart({ data, totalAmount }: IncomesByCategoryChartProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handlePieClick = (categoryData: CategoryData) => {
    setSelectedCategory(categoryData);
    setModalOpen(true);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.category}</p>
          <p className="text-sm text-green-600">
            {formatCurrency(data.amount)} ({data.percentage.toFixed(1)}%)
          </p>
          <p className="text-xs text-muted-foreground">
            {data.transactions.length} transação(ões)
          </p>
        </div>
      );
    }
    return null;
  };

  const chartConfig = data.reduce((config, item, index) => {
    config[item.category] = {
      label: item.category,
      color: item.color,
    };
    return config;
  }, {} as any);

  if (data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Ganhos por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma receita encontrada</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-full cursor-pointer">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Ganhos por Categoria
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Total: {formatCurrency(totalAmount)}
          </p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  onClick={handlePieClick}
                  className="cursor-pointer"
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Pie>
                <ChartTooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color }}>
                      {value} ({data.find(d => d.category === value)?.percentage.toFixed(1)}%)
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {selectedCategory && (
        <TransactionCategoryModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          category={selectedCategory.category}
          transactions={selectedCategory.transactions}
          type="entrada"
          totalAmount={selectedCategory.amount}
        />
      )}
    </>
  );
}
