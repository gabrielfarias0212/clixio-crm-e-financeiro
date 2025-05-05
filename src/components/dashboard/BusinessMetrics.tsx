
import { useClients } from "@/contexts/ClientsContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { startOfYear, endOfYear, isWithinInterval } from "date-fns";
import { FileCheck, TrendingUp, BarChart, PieChart } from "lucide-react";

export function BusinessMetrics() {
  const { clients } = useClients();
  const { transactions } = useTransactions();
  const currentYear = new Date().getFullYear();
  const yearStart = startOfYear(new Date());
  const yearEnd = endOfYear(new Date());

  // 1. Total de contratos ativos no ano (exclude delivered/"pago" status)
  const activeContracts = clients.filter(client => 
    (client.status === "em andamento" || client.status === "fechado") &&
    client.createdAt && isWithinInterval(new Date(client.createdAt), { start: yearStart, end: yearEnd })
  ).length;

  // 2. Média de faturamento mensal
  const monthlyRevenueData = Array(12).fill(0);
  let totalRevenue = 0;

  // Agrupar transações por mês
  transactions
    .filter(t => 
      t.type === "entrada" && 
      t.date && isWithinInterval(new Date(t.date), { start: yearStart, end: yearEnd })
    )
    .forEach(t => {
      const month = new Date(t.date).getMonth();
      monthlyRevenueData[month] += Number(t.amount);
      totalRevenue += Number(t.amount);
    });

  // Calcular média considerando apenas os meses que já passaram
  const currentMonth = new Date().getMonth();
  const monthsElapsed = currentMonth + 1; // +1 porque os meses são indexados de 0
  const averageMonthlyRevenue = monthsElapsed > 0 ? totalRevenue / monthsElapsed : 0;

  // 3. Taxa de conversão de leads em contratos
  const totalLeads = clients.filter(client => 
    client.createdAt && isWithinInterval(new Date(client.createdAt), { start: yearStart, end: yearEnd })
  ).length;
  
  const closedContracts = clients.filter(client => 
    (client.status === "fechado" || client.status === "em andamento" || client.status === "pago") &&
    client.createdAt && isWithinInterval(new Date(client.createdAt), { start: yearStart, end: yearEnd })
  ).length;
  
  const conversionRate = totalLeads > 0 ? (closedContracts / totalLeads) * 100 : 0;

  // 4. Lucro líquido (Entradas - Saídas)
  const totalExpenses = transactions
    .filter(t => 
      t.type === "saída" && 
      t.date && isWithinInterval(new Date(t.date), { start: yearStart, end: yearEnd })
    )
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const netProfit = totalRevenue - totalExpenses;

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
            <p className="text-2xl font-bold">{activeContracts}</p>
          </div>

          <div className="flex flex-col space-y-2">
            <div className="flex items-center text-muted-foreground">
              <BarChart className="h-5 w-5 mr-2 text-green-500" />
              <span>Média de Faturamento Mensal</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(averageMonthlyRevenue)}</p>
          </div>

          <div className="flex flex-col space-y-2">
            <div className="flex items-center text-muted-foreground">
              <TrendingUp className="h-5 w-5 mr-2 text-orange-500" />
              <span>Taxa de Conversão</span>
            </div>
            <p className="text-2xl font-bold">{conversionRate.toFixed(1)}%</p>
          </div>

          <div className="flex flex-col space-y-2">
            <div className="flex items-center text-muted-foreground">
              <PieChart className="h-5 w-5 mr-2 text-purple-500" />
              <span>Lucro Líquido</span>
            </div>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netProfit)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
