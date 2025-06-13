

import { useEffect, useState } from "react";
import { Transaction } from "@/utils/types";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownCircle, ArrowUpCircle, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { isTransactionInWeek, WeekInfo } from "@/utils/dates/weekUtils";
import { PeriodType } from "@/hooks/useWeeklyFilter";

interface TransactionSummaryProps {
  transactions: Transaction[];
  className?: string;
  periodType?: PeriodType;
  currentWeek?: WeekInfo;
  onWeeklyBalanceChange?: (balance: number) => void;
}

export function TransactionSummary({
  transactions,
  className,
  periodType = "monthly",
  currentWeek,
  onWeeklyBalanceChange
}: TransactionSummaryProps) {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    periodIncome: 0,
    periodExpenses: 0,
    periodBalance: 0
  });

  useEffect(() => {
    console.log(`=== TransactionSummary: Calculando resumo (${periodType}) ===`);
    console.log("Total de transações recebidas:", transactions.length);
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const totals = transactions.reduce((acc, transaction) => {
      const amount = Number(transaction.amount);
      
      if (isNaN(amount)) {
        console.log("Valor inválido:", transaction.amount, "para transação:", transaction.id);
        return acc;
      }

      // Parse transaction date
      let transactionDate: Date;
      try {
        if (transaction.date.includes('/')) {
          const [day, month, year] = transaction.date.split('/').map(Number);
          transactionDate = new Date(year, month - 1, day);
        } else {
          transactionDate = new Date(transaction.date);
        }
        
        if (isNaN(transactionDate.getTime())) {
          console.log("Data inválida:", transaction.date);
          return acc;
        }
      } catch (err) {
        console.log("Erro ao processar data:", transaction.date, err);
        return acc;
      }

      // Determinar se a transação está no período atual
      let isInCurrentPeriod = false;
      
      if (periodType === "monthly") {
        const transactionMonth = transactionDate.getMonth();
        const transactionYear = transactionDate.getFullYear();
        isInCurrentPeriod = transactionMonth === currentMonth && transactionYear === currentYear;
      } else if (periodType === "weekly" && currentWeek) {
        isInCurrentPeriod = isTransactionInWeek(transaction.date, currentWeek);
      }

      if (transaction.type === "entrada") {
        acc.totalIncome += amount;
        if (isInCurrentPeriod) {
          acc.periodIncome += amount;
        }
      } else if (transaction.type === "saída") {
        acc.totalExpenses += amount;
        if (isInCurrentPeriod) {
          acc.periodExpenses += amount;
        }
      }
      
      return acc;
    }, {
      totalIncome: 0,
      totalExpenses: 0,
      periodIncome: 0,
      periodExpenses: 0
    });

    const newSummary = {
      ...totals,
      balance: totals.totalIncome - totals.totalExpenses,
      periodBalance: totals.periodIncome - totals.periodExpenses
    };
    
    console.log("=== Resumo Final ===");
    console.log("Total entradas:", totals.totalIncome);
    console.log("Total saídas:", totals.totalExpenses);
    console.log(`${periodType === "monthly" ? "Mês" : "Semana"} - Entradas:`, totals.periodIncome);
    console.log(`${periodType === "monthly" ? "Mês" : "Semana"} - Saídas:`, totals.periodExpenses);
    console.log(`Saldo do ${periodType === "monthly" ? "mês" : "semana"}:`, newSummary.periodBalance);
    
    setSummary(newSummary);
    
    // Notificar o componente pai sobre mudanças no saldo semanal
    if (periodType === "weekly" && onWeeklyBalanceChange) {
      onWeeklyBalanceChange(newSummary.periodBalance);
    }
  }, [transactions, periodType, currentWeek, onWeeklyBalanceChange]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const periodLabel = periodType === "monthly" ? "Mês Atual" : "Semana Selecionada";

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Balance */}
          <div className="md:col-span-3 flex flex-col sm:flex-row justify-between gap-4 mb-2">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-500">Saldo Geral</h3>
              <div className="flex items-center">
                <Wallet className="h-5 w-5 mr-2 text-gray-700" />
                <span className={`text-xl font-bold ${summary.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(summary.balance)}
                </span>
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-500">Saldo do {periodLabel}</h3>
              <div className="flex items-center">
                {summary.periodBalance >= 0 ? <TrendingUp className="h-5 w-5 mr-2 text-green-500" /> : <TrendingDown className="h-5 w-5 mr-2 text-red-500" />}
                <span className={`text-xl font-bold ${summary.periodBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(summary.periodBalance)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Total Income */}
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-gray-500">Total de Entradas</h3>
            <div className="flex items-center">
              <ArrowUpCircle className="h-5 w-5 mr-2 text-green-500" />
              <span className="text-lg font-medium text-green-600">
                {formatCurrency(summary.totalIncome)}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {periodLabel}: {formatCurrency(summary.periodIncome)}
            </div>
          </div>
          
          {/* Total Expenses */}
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-gray-500">Total de Saídas</h3>
            <div className="flex items-center">
              <ArrowDownCircle className="h-5 w-5 mr-2 text-red-500" />
              <span className="text-red-600 text-lg font-extrabold">
                {formatCurrency(summary.totalExpenses)}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {periodLabel}: {formatCurrency(summary.periodExpenses)}
            </div>
          </div>
          
          {/* Balance */}
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-gray-500">Saldo Total</h3>
            <div className="flex items-center">
              <Wallet className="h-5 w-5 mr-2 text-gray-700" />
              <span className={`text-lg font-medium ${summary.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(summary.balance)}
              </span>
            </div>
            <div className={`text-sm ${summary.periodBalance >= 0 ? "text-green-500" : "text-red-500"}`}>
              {summary.periodBalance >= 0 ? "+" : ""}
              {formatCurrency(summary.periodBalance)} no {periodType === "monthly" ? "mês atual" : "período"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

