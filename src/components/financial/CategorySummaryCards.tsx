
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, PieChart, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/utils/dateUtils';

interface CategorySummaryCardsProps {
  totalIncomes: number;
  totalExpenses: number;
  incomeCategoriesCount: number;
  expenseCategoriesCount: number;
}

export function CategorySummaryCards({
  totalIncomes,
  totalExpenses,
  incomeCategoriesCount,
  expenseCategoriesCount
}: CategorySummaryCardsProps) {
  const balance = totalIncomes - totalExpenses;
  const balanceColor = balance >= 0 ? 'text-green-600' : 'text-red-600';
  const balanceIcon = balance >= 0 ? TrendingUp : TrendingDown;
  const BalanceIcon = balanceIcon;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Total de Entradas</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncomes)}</p>
              <p className="text-xs text-green-600 mt-1">
                {incomeCategoriesCount} categoria{incomeCategoriesCount !== 1 ? 's' : ''}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Total de Saídas</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
              <p className="text-xs text-red-600 mt-1">
                {expenseCategoriesCount} categoria{expenseCategoriesCount !== 1 ? 's' : ''}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </CardContent>
      </Card>

      <Card className={`border-gray-200 ${balance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Saldo do Período</p>
              <p className={`text-2xl font-bold ${balanceColor}`}>{formatCurrency(balance)}</p>
              <p className="text-xs text-gray-600 mt-1">
                {balance >= 0 ? 'Superávit' : 'Déficit'}
              </p>
            </div>
            <BalanceIcon className={`h-8 w-8 ${balanceColor}`} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total de Categorias</p>
              <p className="text-2xl font-bold text-blue-600">
                {incomeCategoriesCount + expenseCategoriesCount}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {incomeCategoriesCount}E + {expenseCategoriesCount}S
              </p>
            </div>
            <PieChart className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
