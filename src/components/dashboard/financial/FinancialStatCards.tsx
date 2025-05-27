
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "./ChartConstants";

interface FinancialStatCardsProps {
  monthlyTotals: {
    income: number;
    expenses: number;
    balance: number;
  };
}

export function FinancialStatCards({
  monthlyTotals
}: FinancialStatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      {/* Income Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Entradas do Mês</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(monthlyTotals.income)}
            </p>
          </div>
          <ArrowUpCircle className="h-8 w-8 text-green-500" />
        </div>
      </div>

      {/* Expenses Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Saídas do Mês</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(monthlyTotals.expenses)}
            </p>
          </div>
          <ArrowDownCircle className="h-8 w-8 text-red-500" />
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Saldo do Mês</p>
            <p className={`text-2xl font-bold ${
              monthlyTotals.balance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(monthlyTotals.balance)}
            </p>
          </div>
          {monthlyTotals.balance >= 0 ? (
            <TrendingUp className="h-8 w-8 text-green-500" />
          ) : (
            <TrendingDown className="h-8 w-8 text-red-500" />
          )}
        </div>
      </div>
    </div>
  );
}
