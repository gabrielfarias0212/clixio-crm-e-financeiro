
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Target, Wallet } from 'lucide-react';
import { useCashFlowData } from '@/hooks/useCashFlowData';
import { CashFlowChart } from './CashFlowChart';
import { ExpenseCategoriesChart } from './ExpenseCategoriesChart';
import { UpcomingPayments } from './UpcomingPayments';
import { MonthlyGoalProgress } from './MonthlyGoalProgress';
import { FinancialSettings } from './FinancialSettings';

export function CashFlowDashboard() {
  const { cashFlowData, loading } = useCashFlowData();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Saldo Geral */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600"></div>
          <CardContent className="relative p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Saldo Geral</p>
                <p className="text-2xl font-bold">{formatCurrency(cashFlowData.generalBalance)}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <Wallet className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Saldo do Mês */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Saldo do Mês</p>
                <p className="text-2xl font-bold">{formatCurrency(cashFlowData.monthlyBalance)}</p>
                <div className="flex items-center mt-1">
                  {cashFlowData.monthlyGrowth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    cashFlowData.monthlyGrowth >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {Math.abs(cashFlowData.monthlyGrowth)}%
                  </span>
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total de Entradas */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Entradas do Mês</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(cashFlowData.monthlyIncome)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total: {formatCurrency(cashFlowData.totalIncome)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total de Saídas */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Saídas do Mês</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(cashFlowData.monthlyExpenses)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total: {formatCurrency(cashFlowData.totalExpenses)}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Entradas Futuras */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Entradas Futuras</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(cashFlowData.futureIncome)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {cashFlowData.upcomingPayments.length} pagamentos pendentes
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pró-labore */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Pró-labore</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(cashFlowData.prolabore)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Baseado na entrada mensal
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meta Mensal Progress */}
        <div className="md:col-span-2">
          <MonthlyGoalProgress progress={cashFlowData.monthlyGoalProgress} />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashFlowChart data={cashFlowData.balanceProjection} />
        <ExpenseCategoriesChart data={cashFlowData.expenseCategories} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingPayments payments={cashFlowData.upcomingPayments} />
        <FinancialSettings />
      </div>
    </div>
  );
}
