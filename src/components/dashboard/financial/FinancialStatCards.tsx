
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "./ChartConstants";

interface FinancialStatCardsProps {
  monthlyTotals: {
    income: number;
    expenses: number;
    balance: number;
  };
}

export function FinancialStatCards({ monthlyTotals }: FinancialStatCardsProps) {
  return (
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
  );
}
