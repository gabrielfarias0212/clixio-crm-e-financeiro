
import { useEffect, useState, useCallback } from "react";
import { useTransactions } from "@/contexts/TransactionsContext";

export function useFinancialData() {
  const { transactions, loading: transactionsLoading } = useTransactions();
  const [loading, setLoading] = useState(true);
  const [monthlyTotals, setMonthlyTotals] = useState({
    income: 0,
    expenses: 0,
    balance: 0
  });
  const [hasCalculated, setHasCalculated] = useState(false);
  
  // Calculate all financial data
  const calculateFinancialData = useCallback(() => {
    console.log("=== Iniciando cálculo financeiro ===");
    console.log("Total de transações:", transactions.length);
    
    if (transactions.length === 0) {
      console.log("Nenhuma transação encontrada");
      setMonthlyTotals({ income: 0, expenses: 0, balance: 0 });
      setLoading(false);
      setHasCalculated(true);
      return;
    }
    
    try {
      // Get current month and year
      const now = new Date();
      const currentMonth = now.getMonth(); // 0-11
      const currentYear = now.getFullYear();
      
      console.log(`Mês atual: ${currentMonth + 1}/${currentYear}`);
      
      // Filter transactions for current month
      const currentMonthTransactions = transactions.filter((transaction) => {
        try {
          if (!transaction.date) {
            console.log("Transação sem data:", transaction.id);
            return false;
          }
          
          // Parse date - expecting DD/MM/YYYY format or ISO format
          let transactionDate: Date;
          
          if (transaction.date.includes('/')) {
            // DD/MM/YYYY format
            const [day, month, year] = transaction.date.split('/').map(Number);
            transactionDate = new Date(year, month - 1, day); // month is 0-indexed
          } else {
            // ISO format or other
            transactionDate = new Date(transaction.date);
          }
          
          if (isNaN(transactionDate.getTime())) {
            console.log("Data inválida:", transaction.date, "para transação:", transaction.id);
            return false;
          }
          
          const transactionMonth = transactionDate.getMonth();
          const transactionYear = transactionDate.getFullYear();
          
          const isCurrentMonth = transactionMonth === currentMonth && transactionYear === currentYear;
          
          console.log(`Transação ${transaction.id}: ${transaction.date} -> ${transactionDate.toLocaleDateString()} - É do mês atual: ${isCurrentMonth}`);
          
          return isCurrentMonth;
        } catch (err) {
          console.error("Erro ao processar data da transação:", transaction.date, err);
          return false;
        }
      });

      console.log(`Transações do mês atual: ${currentMonthTransactions.length}`);
      
      // Log each transaction for debugging
      currentMonthTransactions.forEach(t => {
        console.log(`- ${t.type}: R$ ${t.amount} - ${t.description} (${t.date})`);
      });

      // Calculate monthly totals
      let totalIncome = 0;
      let totalExpenses = 0;
      
      currentMonthTransactions.forEach((transaction) => {
        const amount = Number(transaction.amount);
        
        if (isNaN(amount)) {
          console.log("Valor inválido para transação:", transaction.id, transaction.amount);
          return;
        }
        
        if (transaction.type === "entrada") {
          totalIncome += amount;
          console.log(`Entrada adicionada: R$ ${amount} (Total: R$ ${totalIncome})`);
        } else if (transaction.type === "saída") {
          totalExpenses += amount;
          console.log(`Saída adicionada: R$ ${amount} (Total: R$ ${totalExpenses})`);
        }
      });
      
      const balance = totalIncome - totalExpenses;
      
      console.log("=== Resultado Final ===");
      console.log(`Entradas: R$ ${totalIncome}`);
      console.log(`Saídas: R$ ${totalExpenses}`);
      console.log(`Saldo: R$ ${balance}`);
      
      setMonthlyTotals({
        income: totalIncome,
        expenses: totalExpenses,
        balance: balance
      });
      
    } catch (err) {
      console.error("Erro no cálculo financeiro:", err);
      setMonthlyTotals({ income: 0, expenses: 0, balance: 0 });
    } finally {
      setLoading(false);
      setHasCalculated(true);
    }
  }, [transactions]);

  // Effect to calculate data when transactions change
  useEffect(() => {
    if (!transactionsLoading) {
      setLoading(true);
      calculateFinancialData();
    }
  }, [transactions, calculateFinancialData, transactionsLoading]);

  return { 
    monthlyTotals,
    loading: loading || transactionsLoading,
    hasCalculated
  };
}
