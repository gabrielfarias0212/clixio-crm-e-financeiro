
import { useClients } from "@/contexts/ClientsContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { startOfYear, endOfYear, isWithinInterval } from "date-fns";
import { FileCheck, TrendingUp, DollarSign, BarChart3 } from "lucide-react";
import { useMemo, useState } from "react";
import { stringToDate } from "@/utils/dateUtils";
import { Client } from "@/utils/types";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { 
  LineChart, 
  Line, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip 
} from "recharts";
import { Separator } from "@/components/ui/separator";

export function BusinessMetrics() {
  const { clients } = useClients();
  const { transactions } = useTransactions();
  const currentYear = new Date().getFullYear();
  const yearStart = startOfYear(new Date());
  const yearEnd = endOfYear(new Date());

  // Modal state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogContent, setDialogContent] = useState<React.ReactNode | null>(null);

  // Calculate metrics using useMemo to avoid recalculations on every render
  const metrics = useMemo(() => {
    // 1. Total de contratos ativos no ano (exclude delivered/"pago" status)
    const activeContractsData = clients.filter(client => {
      if (!(client.status === "em andamento" || client.status === "fechado")) return false;
      if (!client.createdAt) return false;
      
      const createdAt = stringToDate(client.createdAt);
      return createdAt && isWithinInterval(createdAt, { start: yearStart, end: yearEnd });
    });
    
    const activeContracts = activeContractsData.length;

    // 2. Média de faturamento mensal
    const monthlyRevenueData = Array(12).fill(0);
    let totalRevenue = 0;

    // Agrupar transações por mês
    const monthlyTransactions = transactions
      .filter(t => {
        if (t.type !== "entrada") return false;
        if (!t.date) return false;
        
        const transactionDate = stringToDate(t.date);
        return transactionDate && isWithinInterval(transactionDate, { start: yearStart, end: yearEnd });
      });
      
    monthlyTransactions.forEach(t => {
      if (!t.date) return;
      
      const transactionDate = stringToDate(t.date);
      if (!transactionDate) return;
      
      const month = transactionDate.getMonth();
      const amount = Number(t.amount);
      
      if (!isNaN(amount)) {
        monthlyRevenueData[month] += amount;
        totalRevenue += amount;
      }
    });

    // Preparar dados para o mini gráfico de linha
    const chartData = monthlyRevenueData.map((value, index) => ({
      month: index + 1,
      value
    }));

    // Calcular média considerando apenas os meses que já passaram
    const currentMonth = new Date().getMonth();
    const monthsElapsed = currentMonth + 1; // +1 porque os meses são indexados de 0
    const averageMonthlyRevenue = monthsElapsed > 0 ? totalRevenue / monthsElapsed : 0;

    // 3. Taxa de conversão de leads em contratos
    const totalLeadsData = clients.filter(client => {
      if (!client.createdAt) return false;
      
      const createdAt = stringToDate(client.createdAt);
      return createdAt && isWithinInterval(createdAt, { start: yearStart, end: yearEnd });
    });
    
    const totalLeads = totalLeadsData.length;
    
    const closedContractsData = clients.filter(client => {
      if (!(client.status === "fechado" || client.status === "em andamento" || client.status === "pago")) return false;
      if (!client.createdAt) return false;
      
      const createdAt = stringToDate(client.createdAt);
      return createdAt && isWithinInterval(createdAt, { start: yearStart, end: yearEnd });
    });
    
    const closedContracts = closedContractsData.length;
    const conversionRate = totalLeads > 0 ? (closedContracts / totalLeads) * 100 : 0;

    // 4. Lucro líquido (Entradas - Saídas)
    const totalExpensesData = transactions
      .filter(t => {
        if (t.type !== "saída") return false;
        if (!t.date) return false;
        
        const transactionDate = stringToDate(t.date);
        return transactionDate && isWithinInterval(transactionDate, { start: yearStart, end: yearEnd });
      });
      
    const totalExpenses = totalExpensesData.reduce((sum, t) => {
      const amount = Number(t.amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const netProfit = totalRevenue - totalExpenses;

    return {
      activeContracts,
      activeContractsData,
      averageMonthlyRevenue,
      monthlyRevenueData,
      monthlyTransactions,
      chartData,
      conversionRate,
      totalLeadsData,
      closedContractsData,
      netProfit,
      totalRevenue,
      totalExpenses,
      totalExpensesData
    };
  }, [clients, transactions, yearStart, yearEnd]);

  // Formatação de valores monetários em BRL
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Handle card clicks to show detailed information
  const handleCardClick = (type: 'contracts' | 'revenue' | 'conversion' | 'profit') => {
    let title = "";
    let content: React.ReactNode = null;

    switch (type) {
      case 'contracts':
        title = `Contratos Ativos no Ano (${currentYear})`;
        content = (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Total de contratos ativos iniciados este ano que ainda não foram entregues.
            </p>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {metrics.activeContractsData.length > 0 ? (
                  metrics.activeContractsData.map((client: Client) => (
                    <div key={client.id} className="p-3 border rounded-md">
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">Status: {client.status}</p>
                      {client.contractValue && (
                        <p className="text-sm">Valor: {formatCurrency(client.contractValue)}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p>Nenhum contrato ativo no período.</p>
                )}
              </div>
            </ScrollArea>
          </div>
        );
        break;
        
      case 'revenue':
        title = `Média de Faturamento Mensal (${currentYear})`;
        
        // Extract non-zero revenue months for better display
        const revenueMonths = metrics.monthlyRevenueData
          .map((amount, index) => ({ month: index, amount }))
          .filter(item => item.amount > 0);
          
        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        
        content = (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Média mensal calculada com base nos meses já transcorridos do ano.
            </p>
            
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.chartData}>
                  <XAxis dataKey="month" />
                  <YAxis hide />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Faturamento']}
                    labelFormatter={(label) => `Mês ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    dot={{ stroke: '#22c55e', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#22c55e', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-3">
              <p className="font-medium">Faturamento por mês:</p>
              <div className="space-y-2">
                {revenueMonths.length > 0 ? (
                  revenueMonths.map(({month, amount}) => (
                    <div key={month} className="flex justify-between items-center">
                      <span>{monthNames[month]}</span>
                      <span className="font-medium">{formatCurrency(amount)}</span>
                    </div>
                  ))
                ) : (
                  <p>Nenhum faturamento registrado no período.</p>
                )}
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="pt-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total do Ano:</span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(metrics.totalRevenue)}
                </span>
              </div>
            </div>
          </div>
        );
        break;
        
      case 'conversion':
        title = `Taxa de Conversão (${currentYear})`;
        content = (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Porcentagem de leads que foram convertidos em contratos fechados.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-md text-center">
                <p className="text-sm text-muted-foreground">Total de Leads</p>
                <p className="text-2xl font-bold">{metrics.totalLeadsData.length}</p>
              </div>
              
              <div className="p-4 border rounded-md text-center">
                <p className="text-sm text-muted-foreground">Contratos Fechados</p>
                <p className="text-2xl font-bold">{metrics.closedContractsData.length}</p>
              </div>
            </div>
            
            <div className="pt-4">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500" 
                  style={{ width: `${Math.min(metrics.conversionRate, 100).toFixed(1)}%` }}
                ></div>
              </div>
              <p className="mt-2 text-center font-medium">
                Taxa de Conversão: {metrics.conversionRate.toFixed(1)}%
              </p>
            </div>
            
            <Separator className="my-4" />
            
            <div>
              <p className="text-sm text-muted-foreground">
                Uma taxa de conversão saudável para fotógrafos de casamento está entre 30-50%. 
                {metrics.conversionRate >= 30 
                  ? " Sua taxa de conversão está dentro ou acima do esperado."
                  : " Considere revisar sua estratégia de vendas para melhorar este indicador."
                }
              </p>
            </div>
          </div>
        );
        break;
        
      case 'profit':
        title = `Lucro Líquido (${currentYear})`;
        content = (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Diferença entre receitas e despesas no período.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-md text-center">
                <p className="text-sm text-muted-foreground">Receitas</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-500">{formatCurrency(metrics.totalRevenue)}</p>
              </div>
              
              <div className="p-4 border rounded-md text-center">
                <p className="text-sm text-muted-foreground">Despesas</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-500">{formatCurrency(metrics.totalExpenses)}</p>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="pt-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Lucro Líquido:</span>
                <span className={`font-bold text-xl ${metrics.netProfit >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                  {formatCurrency(metrics.netProfit)}
                </span>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  {metrics.netProfit >= 0 
                    ? "Seu negócio está gerando lucro. Considere reinvestir ou planejar crescimento."
                    : "Atenção: Suas despesas estão superando as receitas. Revise seus gastos e estratégias de precificação."
                  }
                </p>
              </div>
            </div>
          </div>
        );
        break;
    }

    setDialogTitle(title);
    setDialogContent(content);
    setIsDialogOpen(true);
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-200">
        Indicadores de Desempenho do Negócio ({currentYear})
      </h2>
      
      <Card className="overflow-hidden border-0 shadow-md bg-white dark:bg-slate-900">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-2">
          <CardTitle className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Métricas principais
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Contratos Ativos */}
            <div 
              className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm transition-all hover:shadow-md cursor-pointer group"
              onClick={() => handleCardClick('contracts')}
            >
              <div className="px-5 py-5">
                <div className="flex items-center mb-4">
                  <div className="rounded-full bg-blue-50 dark:bg-blue-950 p-2.5 mr-3">
                    <FileCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Contratos Ativos no Ano</p>
                </div>
                <div className="pl-2">
                  <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                    {metrics.activeContracts}
                  </p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </div>
            </div>

            {/* Média de Faturamento */}
            <div 
              className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm transition-all hover:shadow-md cursor-pointer group"
              onClick={() => handleCardClick('revenue')}
            >
              <div className="px-5 py-5">
                <div className="flex items-center mb-4">
                  <div className="rounded-full bg-green-50 dark:bg-green-950 p-2.5 mr-3">
                    <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Faturamento Mensal Médio</p>
                </div>
                <div className="pl-2">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(metrics.averageMonthlyRevenue)}
                  </p>
                  <div className="h-12 mt-2">
                    {metrics.chartData.some(item => item.value > 0) && (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={metrics.chartData}>
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#22c55e" 
                            strokeWidth={1.5}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </div>
            </div>

            {/* Taxa de Conversão */}
            <div 
              className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm transition-all hover:shadow-md cursor-pointer group"
              onClick={() => handleCardClick('conversion')}
            >
              <div className="px-5 py-5">
                <div className="flex items-center mb-4">
                  <div className="rounded-full bg-orange-50 dark:bg-orange-950 p-2.5 mr-3">
                    <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Taxa de Conversão</p>
                </div>
                <div className="pl-2">
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {metrics.conversionRate.toFixed(1)}%
                  </p>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full mt-3 overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${Math.min(metrics.conversionRate, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </div>
            </div>

            {/* Lucro Líquido */}
            <div 
              className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm transition-all hover:shadow-md cursor-pointer group"
              onClick={() => handleCardClick('profit')}
            >
              <div className="px-5 py-5">
                <div className="flex items-center mb-4">
                  <div className="rounded-full bg-purple-50 dark:bg-purple-950 p-2.5 mr-3">
                    <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Lucro Líquido</p>
                </div>
                <div className="pl-2">
                  <p className={`text-3xl font-bold ${
                    metrics.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatCurrency(metrics.netProfit)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Receitas vs Despesas
                  </p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal para exibição de informações detalhadas */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{dialogTitle}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {dialogContent}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
