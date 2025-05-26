
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "./ChartConstants";
import { useAdvancedFinancialData } from "@/hooks/useAdvancedFinancialData";

export function FinancialStatCards() {
  const { metrics } = useAdvancedFinancialData();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      {/* Entradas do Mês */}
      <div className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200">
        <ArrowUpCircle className="h-8 w-8 text-green-600 mr-3" />
        <div>
          <p className="text-sm font-medium text-green-800">Entradas do Mês</p>
          <p className="text-lg font-bold text-green-900">
            {formatCurrency(metrics.currentMonthIncome)}
          </p>
        </div>
      </div>

      {/* Saídas do Mês */}
      <div className="flex items-center p-4 bg-red-50 rounded-lg border border-red-200">
        <ArrowDownCircle className="h-8 w-8 text-red-600 mr-3" />
        <div>
          <p className="text-sm font-medium text-red-800">Saídas do Mês</p>
          <p className="text-lg font-bold text-red-900">
            {formatCurrency(metrics.currentMonthExpenses)}
          </p>
        </div>
      </div>

      {/* Saldo do Mês */}
      <div className={`flex items-center p-4 rounded-lg border ${
        metrics.currentMonthBalance >= 0 
          ? 'bg-blue-50 border-blue-200' 
          : 'bg-orange-50 border-orange-200'
      }`}>
        {metrics.currentMonthBalance >= 0 ? (
          <TrendingUp className="h-8 w-8 text-blue-600 mr-3" />
        ) : (
          <TrendingDown className="h-8 w-8 text-orange-600 mr-3" />
        )}
        <div>
          <p className={`text-sm font-medium ${
            metrics.currentMonthBalance >= 0 ? 'text-blue-800' : 'text-orange-800'
          }`}>
            Saldo do Mês
          </p>
          <p className={`text-lg font-bold ${
            metrics.currentMonthBalance >= 0 ? 'text-blue-900' : 'text-orange-900'
          }`}>
            {formatCurrency(metrics.currentMonthBalance)}
          </p>
        </div>
      </div>
    </div>
  );
}
