
import { useEffect, useState, useCallback, useMemo } from "react";
import { useTransactions } from "@/contexts/TransactionsContext";
import { useDespesasEmpresa } from "@/hooks/useDespesasEmpresa";

interface FinancialCache {
  data: {
    income: number;
    expenses: number;
    balance: number;
  };
  timestamp: number;
  signature: string;
}

// Cache com TTL de 2 minutos
const CACHE_TTL = 2 * 60 * 1000;
let financialCache: FinancialCache | null = null;

export function useFinancialData() {
  const { transactions, loading: transactionsLoading } = useTransactions();
  const despesasFin = useDespesasEmpresa();
  const [loading, setLoading] = useState(true);
  const [monthlyTotals, setMonthlyTotals] = useState({
    income: 0,
    expenses: 0,
    balance: 0
  });
  const [hasCalculated, setHasCalculated] = useState(false);

  // Memoizar dados de entrada
  const transactionsData = useMemo(() => transactions, [transactions]);

  // Assinatura do conteúdo (não só a quantidade): editar valor/data/tipo invalida o cache
  const signature = useMemo(
    () => transactionsData.map(t => `${t.id}|${t.amount}|${t.type}|${t.date}`).join(";"),
    [transactionsData]
  );

  // Função otimizada para verificar cache
  const getCachedData = useCallback(() => {
    if (financialCache && 
        Date.now() - financialCache.timestamp < CACHE_TTL &&
        financialCache.signature === signature) {
      return financialCache;
    }
    return null;
  }, [signature]);

  // Memoizar data atual do mês para evitar recálculos
  const currentMonthInfo = useMemo(() => {
    const now = new Date();
    return {
      month: now.getMonth(),
      year: now.getFullYear()
    };
  }, []);

  // Função otimizada de parse de data
  const parseTransactionDate = useCallback((dateString: string): Date | null => {
    if (!dateString) return null;
    
    try {
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/').map(Number);
        return new Date(year, month - 1, day);
      } else {
        return new Date(dateString);
      }
    } catch {
      return null;
    }
  }, []);

  // Filtrar transações do mês atual otimizado
  const currentMonthTransactions = useMemo(() => {
    return transactionsData.filter(transaction => {
      const transactionDate = parseTransactionDate(transaction.date);
      if (!transactionDate || isNaN(transactionDate.getTime())) {
        return false;
      }
      
      return transactionDate.getMonth() === currentMonthInfo.month && 
             transactionDate.getFullYear() === currentMonthInfo.year;
    });
  }, [transactionsData, currentMonthInfo, parseTransactionDate]);

  // Calcular totais otimizado
  const calculateFinancialData = useCallback(() => {
    console.log("=== Iniciando cálculo financeiro otimizado ===");
    
    // Verificar cache primeiro
    const cached = getCachedData();
    if (cached) {
      console.log("Usando dados financeiros do cache");
      setMonthlyTotals(cached.data);
      setLoading(false);
      setHasCalculated(true);
      return;
    }

    if (transactionsData.length === 0) {
      const emptyData = { income: 0, expenses: 0, balance: 0 };
      setMonthlyTotals(emptyData);
      setLoading(false);
      setHasCalculated(true);
      return;
    }
    
    try {
      console.log(`Processando ${currentMonthTransactions.length} transações do mês atual`);
      
      // Usar reduce para calcular em uma única passada
      const totals = currentMonthTransactions.reduce((acc, transaction) => {
        const amount = Number(transaction.amount);
        
        if (isNaN(amount)) return acc;
        
        if (transaction.type === "entrada") {
          acc.income += amount;
        } else if (transaction.type === "saída") {
          acc.expenses += amount;
        }
        
        return acc;
      }, { income: 0, expenses: 0 });
      
      const balance = totals.income - totals.expenses;
      
      const result = {
        income: totals.income,
        expenses: totals.expenses,
        balance: balance
      };

      console.log(`Resultado: Entradas R$ ${result.income}, Saídas R$ ${result.expenses}, Saldo R$ ${result.balance}`);
      
      // Cache do resultado
      financialCache = {
        data: result,
        timestamp: Date.now(),
        signature
      };

      setMonthlyTotals(result);
      
    } catch (err) {
      console.error("Erro no cálculo financeiro:", err);
      setMonthlyTotals({ income: 0, expenses: 0, balance: 0 });
    } finally {
      setLoading(false);
      setHasCalculated(true);
    }
  }, [transactionsData.length, currentMonthTransactions, getCachedData, signature]);

  // Effect otimizado
  useEffect(() => {
    if (!transactionsLoading) {
      setLoading(true);
      // Usar setTimeout para não bloquear a UI
      const timeoutId = setTimeout(() => {
        calculateFinancialData();
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [calculateFinancialData, transactionsLoading]);

  // Soma as despesas da empresa lançadas no módulo Finanças (cartão e conta PJ).
  const totaisComFinancas = useMemo(() => ({
    income: monthlyTotals.income,
    expenses: monthlyTotals.expenses + despesasFin.doMes,
    balance: monthlyTotals.balance - despesasFin.doMes,
    // bruto = despesas sem descontar estornos/créditos do cartão; o líquido (expenses) é o que entra no saldo
    expensesBruto: monthlyTotals.expenses + despesasFin.doMesBruto,
  }), [monthlyTotals, despesasFin.doMes, despesasFin.doMesBruto]);

  return { 
    monthlyTotals: totaisComFinancas,
    loading: loading || transactionsLoading,
    hasCalculated
  };
}
