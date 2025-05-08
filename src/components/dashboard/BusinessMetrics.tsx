
import { useClients } from "@/contexts/ClientsContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { startOfYear, endOfYear, isWithinInterval } from "date-fns";
import { FileCheck, TrendingUp, DollarSign, BarChart3 } from "lucide-react";
import { useMemo } from "react";
import { stringToDate } from "@/utils/dateUtils";

export function BusinessMetrics() {
  const { clients } = useClients();
  const { transactions } = useTransactions();
  const currentYear = new Date().getFullYear();
  const yearStart = startOfYear(new Date());
  const yearEnd = endOfYear(new Date());

  // Calculate metrics using useMemo to avoid recalculations on every render
  const metrics = useMemo(() => {
    // 1. Total de contratos ativos no ano (exclude delivered/"pago" status)
    const activeContracts = clients.filter(client => {
      if (!(client.status === "em andamento" || client.status === "fechado")) return false;
      if (!client.createdAt) return false;
      
      const createdAt = stringToDate(client.createdAt);
      return createdAt && isWithinInterval(createdAt, { start: yearStart, end: yearEnd });
    }).length;

    // 2. Média de faturamento mensal
    const monthlyRevenueData = Array(12).fill(0);
    let totalRevenue = 0;

    // Agrupar transações por mês
    transactions
      .filter(t => {
        if (t.type !== "entrada") return false;
        if (!t.date) return false;
        
        const transactionDate = stringToDate(t.date);
        return transactionDate && isWithinInterval(transactionDate, { start: yearStart, end: yearEnd });
      })
      .forEach(t => {
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
    const totalLeads = clients.filter(client => {
      if (!client.createdAt) return false;
      
      const createdAt = stringToDate(client.createdAt);
      return createdAt && isWithinInterval(createdAt, { start: yearStart, end: yearEnd });
    }).length;
    
    const closedContracts = clients.filter(client => {
      if (!(client.status === "fechado" || client.status === "em andamento" || client.status === "pago")) return false;
      if (!client.createdAt) return false;
      
      const createdAt = stringToDate(client.createdAt);
      return createdAt && isWithinInterval(createdAt, { start: yearStart, end: yearEnd });
    }).length;
    
    const conversionRate = totalLeads > 0 ? (closedContracts / totalLeads) * 100 : 0;

    // 4. Lucro líquido (Entradas - Saídas)
    const totalExpenses = transactions
      .filter(t => {
        if (t.type !== "saída") return false;
        if (!t.date) return false;
        
        const transactionDate = stringToDate(t.date);
        return transactionDate && isWithinInterval(transactionDate, { start: yearStart, end: yearEnd });
      })
      .reduce((sum, t) => {
        const amount = Number(t.amount);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
    
    const netProfit = totalRevenue - totalExpenses;

    return {
      activeContracts,
      averageMonthlyRevenue,
      conversionRate,
      netProfit
    };
  }, [clients, transactions, yearStart, yearEnd]);

  // Formatação de valores monetários em BRL
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Indicadores de Desempenho do Negócio ({currentYear})</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Contratos Ativos */}
        <Card className="shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col h-full">
              <div className="flex items-center text-muted-foreground mb-3">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2.5 mr-3">
                  <FileCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-sm font-medium">Contratos Ativos no Ano</h3>
              </div>
              <div className="mt-2">
                <p className="text-3xl font-bold">{metrics.activeContracts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Média Faturamento */}
        <Card className="shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col h-full">
              <div className="flex items-center text-muted-foreground mb-3">
                <div className="rounded-full bg-green-100 dark:bg-green-900 p-2.5 mr-3">
                  <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-sm font-medium">Média de Faturamento Mensal</h3>
              </div>
              <div className="mt-2">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(metrics.averageMonthlyRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Taxa de Conversão */}
        <Card className="shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col h-full">
              <div className="flex items-center text-muted-foreground mb-3">
                <div className="rounded-full bg-orange-100 dark:bg-orange-900 p-2.5 mr-3">
                  <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-sm font-medium">Taxa de Conversão</h3>
              </div>
              <div className="mt-2">
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {metrics.conversionRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Lucro Líquido */}
        <Card className="shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col h-full">
              <div className="flex items-center text-muted-foreground mb-3">
                <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-2.5 mr-3">
                  <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-sm font-medium">Lucro Líquido</h3>
              </div>
              <div className="mt-2">
                <p className={`text-3xl font-bold ${metrics.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(metrics.netProfit)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
