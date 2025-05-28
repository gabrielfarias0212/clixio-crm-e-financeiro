
import React, { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFinancialProjections } from "@/hooks/useFinancialProjections";
import { CalendarDays, TrendingUp, AlertTriangle, RefreshCw, Clock, DollarSign, Info } from "lucide-react";

// Componente memoizado para cards de resumo
const SummaryCard = React.memo(({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  colorClass 
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}) => {
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
          <Icon className={`h-4 w-4 ${colorClass}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${colorClass.replace('text-', 'text-').replace('-500', '-600')}`}>
          {formatCurrency(value)}
        </div>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </CardContent>
    </Card>
  );
});

// Componente memoizado para alertas
const PaymentAlert = React.memo(({ 
  alert, 
  getAlertColor, 
  formatCurrency 
}: {
  alert: any;
  getAlertColor: (status: string) => string;
  formatCurrency: (value: number) => string;
}) => (
  <div className={`p-3 rounded-lg border ${getAlertColor(alert.status)}`}>
    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-medium">{alert.clientName}</h4>
        <p className="text-sm opacity-75">{alert.description}</p>
        <p className="text-xs opacity-60">Vencimento: {alert.dueDate}</p>
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
));

// Componente memoizado para projeção mensal
const MonthlyProjectionCard = React.memo(({ 
  projection, 
  formatCurrency 
}: {
  projection: any;
  formatCurrency: (value: number) => string;
}) => (
  <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-medium capitalize text-lg">
        {projection.month} {projection.year}
      </h3>
      <div className="text-right">
        <div className="font-bold text-xl">
          {formatCurrency(projection.total)}
        </div>
        <div className="text-sm text-gray-500">Total previsto</div>
      </div>
    </div>
    
    <div className="grid grid-cols-3 gap-4 text-sm mb-3">
      <div className="text-center p-3 bg-green-50 rounded-lg">
        <div className="text-green-600 font-bold text-lg">
          {formatCurrency(projection.guaranteed)}
        </div>
        <div className="text-gray-600 text-xs">Garantido</div>
      </div>
      <div className="text-center p-3 bg-blue-50 rounded-lg">
        <div className="text-blue-600 font-bold text-lg">
          {formatCurrency(projection.probable)}
        </div>
        <div className="text-gray-600 text-xs">Provável</div>
      </div>
      <div className="text-center p-3 bg-purple-50 rounded-lg">
        <div className="text-purple-600 font-bold text-lg">
          {formatCurrency(projection.potential)}
        </div>
        <div className="text-gray-600 text-xs">Potencial</div>
      </div>
    </div>

    {projection.total > 0 && (
      <div className="mt-3 bg-gray-200 rounded-full h-3 overflow-hidden">
        <div className="h-full flex">
          <div 
            className="bg-green-500 transition-all duration-300" 
            style={{ width: `${(projection.guaranteed / projection.total) * 100}%` }}
            title={`Garantido: ${formatCurrency(projection.guaranteed)}`}
          />
          <div 
            className="bg-blue-500 transition-all duration-300" 
            style={{ width: `${(projection.probable / projection.total) * 100}%` }}
            title={`Provável: ${formatCurrency(projection.probable)}`}
          />
          <div 
            className="bg-purple-500 transition-all duration-300" 
            style={{ width: `${(projection.potential / projection.total) * 100}%` }}
            title={`Potencial: ${formatCurrency(projection.potential)}`}
          />
        </div>
      </div>
    )}
  </div>
));

export function FutureProjections() {
  const { projections, paymentAlerts, loading, summary, refreshProjections } = useFinancialProjections();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Memoizar funções auxiliares
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }, []);

  const getAlertColor = useCallback((status: string) => {
    switch (status) {
      case 'overdue': return 'text-red-600 bg-red-50 border-red-200';
      case 'due_soon': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshProjections();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, [refreshProjections]);

  // Memoizar alertas limitados
  const limitedAlerts = useMemo(() => 
    paymentAlerts.slice(0, 5), 
    [paymentAlerts]
  );

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

      {/* Legenda explicativa */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">Como funcionam as projeções:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="font-medium text-green-700">Garantido:</span> Pagamentos agendados com data de vencimento específica
                </div>
                <div>
                  <span className="font-medium text-blue-700">Provável:</span> Valores pendentes de contratos fechados, projetados para o mês do evento
                </div>
                <div>
                  <span className="font-medium text-purple-700">Potencial:</span> 30% dos valores de orçamentos em negociação
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Receita Garantida"
          value={summary.totalGuaranteed}
          subtitle="Pagamentos agendados"
          icon={DollarSign}
          colorClass="text-green-500"
        />
        <SummaryCard
          title="Receita Provável"
          value={summary.totalProbable}
          subtitle="Contratos fechados"
          icon={TrendingUp}
          colorClass="text-blue-500"
        />
        <SummaryCard
          title="Receita Potencial"
          value={summary.totalPotential}
          subtitle="Orçamentos pendentes"
          icon={CalendarDays}
          colorClass="text-purple-500"
        />
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
              {limitedAlerts.map((alert) => (
                <PaymentAlert
                  key={alert.id}
                  alert={alert}
                  getAlertColor={getAlertColor}
                  formatCurrency={formatCurrency}
                />
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
          <CardTitle className="text-lg">Projeções Detalhadas por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projections.map((projection, index) => (
              <MonthlyProjectionCard
                key={`${projection.month}-${projection.year}`}
                projection={projection}
                formatCurrency={formatCurrency}
              />
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
