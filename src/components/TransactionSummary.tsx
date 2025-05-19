
import { useEffect, useState, useMemo } from "react";
import { Transaction } from "@/utils/types";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownCircle, ArrowUpCircle, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { stringToDate } from '@/utils/dateUtils';

interface TransactionSummaryProps {
  transactions: Transaction[];
  className?: string;
}

export function TransactionSummary({ transactions, className }: TransactionSummaryProps) {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    thisMonthIncome: 0,
    thisMonthExpenses: 0,
    thisMonthBalance: 0
  });

  // Memoized calculation to improve performance
  const calculatedSummary = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions.reduce(
      (acc, transaction) => {
        const amount = Number(transaction.amount) || 0;
        
        // Check if transaction is from the current month
        let isCurrentMonth = false;
        
        try {
          if (transaction.date) {
            const transactionDate = stringToDate(transaction.date);
            if (transactionDate) {
              isCurrentMonth = 
                transactionDate.getMonth() === currentMonth && 
                transactionDate.getFullYear() === currentYear;
            }
          }
        } catch (err) {
          console.error("Error parsing date:", transaction.date, err);
        }
        
        if (transaction.type === "entrada") {
          acc.totalIncome += amount;
          if (isCurrentMonth) {
            acc.thisMonthIncome += amount;
          }
        } else {
          acc.totalExpenses += amount;
          if (isCurrentMonth) {
            acc.thisMonthExpenses += amount;
          }
        }
        
        return acc;
      },
      { 
        totalIncome: 0, 
        totalExpenses: 0, 
        thisMonthIncome: 0, 
        thisMonthExpenses: 0 
      }
    );
  }, [transactions]);
  
  // Update summary when calculated values change
  useEffect(() => {
    setSummary({
      ...calculatedSummary,
      balance: calculatedSummary.totalIncome - calculatedSummary.totalExpenses,
      thisMonthBalance: calculatedSummary.thisMonthIncome - calculatedSummary.thisMonthExpenses
    });
  }, [calculatedSummary]);

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
                <span 
                  className={`text-xl font-bold ${
                    summary.balance >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(summary.balance)}
                </span>
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-500">Saldo do Mês Atual</h3>
              <div className="flex items-center">
                {summary.thisMonthBalance >= 0 ? (
                  <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 mr-2 text-red-500" />
                )}
                <span 
                  className={`text-xl font-bold ${
                    summary.thisMonthBalance >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
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
              <span className="text-lg font-medium text-red-600">
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
              <span 
                className={`text-lg font-medium ${
                  summary.balance >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(summary.balance)}
              </span>
            </div>
            <div 
              className={`text-sm ${
                summary.thisMonthBalance >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {summary.thisMonthBalance >= 0 ? "+" : ""}
              {formatCurrency(summary.thisMonthBalance)} no mês atual
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
