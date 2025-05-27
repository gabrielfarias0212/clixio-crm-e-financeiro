
import { useEffect, useState } from "react";
import { Transaction } from "@/utils/types";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownCircle, ArrowUpCircle, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionSummaryProps {
  transactions: Transaction[];
  className?: string;
}

export function TransactionSummary({
  transactions,
  className
}: TransactionSummaryProps) {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    thisMonthIncome: 0,
    thisMonthExpenses: 0,
    thisMonthBalance: 0
  });

  useEffect(() => {
    console.log("=== TransactionSummary: Calculando resumo ===");
    console.log("Total de transações recebidas:", transactions.length);
    
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const currentYear = now.getFullYear();
    
    console.log(`Mês/Ano atual: ${currentMonth + 1}/${currentYear}`);

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
          // DD/MM/YYYY format
          const [day, month, year] = transaction.date.split('/').map(Number);
          transactionDate = new Date(year, month - 1, day);
        } else {
          // ISO format
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

      const transactionMonth = transactionDate.getMonth();
      const transactionYear = transactionDate.getFullYear();
      const isCurrentMonth = transactionMonth === currentMonth && transactionYear === currentYear;

      if (transaction.type === "entrada") {
        acc.totalIncome += amount;
        if (isCurrentMonth) {
          acc.thisMonthIncome += amount;
          console.log(`Entrada do mês: R$ ${amount} (Total mês: R$ ${acc.thisMonthIncome})`);
        }
      } else if (transaction.type === "saída") {
        acc.totalExpenses += amount;
        if (isCurrentMonth) {
          acc.thisMonthExpenses += amount;
          console.log(`Saída do mês: R$ ${amount} (Total mês: R$ ${acc.thisMonthExpenses})`);
        }
      }
      
      return acc;
    }, {
      totalIncome: 0,
      totalExpenses: 0,
      thisMonthIncome: 0,
      thisMonthExpenses: 0
    });

    const newSummary = {
      ...totals,
      balance: totals.totalIncome - totals.totalExpenses,
      thisMonthBalance: totals.thisMonthIncome - totals.thisMonthExpenses
    };
    
    console.log("=== Resumo Final ===");
    console.log("Total entradas:", totals.totalIncome);
    console.log("Total saídas:", totals.totalExpenses);
    console.log("Entradas do mês:", totals.thisMonthIncome);
    console.log("Saídas do mês:", totals.thisMonthExpenses);
    console.log("Saldo do mês:", newSummary.thisMonthBalance);
    
    setSummary(newSummary);
  }, [transactions]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

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
              <h3 className="text-sm font-medium text-gray-500">Saldo do Mês Atual</h3>
              <div className="flex items-center">
                {summary.thisMonthBalance >= 0 ? <TrendingUp className="h-5 w-5 mr-2 text-green-500" /> : <TrendingDown className="h-5 w-5 mr-2 text-red-500" />}
                <span className={`text-xl font-bold ${summary.thisMonthBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(summary.thisMonthBalance)}
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
              Mês atual: {formatCurrency(summary.thisMonthIncome)}
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
              Mês atual: {formatCurrency(summary.thisMonthExpenses)}
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
            <div className={`text-sm ${summary.thisMonthBalance >= 0 ? "text-green-500" : "text-red-500"}`}>
              {summary.thisMonthBalance >= 0 ? "+" : ""}
              {formatCurrency(summary.thisMonthBalance)} no mês atual
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
