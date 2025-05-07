
import { useClients } from "@/contexts/ClientsContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { startOfYear, endOfYear, isWithinInterval } from "date-fns";
import { FileCheck, TrendingUp, BarChart, PieChart } from "lucide-react";
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Indicadores de Desempenho do Negócio ({currentYear})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center text-muted-foreground">
              <FileCheck className="h-5 w-5 mr-2 text-blue-500" />
              <span>Contratos Ativos no Ano</span>
            </div>
            <p className="text-2xl font-bold">{metrics.activeContracts}</p>
          </div>

          <div className="flex flex-col space-y-2">
            <div className="flex items-center text-muted-foreground">
              <BarChart className="h-5 w-5 mr-2 text-green-500" />
              <span>Média de Faturamento Mensal</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(metrics.averageMonthlyRevenue)}</p>
          </div>

          <div className="flex flex-col space-y-2">
            <div className="flex items-center text-muted-foreground">
              <TrendingUp className="h-5 w-5 mr-2 text-orange-500" />
              <span>Taxa de Conversão</span>
            </div>
            <p className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</p>
          </div>

          <div className="flex flex-col space-y-2">
            <div className="flex items-center text-muted-foreground">
              <PieChart className="h-5 w-5 mr-2 text-purple-500" />
              <span>Lucro Líquido</span>
            </div>
            <p className={`text-2xl font-bold ${metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(metrics.netProfit)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
