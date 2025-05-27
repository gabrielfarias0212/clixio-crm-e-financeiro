
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFinancialProjections } from "@/hooks/useFinancialProjections";
import { CalendarDays, TrendingUp, AlertTriangle, RefreshCw, Clock, DollarSign } from "lucide-react";
import { useState } from "react";

export function FutureProjections() {
  const { projections, paymentAlerts, loading, summary, refreshProjections } = useFinancialProjections();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshProjections();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getAlertColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'text-red-600 bg-red-50 border-red-200';
      case 'due_soon': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com botão de atualizar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">Projeções de Recebimentos</h2>
          <p className="text-sm text-gray-600">Previsão de entradas para os próximos meses</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              Receita Garantida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.totalGuaranteed)}
            </div>
            <p className="text-sm text-gray-500">Pagamentos agendados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Receita Provável
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary.totalProbable)}
            </div>
            <p className="text-sm text-gray-500">Contratos fechados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-purple-500" />
              Receita Potencial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(summary.totalPotential)}
            </div>
            <p className="text-sm text-gray-500">Orçamentos pendentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Pagamentos */}
      {paymentAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alertas de Pagamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentAlerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${getAlertColor(alert.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{alert.clientName}</h4>
                      <p className="text-sm opacity-75">{alert.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(alert.amount)}</div>
                      <div className="text-sm opacity-75">
                        {alert.daysUntilDue < 0 
                          ? `${Math.abs(alert.daysUntilDue)} dias em atraso`
                          : alert.daysUntilDue === 0 
                          ? 'Vence hoje'
                          : `${alert.daysUntilDue} dias`
                        }
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {paymentAlerts.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  E mais {paymentAlerts.length - 5} alertas...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projeções Mensais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Projeções por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projections.map((projection, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium capitalize">
                    {projection.month} {projection.year}
                  </h3>
                  <div className="font-bold text-lg">
                    {formatCurrency(projection.total)}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-green-600 font-medium">
                      {formatCurrency(projection.guaranteed)}
                    </div>
                    <div className="text-gray-500">Garantido</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-600 font-medium">
                      {formatCurrency(projection.probable)}
                    </div>
                    <div className="text-gray-500">Provável</div>
                  </div>
                  <div className="text-center">
                    <div className="text-purple-600 font-medium">
                      {formatCurrency(projection.potential)}
                    </div>
                    <div className="text-gray-500">Potencial</div>
                  </div>
                </div>

                {/* Barra de progresso visual */}
                <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="h-full flex">
                    <div 
                      className="bg-green-500" 
                      style={{ width: `${(projection.guaranteed / projection.total) * 100}%` }}
                    />
                    <div 
                      className="bg-blue-500" 
                      style={{ width: `${(projection.probable / projection.total) * 100}%` }}
                    />
                    <div 
                      className="bg-purple-500" 
                      style={{ width: `${(projection.potential / projection.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {projections.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma projeção disponível no momento</p>
              <p className="text-sm">Adicione clientes com datas futuras para ver as projeções</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
