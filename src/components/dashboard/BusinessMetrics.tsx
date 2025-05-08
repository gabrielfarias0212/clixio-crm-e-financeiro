
import { useClients } from "@/contexts/ClientsContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { Card } from "@/components/ui/card";
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
      currency: 'BRL'
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
            
            <div className="pt-4 border-t">
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
              <div className="p-4 border rounded-md">
                <p className="text-sm text-muted-foreground">Total de Leads</p>
                <p className="text-2xl font-bold">{metrics.totalLeadsData.length}</p>
              </div>
              
              <div className="p-4 border rounded-md">
                <p className="text-sm text-muted-foreground">Contratos Fechados</p>
                <p className="text-2xl font-bold">{metrics.closedContractsData.length}</p>
              </div>
            </div>
            
            <div className="pt-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500" 
                  style={{ width: `${metrics.conversionRate.toFixed(1)}%` }}
                ></div>
              </div>
              <p className="mt-2 text-center font-medium">
                Taxa de Conversão: {metrics.conversionRate.toFixed(1)}%
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
              <div className="p-4 border rounded-md">
                <p className="text-sm text-muted-foreground">Receitas</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalRevenue)}</p>
              </div>
              
              <div className="p-4 border rounded-md">
                <p className="text-sm text-muted-foreground">Despesas</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(metrics.totalExpenses)}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Lucro Líquido:</span>
                <span className={`font-bold text-xl ${metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(metrics.netProfit)}
                </span>
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
    <div>
      <h2 className="text-lg font-semibold mb-4">Indicadores de Desempenho do Negócio ({currentYear})</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Contratos Ativos */}
        <Card 
          className="shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handleCardClick('contracts')}
        >
          <div className="p-6">
            <div className="flex flex-col h-full">
              <div className="flex items-center text-muted-foreground mb-3">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2.5 mr-3">
                  <FileCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-sm font-medium">Contratos Ativos no Ano</h3>
              </div>
              <div className="mt-2">
                <p className="text-3xl sm:text-4xl font-bold">{metrics.activeContracts}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Card 2: Média Faturamento */}
        <Card 
          className="shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handleCardClick('revenue')}
        >
          <div className="p-6">
            <div className="flex flex-col h-full">
              <div className="flex items-center text-muted-foreground mb-3">
                <div className="rounded-full bg-green-100 dark:bg-green-900 p-2.5 mr-3">
                  <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-sm font-medium">Média de Faturamento Mensal</h3>
              </div>
              <div className="mt-2">
                <p className="text-3xl sm:text-4xl font-bold text-green-600 dark:text-green-400 truncate">
                  {formatCurrency(metrics.averageMonthlyRevenue)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Card 3: Taxa de Conversão */}
        <Card 
          className="shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handleCardClick('conversion')}
        >
          <div className="p-6">
            <div className="flex flex-col h-full">
              <div className="flex items-center text-muted-foreground mb-3">
                <div className="rounded-full bg-orange-100 dark:bg-orange-900 p-2.5 mr-3">
                  <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-sm font-medium">Taxa de Conversão</h3>
              </div>
              <div className="mt-2">
                <p className="text-3xl sm:text-4xl font-bold text-orange-600 dark:text-orange-400">
                  {metrics.conversionRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Card 4: Lucro Líquido */}
        <Card 
          className="shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handleCardClick('profit')}
        >
          <div className="p-6">
            <div className="flex flex-col h-full">
              <div className="flex items-center text-muted-foreground mb-3">
                <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-2.5 mr-3">
                  <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-sm font-medium">Lucro Líquido</h3>
              </div>
              <div className="mt-2">
                <p className={`text-3xl sm:text-4xl font-bold truncate ${metrics.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(metrics.netProfit)}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal for detailed information */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {dialogContent}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
