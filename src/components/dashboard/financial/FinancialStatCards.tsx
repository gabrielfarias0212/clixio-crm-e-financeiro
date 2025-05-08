
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "./ChartConstants";
import { Card } from "@/components/ui/card";
import { memo } from "react";

interface FinancialStatCardsProps {
  monthlyTotals: {
    income: number;
    expenses: number;
    balance: number;
  };
}

export const FinancialStatCards = memo(function FinancialStatCards({
  monthlyTotals
}: FinancialStatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      {/* Income Card */}
      <Card className="p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">Entradas do Mês</p>
            <h4 className="text-2xl font-semibold text-green-600">{formatCurrency(monthlyTotals.income)}</h4>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full">
            <ArrowUpCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </Card>

      {/* Expenses Card */}
      <Card className="p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">Saídas do Mês</p>
            <h4 className="text-2xl font-semibold text-rose-600">{formatCurrency(monthlyTotals.expenses)}</h4>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-full">
            <ArrowDownCircle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
          </div>
        </div>
      </Card>

      {/* Balance Card */}
      <Card className="p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">Saldo do Mês</p>
            <h4 className={`text-2xl font-semibold ${monthlyTotals.balance >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
              {formatCurrency(monthlyTotals.balance)}
            </h4>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-full">
            {monthlyTotals.balance >= 0 ? (
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            ) : (
              <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
});
