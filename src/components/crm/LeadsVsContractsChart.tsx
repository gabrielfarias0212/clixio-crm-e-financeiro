import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Client } from "@/utils/types";
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, TrendingUp } from "lucide-react";

interface LeadsVsContractsChartProps {
  clients: Client[];
}

type PeriodFilter = "6months" | "12months" | "24months" | "all";

export function LeadsVsContractsChart({ clients }: LeadsVsContractsChartProps) {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("12months");

  const chartData = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (periodFilter) {
      case "6months":
        startDate = subMonths(now, 6);
        break;
      case "12months":
        startDate = subMonths(now, 12);
        break;
      case "24months":
        startDate = subMonths(now, 24);
        break;
      default:
        startDate = new Date(2020, 0, 1); // Início arbitrário para "all"
    }

    // Filtrar clientes no período
    const filteredClients = clients.filter(client => {
      const clientDate = parseISO(client.createdAt);
      return isWithinInterval(clientDate, { start: startDate, end: now });
    });

    // Agrupar por mês
    const monthlyData = new Map<string, { leads: number; contracts: number; month: string }>();

    filteredClients.forEach(client => {
      const clientDate = parseISO(client.createdAt);
      const monthKey = format(clientDate, "yyyy-MM");
      const monthLabel = format(clientDate, "MMM yyyy", { locale: ptBR });

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { leads: 0, contracts: 0, month: monthLabel });
      }

      const data = monthlyData.get(monthKey)!;
      
      // Incrementar leads (todos os clientes são considerados leads inicialmente)
      data.leads++;
      
      // Incrementar contratos fechados
      if (client.status === "fechado" || client.status === "projeto_finalizado") {
        data.contracts++;
      }
    });

    // Converter para array e ordenar por data
    return Array.from(monthlyData.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([_, data]) => data);
  }, [clients, periodFilter]);

  const totalStats = useMemo(() => {
    const totals = chartData.reduce(
      (acc, month) => ({
        totalLeads: acc.totalLeads + month.leads,
        totalContracts: acc.totalContracts + month.contracts,
      }),
      { totalLeads: 0, totalContracts: 0 }
    );

    const conversionRate = totals.totalLeads > 0 
      ? ((totals.totalContracts / totals.totalLeads) * 100).toFixed(1)
      : "0";

    return { ...totals, conversionRate };
  }, [chartData]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho com filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Leads vs Contratos Fechados
              </CardTitle>
              <CardDescription>
                Análise mensal de leads recebidos e contratos fechados
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <Select value={periodFilter} onValueChange={(value: PeriodFilter) => setPeriodFilter(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6months">Últimos 6 meses</SelectItem>
                    <SelectItem value="12months">Últimos 12 meses</SelectItem>
                    <SelectItem value="24months">Últimos 24 meses</SelectItem>
                    <SelectItem value="all">Todos os períodos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Estatísticas resumidas */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {totalStats.totalLeads}
              </div>
              <div className="text-sm text-muted-foreground">Total de Leads</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {totalStats.totalContracts}
              </div>
              <div className="text-sm text-muted-foreground">Contratos Fechados</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {totalStats.conversionRate}%
              </div>
              <div className="text-sm text-muted-foreground">Taxa de Conversão</div>
            </div>
          </div>

          {/* Gráfico */}
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value, name) => [
                    value,
                    name === 'leads' ? 'Leads' : 'Contratos Fechados'
                  ]}
                />
                <Legend 
                  formatter={(value) => value === 'leads' ? 'Leads' : 'Contratos Fechados'}
                />
                <Bar 
                  dataKey="leads" 
                  fill="#3b82f6" 
                  name="leads"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="contracts" 
                  fill="#22c55e" 
                  name="contracts"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {chartData.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum dado encontrado para o período selecionado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}