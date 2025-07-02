
import { useState, useEffect, useCallback } from "react";
import { createPersonalTransaction, deletePersonalTransaction } from "@/utils/supabase/personal-transactions";
import { createTransaction, deleteTransaction, fetchTransactions } from "@/utils/supabase/transactions";
import { Transaction } from "@/utils/types";
import { useTransactions } from "@/contexts/TransactionsContext";

export interface ProLaboreMonthData {
  monthKey: string;
  monthName: string;
  monthlyIncomes: number;
  monthlyExpenses: number;
  monthlyBalance: number;
  totalProLabore: number;
  alreadyWithdrawn: number;
  availableAmount: number;
  canWithdraw: boolean;
  records: ProLaboreRecord[];
}

export interface ProLaboreRecord {
  id: string;
  monthKey: string;
  amount: number;
  withdrawn: boolean;
  date: string;
  personalTransactionId?: string;
  businessTransactionId?: string;
}

export function useProLaboreHistory() {
  const [proLaboreRecords, setProLaboreRecords] = useState<ProLaboreRecord[]>([]);
  const { transactions } = useTransactions();
  
  // Carregar registros do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('proLaboreRecords');
    if (saved) {
      try {
        const oldRecords = JSON.parse(saved);
        const migratedRecords = oldRecords.map((record: any, index: number) => ({
          id: record.id || `migrated-${index}`,
          monthKey: record.weekKey ? convertWeekKeyToMonthKey(record.weekKey) : record.monthKey,
          amount: record.amount,
          withdrawn: record.withdrawn,
          date: record.date,
          personalTransactionId: record.personalTransactionId,
          businessTransactionId: record.businessTransactionId
        }));
        setProLaboreRecords(migratedRecords);
      } catch (error) {
        console.error('Erro ao carregar registros de pró-labore:', error);
        setProLaboreRecords([]);
      }
    }
  }, []);

  // Converter chave semanal para mensal (migração)
  const convertWeekKeyToMonthKey = (weekKey: string): string => {
    try {
      const date = new Date(weekKey);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } catch {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
  };

  // Salvar registros no localStorage
  const saveRecords = useCallback((records: ProLaboreRecord[]) => {
    localStorage.setItem('proLaboreRecords', JSON.stringify(records));
    setProLaboreRecords(records);
  }, []);

  // Gerar dados dos últimos 12 meses
  const getMonthsData = useCallback((): ProLaboreMonthData[] => {
    const monthsData: ProLaboreMonthData[] = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
      const monthName = targetDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      
      // Calcular entradas e saídas do mês
      const monthIncomes = transactions
        .filter(transaction => {
          if (transaction.type !== "entrada") return false;
          
          let transactionDate: Date;
          try {
            if (transaction.date.includes('/')) {
              const [day, month, year] = transaction.date.split('/').map(Number);
              transactionDate = new Date(year, month - 1, day);
            } else {
              transactionDate = new Date(transaction.date);
            }
            
            if (isNaN(transactionDate.getTime())) return false;
          } catch {
            return false;
          }

          return transactionDate.getMonth() === targetDate.getMonth() && 
                 transactionDate.getFullYear() === targetDate.getFullYear();
        })
        .reduce((total, transaction) => total + Number(transaction.amount), 0);

      const monthExpenses = transactions
        .filter(transaction => {
          if (transaction.type !== "saída") return false;
          
          let transactionDate: Date;
          try {
            if (transaction.date.includes('/')) {
              const [day, month, year] = transaction.date.split('/').map(Number);
              transactionDate = new Date(year, month - 1, day);
            } else {
              transactionDate = new Date(transaction.date);
            }
            
            if (isNaN(transactionDate.getTime())) return false;
          } catch {
            return false;
          }

          return transactionDate.getMonth() === targetDate.getMonth() && 
                 transactionDate.getFullYear() === targetDate.getFullYear();
        })
        .reduce((total, transaction) => total + Number(transaction.amount), 0);

      const monthlyBalance = monthIncomes - monthExpenses;
      const totalProLabore = monthlyBalance > 0 ? monthlyBalance * 0.25 : 0;
      
      // Calcular quanto já foi retirado
      const monthRecords = proLaboreRecords.filter(record => record.monthKey === monthKey && record.withdrawn);
      const alreadyWithdrawn = monthRecords.reduce((total, record) => total + record.amount, 0);
      const availableAmount = Math.max(0, totalProLabore - alreadyWithdrawn);
      const canWithdraw = availableAmount > 0 && monthlyBalance > 0;

      monthsData.push({
        monthKey,
        monthName,
        monthlyIncomes: monthIncomes,
        monthlyExpenses: monthExpenses,
        monthlyBalance,
        totalProLabore,
        alreadyWithdrawn,
        availableAmount,
        canWithdraw,
        records: monthRecords
      });
    }
    
    return monthsData;
  }, [transactions, proLaboreRecords]);

  // Função para sacar pró-labore de um mês específico
  const withdrawProLaboreForMonth = useCallback(async (monthKey: string, amount: number) => {
    const monthsData = getMonthsData();
    const monthData = monthsData.find(m => m.monthKey === monthKey);
    
    if (!monthData || !monthData.canWithdraw || amount <= 0 || amount > monthData.availableAmount) {
      return false;
    }

    try {
      // 1. Criar transação empresarial de saída
      const businessTransactionData: Omit<Transaction, 'id' | 'createdAt'> = {
        amount: amount,
        date: new Date().toISOString().split('T')[0],
        type: 'saída',
        category: 'pró-labore',
        description: `Retirada de pró-labore do mês ${monthData.monthName} - ${monthKey}`,
      };

      const businessTransaction = await createTransaction(businessTransactionData);
      
      if (!businessTransaction) {
        throw new Error('Falha ao criar transação empresarial');
      }

      // 2. Criar transação pessoal de entrada
      const personalTransaction = await createPersonalTransaction(
        'entrada',
        amount,
        `Pró-labore de ${monthData.monthName}`,
        'pró-labore',
        monthKey
      );

      // 3. Salvar registro local
      const newRecord: ProLaboreRecord = {
        id: `${monthKey}-${Date.now()}`,
        monthKey: monthKey,
        amount: amount,
        withdrawn: true,
        date: new Date().toISOString(),
        personalTransactionId: personalTransaction.id,
        businessTransactionId: businessTransaction.id
      };

      const updatedRecords = [...proLaboreRecords, newRecord];
      saveRecords(updatedRecords);

      console.log(`Pró-labore de R$ ${amount.toFixed(2)} do mês ${monthData.monthName} processado com sucesso`);
      
      return true;
    } catch (error) {
      console.error('Erro ao retirar pró-labore:', error);
      return false;
    }
  }, [getMonthsData, proLaboreRecords, saveRecords]);

  // Função para devolver pró-labore
  const returnProLabore = useCallback(async (recordId: string) => {
    console.log('🔄 === INICIANDO DEVOLUÇÃO DE PRÓ-LABORE ===');
    console.log('📋 Record ID:', recordId);
    
    const recordToReturn = proLaboreRecords.find(record => record.id === recordId);
    
    if (!recordToReturn) {
      console.error('❌ Registro não encontrado:', recordId);
      return false;
    }

    if (!recordToReturn.withdrawn) {
      console.error('❌ Registro não foi retirado:', recordToReturn);
      return false;
    }

    try {
      // Tentar remover transação empresarial
      if (recordToReturn.businessTransactionId) {
        try {
          await deleteTransaction(recordToReturn.businessTransactionId);
          console.log(`✅ Transação empresarial removida: ${recordToReturn.businessTransactionId}`);
        } catch (error) {
          console.warn('⚠️ Erro ao remover transação empresarial:', error);
        }
      }

      // Tentar remover transação pessoal
      if (recordToReturn.personalTransactionId) {
        try {
          await deletePersonalTransaction(recordToReturn.personalTransactionId);
          console.log(`✅ Transação pessoal removida: ${recordToReturn.personalTransactionId}`);
        } catch (error) {
          console.warn('⚠️ Erro ao remover transação pessoal:', error);
        }
      }

      // Remover o registro do localStorage
      const updatedRecords = proLaboreRecords.filter(record => record.id !== recordId);
      saveRecords(updatedRecords);
      console.log('✅ Registro removido do localStorage');
      
      return true;
    } catch (error) {
      console.error('❌ === ERRO CRÍTICO NA DEVOLUÇÃO ===');
      console.error('💥 Erro:', error);
      return false;
    }
  }, [proLaboreRecords, saveRecords]);

  return {
    getMonthsData,
    withdrawProLaboreForMonth,
    returnProLabore
  };
}
