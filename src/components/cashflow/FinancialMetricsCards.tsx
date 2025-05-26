
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { FinancialMetrics } from "@/hooks/useAdvancedFinancialData";

interface FinancialMetricsCardsProps {
  metrics: FinancialMetrics;
}

export function FinancialMetricsCards({ metrics }: FinancialMetricsCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Saldo Geral */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Geral</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <span className={metrics.totalBalance >= 0 ? "text-green-600" : "text-red-600"}>
              {formatCurrency(metrics.totalBalance)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Receitas menos despesas totais
          </p>
        </CardContent>
      </Card>

      {/* Saldo do Mês */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo do Mês</CardTitle>
          {metrics.monthlyGrowth >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <span className={metrics.currentMonthBalance >= 0 ? "text-green-600" : "text-red-600"}>
              {formatCurrency(metrics.currentMonthBalance)}
            </span>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant={metrics.monthlyGrowth >= 0 ? "default" : "destructive"}>
              {formatPercentage(metrics.monthlyGrowth)}
            </Badge>
            <p className="text-xs text-muted-foreground">
              vs mês anterior
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Entradas do Mês */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Entradas do Mês</CardTitle>
          <ArrowUpCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(metrics.currentMonthIncome)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Ticket médio: {formatCurrency(metrics.averageTicket)}
          </p>
        </CardContent>
      </Card>

      {/* Saídas do Mês */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saídas do Mês</CardTitle>
          <ArrowDownCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(metrics.currentMonthExpenses)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Despesas operacionais
          </p>
        </CardContent>
      </Card>

      {/* Projeção Trimestral */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Projeção Trimestral</CardTitle>
          <Calendar className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(metrics.projectedQuarterIncome)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Receita estimada próximos 3 meses
          </p>
        </CardContent>
      </Card>

      {/* Pagamentos Pendentes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
          <DollarSign className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {metrics.pendingPayments}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Aguardando recebimento
          </p>
        </CardContent>
      </Card>

      {/* Pagamentos Atrasados */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pagamentos Atrasados</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {metrics.overduePayments}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Requer atenção imediata
          </p>
        </CardContent>
      </Card>

      {/* Margem de Lucro */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Margem do Mês</CardTitle>
          {metrics.currentMonthIncome > 0 && metrics.currentMonthExpenses > 0 ? (
            metrics.currentMonthIncome > metrics.currentMonthExpenses ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )
          ) : (
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.currentMonthIncome > 0 ? (
              <span className={
                ((metrics.currentMonthIncome - metrics.currentMonthExpenses) / metrics.currentMonthIncome) * 100 > 0 
                  ? "text-green-600" 
                  : "text-red-600"
              }>
                {(((metrics.currentMonthIncome - metrics.currentMonthExpenses) / metrics.currentMonthIncome) * 100).toFixed(1)}%
              </span>
            ) : (
              <span className="text-muted-foreground">--</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Lucro líquido sobre receita
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
