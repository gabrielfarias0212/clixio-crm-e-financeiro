
import { formatDate } from '@/utils/dates';
import React from "react";
import { Client } from "@/utils/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface MetricsDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: React.ReactNode;
}

export function MetricsDetailDialog({
  isOpen,
  onOpenChange,
  title,
  content,
}: MetricsDetailDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[calc(90vh-10rem)]">
          <div className="py-4">{content}</div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// Helper functions utilizados nos detalhes
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Componentes para os diferentes tipos de detalhes
export function ContractsDetailContent({ 
  clients
}: { 
  clients: Client[] 
}) {
  // Agrupar contratos por status para o gráfico de pizza
  const statusGroups = clients.reduce((acc: Record<string, number>, client) => {
    const status = client.status || "desconhecido";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(statusGroups).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Total de <span className="font-medium">{clients.length}</span> contratos ativos iniciados este ano.
      </p>
      
      {clients.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de pizza por status */}
          <Card>
            <CardContent className="pt-6">
              <CardDescription className="mb-4">Distribuição por status</CardDescription>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value} contratos`, 'Quantidade']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de valores de contratos */}
          <Card>
            <CardContent className="pt-6">
              <CardDescription className="mb-4">Valores de contrato</CardDescription>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={clients
                      .filter(client => client.contractValue)
                      .map(client => ({
                        name: client.name,
                        value: client.contractValue || 0
                      }))
                      .sort((a, b) => b.value - a.value)
                      .slice(0, 5)} 
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 'dataMax']} tickFormatter={formatCurrency} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => [formatCurrency(value), 'Valor']} />
                    <Bar dataKey="value" fill="#8884d8" barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Separator className="my-4" />

      <Card>
        <CardContent className="pt-6">
          <CardDescription className="mb-2">Lista de contratos</CardDescription>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {clients.length > 0 ? (
                clients.map((client: Client) => (
                  <div key={client.id} className="p-3 border rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-muted-foreground">Status: {client.status}</p>
                        {client.weddingDate && (
                          <p className="text-sm text-muted-foreground">Data: {formatDate(client.weddingDate)}</p>
                        )}
                      </div>
                      {client.contractValue && (
                        <p className="text-sm font-bold">{formatCurrency(client.contractValue)}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p>Nenhum contrato ativo no período.</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

export function RevenueDetailContent({ 
  chartData, 
  revenueMonths, 
  totalRevenue 
}: { 
  chartData: Array<{month: number, value: number}>, 
  revenueMonths: Array<{month: number, amount: number}>,
  totalRevenue: number
}) {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const enhancedChartData = chartData.map(item => ({
    ...item,
    name: monthNames[item.month - 1]
  }));
  
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Média mensal calculada com base nos meses já transcorridos do ano.
      </p>
      
      <Card>
        <CardContent className="pt-6">
          <CardDescription className="mb-2">Evolução do faturamento mensal</CardDescription>
          <div className="h-64">
            <ChartContainer 
              config={{
                revenue: {
                  label: "Faturamento",
                  theme: {
                    light: "#22c55e",
                    dark: "#4ade80"
                  }
                }
              }}
            >
              <BarChart
                data={enhancedChartData}
                margin={{ top: 5, right: 5, left: 5, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  tick={{fontSize: 12}}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip
                  content={({active, payload}) => {
                    if (active && payload && payload.length) {
                      return (
                        <ChartTooltipContent
                          nameKey="name"
                          payload={payload}
                          labelFormatter={(label) => label}
                          formatter={(value: number, name) => {
                            return [formatCurrency(value), 'Faturamento'];
                          }}
                        />
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  name="revenue"
                  dataKey="value" 
                  fill="var(--color-revenue)" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <CardDescription className="mb-2">Detalhamento por mês</CardDescription>
          <div className="space-y-3">
            {revenueMonths.length > 0 ? (
              revenueMonths.map(({month, amount}) => (
                <div key={month} className="flex justify-between items-center p-3 border rounded-md">
                  <span>{monthNames[month]}</span>
                  <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(amount)}</span>
                </div>
              ))
            ) : (
              <p>Nenhum faturamento registrado no período.</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Separator className="my-4" />
      
      <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total do Ano:</span>
          <span className="font-bold text-xl text-green-600 dark:text-green-400">
            {formatCurrency(totalRevenue)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ConversionDetailContent({
  totalLeads,
  closedContracts,
  conversionRate
}: {
  totalLeads: number,
  closedContracts: number,
  conversionRate: number
}) {
  const funnelData = [
    {
      name: "Leads",
      value: totalLeads,
      fill: "#94a3b8"
    },
    {
      name: "Contratos",
      value: closedContracts,
      fill: "#fb923c"
    }
  ];

  // Dados para gráfico circular de conversão
  const donutData = [
    { name: "Convertidos", value: closedContracts },
    { name: "Não convertidos", value: totalLeads - closedContracts }
  ];

  const COLORS = ["#fb923c", "#e2e8f0"];

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Porcentagem de leads que foram convertidos em contratos fechados.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <CardDescription className="mb-2">Visão geral</CardDescription>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 text-center">
                <p className="text-sm text-muted-foreground">Total de Leads</p>
                <p className="text-3xl font-bold">{totalLeads}</p>
              </div>
              
              <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-center">
                <p className="text-sm text-muted-foreground">Contratos Fechados</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{closedContracts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <CardDescription className="mb-2">Taxa de conversão</CardDescription>
            <div className="flex flex-col items-center">
              <div className="relative flex items-center justify-center w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#fb923c"
                    strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 45 * conversionRate / 100} ${2 * Math.PI * 45 * (1 - conversionRate / 100)}`}
                    strokeDashoffset={2 * Math.PI * 45 * 0.25}
                  />
                </svg>
                <span className="absolute text-2xl font-bold">{conversionRate.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <CardDescription className="mb-2">Análise de conversão</CardDescription>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [value, 'Quantidade']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Separator className="my-4" />
      
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border">
        <p className="text-sm">
          <span className="font-medium">Análise:</span> Uma taxa de conversão saudável para fotógrafos de casamento está entre 30-50%. 
          {conversionRate >= 30 
            ? <span className="text-green-600 dark:text-green-400"> Sua taxa de conversão está dentro ou acima do esperado.</span>
            : <span className="text-orange-600 dark:text-orange-400"> Considere revisar sua estratégia de vendas para melhorar este indicador.</span>
          }
        </p>
      </div>
    </div>
  );
}

export function ProfitDetailContent({
  totalRevenue,
  totalExpenses,
  netProfit
}: {
  totalRevenue: number,
  totalExpenses: number,
  netProfit: number
}) {
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  
  const barData = [
    { name: "Receitas", value: totalRevenue, fill: "#22c55e" },
    { name: "Despesas", value: totalExpenses, fill: "#ef4444" }
  ];
  
  const pieData = [
    { name: "Despesas", value: totalExpenses, fill: "#ef4444" },
    { name: "Lucro Líquido", value: netProfit > 0 ? netProfit : 0, fill: "#22c55e" }
  ];
  
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Diferença entre receitas e despesas no período, com análise de margem de lucro.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <CardDescription className="mb-2">Receitas vs Despesas</CardDescription>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={barData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                  <Bar dataKey="value" fill="#8884d8">
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <CardDescription className="mb-2">Distribuição de receitas</CardDescription>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="overflow-hidden">
          <div className="h-2 bg-green-500"></div>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Receitas</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-500">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <div className="h-2 bg-red-500"></div>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Despesas</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-500">{formatCurrency(totalExpenses)}</p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <div className={`h-2 ${netProfit >= 0 ? 'bg-purple-500' : 'bg-red-500'}`}></div>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Margem de Lucro</p>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-purple-600 dark:text-purple-500' : 'text-red-600 dark:text-red-500'}`}>
              {profitMargin.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Separator className="my-4" />
      
      <div className={`p-4 rounded-xl ${netProfit >= 0 ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-900' : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900'} border`}>
        <div className="flex justify-between items-center">
          <span className="font-medium">Lucro Líquido:</span>
          <span className={`font-bold text-xl ${netProfit >= 0 ? 'text-purple-600 dark:text-purple-500' : 'text-red-600 dark:text-red-500'}`}>
            {formatCurrency(netProfit)}
          </span>
        </div>
        
        <div className="mt-4">
          <p className="text-sm">
            {netProfit >= 0 
              ? "Seu negócio está gerando lucro. Considere reinvestir ou planejar crescimento."
              : "Atenção: Suas despesas estão superando as receitas. Revise seus gastos e estratégias de precificação."
            }
          </p>
        </div>
      </div>
    </div>
  );
}
