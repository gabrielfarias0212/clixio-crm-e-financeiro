
import { useState, useEffect, useCallback } from "react";
import { WeekInfo } from "@/utils/dates/weekUtils";
import { createPersonalTransaction, deletePersonalTransaction } from "@/utils/supabase/personal-transactions";
import { createTransaction, deleteTransaction } from "@/utils/supabase/transactions";
import { Transaction } from "@/utils/types";
import { useTransactions } from "@/contexts/TransactionsContext";

export interface ProLaboreRecord {
  id: string;
  monthKey: string;
  amount: number;
  withdrawn: boolean;
  date: string;
  personalTransactionId?: string;
  businessTransactionId?: string;
}

export function useProLabore(currentWeek: WeekInfo, weeklyBalance: number) {
  const [proLaboreRecords, setProLaboreRecords] = useState<ProLaboreRecord[]>([]);
  const { transactions } = useTransactions();
  
  // Gerar chave única para o mês atual
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  // Carregar registros do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('proLaboreRecords');
    if (saved) {
      try {
        const oldRecords = JSON.parse(saved);
        // Migrar registros antigos (semanais) para novo formato (mensal)
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
      return currentMonthKey;
    }
  };

  // Salvar registros no localStorage
  const saveRecords = useCallback((records: ProLaboreRecord[]) => {
    localStorage.setItem('proLaboreRecords', JSON.stringify(records));
    setProLaboreRecords(records);
  }, []);

  // Calcular entradas do mês atual
  const currentMonthIncomes = useCallback(() => {
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return transactions
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

        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      })
      .reduce((total, transaction) => total + Number(transaction.amount), 0);
  }, [transactions, now]);

  // Calcular saídas do mês atual
  const currentMonthExpenses = useCallback(() => {
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return transactions
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

        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      })
      .reduce((total, transaction) => total + Number(transaction.amount), 0);
  }, [transactions, now]);

  // Calcular total já retirado no mês atual
  const totalWithdrawnThisMonth = useCallback(() => {
    return proLaboreRecords
      .filter(record => record.monthKey === currentMonthKey && record.withdrawn)
      .reduce((total, record) => total + record.amount, 0);
  }, [proLaboreRecords, currentMonthKey]);

  // Calcular valores
  const monthlyIncomes = currentMonthIncomes();
  const monthlyExpenses = currentMonthExpenses();
  const monthlyBalance = monthlyIncomes - monthlyExpenses;
  const totalProLabore = monthlyBalance > 0 ? monthlyBalance * 0.25 : 0; // 25% do saldo positivo
  const alreadyWithdrawn = totalWithdrawnThisMonth();
  const availableAmount = Math.max(0, totalProLabore - alreadyWithdrawn);

  // Verificar se pode retirar (saldo deve ser positivo)
  const canWithdraw = availableAmount > 0 && monthlyBalance > 0;

  // Função para retirar pró-labore (permite múltiplas retiradas)
  const withdrawProLabore = useCallback(async () => {
    if (!canWithdraw || availableAmount <= 0) {
      return false;
    }

    try {
      // 1. Criar transação empresarial de saída (débito do fluxo de caixa)
      const businessTransactionData: Omit<Transaction, 'id' | 'createdAt'> = {
        amount: availableAmount,
        date: new Date().toISOString().split('T')[0],
        type: 'saída',
        category: 'pró-labore',
        description: `Retirada de pró-labore do mês ${currentMonthKey}`,
      };

      const businessTransaction = await createTransaction(businessTransactionData);
      
      if (!businessTransaction) {
        throw new Error('Falha ao criar transação empresarial');
      }

      // 2. Criar transação pessoal de entrada (crédito no controle pessoal)
      const personalTransaction = await createPersonalTransaction(
        'entrada',
        availableAmount,
        `Pró-labore do mês ${currentMonthKey}`,
        'pró-labore',
        currentMonthKey
      );

      // 3. Salvar registro local com IDs das duas transações
      const newRecord: ProLaboreRecord = {
        id: `${currentMonthKey}-${Date.now()}`,
        monthKey: currentMonthKey,
        amount: availableAmount,
        withdrawn: true,
        date: new Date().toISOString(),
        personalTransactionId: personalTransaction.id,
        businessTransactionId: businessTransaction.id
      };

      const updatedRecords = [...proLaboreRecords, newRecord];
      saveRecords(updatedRecords);

      console.log(`Pró-labore de R$ ${availableAmount.toFixed(2)} processado:
        - Debitado do fluxo empresarial (ID: ${businessTransaction.id})
        - Creditado no controle pessoal (ID: ${personalTransaction.id})`);
      
      return true;
    } catch (error) {
      console.error('Erro ao retirar pró-labore:', error);
      return false;
    }
  }, [canWithdraw, availableAmount, currentMonthKey, proLaboreRecords, saveRecords]);

  // Função para devolver pró-labore específico
  const returnProLabore = useCallback(async (recordId: string) => {
    const recordToReturn = proLaboreRecords.find(record => record.id === recordId);
    
    if (!recordToReturn || !recordToReturn.withdrawn) {
      console.error('Registro não encontrado ou não foi retirado:', recordId);
      return false;
    }

    try {
      console.log('Iniciando devolução do pró-labore:', recordToReturn);

      // 1. Remover transação pessoal se existir
      if (recordToReturn.personalTransactionId) {
        try {
          await deletePersonalTransaction(recordToReturn.personalTransactionId);
          console.log(`Transação pessoal removida: ${recordToReturn.personalTransactionId}`);
        } catch (error) {
          console.warn('Erro ao remover transação pessoal (pode não existir):', error);
        }
      }

      // 2. Remover transação empresarial se existir
      if (recordToReturn.businessTransactionId) {
        try {
          await deleteTransaction(recordToReturn.businessTransactionId);
          console.log(`Transação empresarial removida: ${recordToReturn.businessTransactionId}`);
        } catch (error) {
          console.warn('Erro ao remover transação empresarial (pode não existir):', error);
        }
      }

      // 3. Remover o registro do localStorage
      const updatedRecords = proLaboreRecords.filter(record => record.id !== recordId);
      saveRecords(updatedRecords);

      console.log(`Pró-labore do mês ${recordToReturn.monthKey} devolvido completamente`);
      return true;
    } catch (error) {
      console.error('Erro ao devolver pró-labore:', error);
      return false;
    }
  }, [proLaboreRecords, saveRecords]);

  return {
    availableAmount,
    monthlyIncomes,
    monthlyExpenses,
    monthlyBalance,
    totalProLabore,
    alreadyWithdrawn,
    canWithdraw,
    withdrawProLabore,
    returnProLabore,
    currentMonthRecords: proLaboreRecords.filter(record => record.monthKey === currentMonthKey)
  };
}
