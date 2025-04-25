
import { useTransactions } from "@/contexts/TransactionsContext";
import { Transaction } from "@/utils/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownCircle, ArrowUpCircle, TrendingDown, TrendingUp } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useState } from "react";

const COLORS = ["#9b87f5", "#ea384c"];

export function FinancialSummary() {
  const { transactions } = useTransactions();
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");

  // Get current month's transactions
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);

  const currentMonthTransactions = transactions.filter(
    (t) => {
      const date = new Date(t.date);
      return date >= currentMonthStart && date <= currentMonthEnd;
    }
  );

  const monthlyTotals = {
    income: currentMonthTransactions
      .filter((t) => t.type === "entrada")
      .reduce((sum, t) => sum + Number(t.amount), 0),
    expenses: currentMonthTransactions
      .filter((t) => t.type === "saída")
      .reduce((sum, t) => sum + Number(t.amount), 0),
  };

  const balance = monthlyTotals.income - monthlyTotals.expenses;

  // Prepare last 6 months data for chart
  const monthsData = Array.from({ length: 6 }).map((_, i) => {
    const date = subMonths(now, i);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    const monthTransactions = transactions.filter((t) => {
      const transDate = new Date(t.date);
      return transDate >= monthStart && transDate <= monthEnd;
    });

    const income = monthTransactions
      .filter((t) => t.type === "entrada")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = monthTransactions
      .filter((t) => t.type === "saída")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      month: format(date, "MMM"),
      income,
      expenses,
    };
  }).reverse();

  const pieData = [
    { name: "Entradas", value: monthlyTotals.income },
    { name: "Saídas", value: monthlyTotals.expenses },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Resumo Financeiro do Mês</CardTitle>
          <div className="space-x-2">
            <button
              onClick={() => setChartType("bar")}
              className={`px-2 py-1 rounded ${
                chartType === "bar"
                  ? "bg-primary text-white"
                  : "bg-gray-100"
              }`}
            >
              Barras
            </button>
            <button
              onClick={() => setChartType("pie")}
              className={`px-2 py-1 rounded ${
                chartType === "pie"
                  ? "bg-primary text-white"
                  : "bg-gray-100"
              }`}
            >
              Pizza
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Entradas</p>
            <div className="flex items-center">
              <ArrowUpCircle className="h-4 w-4 mr-2 text-green-500" />
              <span className="text-xl font-bold text-green-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(monthlyTotals.income)}
              </span>
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Saídas</p>
            <div className="flex items-center">
              <ArrowDownCircle className="h-4 w-4 mr-2 text-red-500" />
              <span className="text-xl font-bold text-red-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(monthlyTotals.expenses)}
              </span>
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Saldo</p>
            <div className="flex items-center">
              {balance >= 0 ? (
                <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-2 text-red-500" />
              )}
              <span 
                className={`text-xl font-bold ${
                  balance >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(balance)}
              </span>
            </div>
          </div>
        </div>

        <div className="h-[200px] mt-4">
          {chartType === "bar" ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthsData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="income" name="Entradas" fill="#9b87f5" />
                <Bar dataKey="expenses" name="Saídas" fill="#ea384c" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => 
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
