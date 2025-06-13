
import { useState, useEffect, useCallback } from "react";
import { WeekInfo } from "@/utils/dates/weekUtils";
import { createPersonalTransaction, deletePersonalTransaction } from "@/utils/supabase/personal-transactions";
import { createTransaction, deleteTransaction } from "@/utils/supabase/transactions";
import { Transaction } from "@/utils/types";

export interface ProLaboreRecord {
  weekKey: string;
  amount: number;
  withdrawn: boolean;
  date: string;
  personalTransactionId?: string;
  businessTransactionId?: string; // Nova propriedade para vincular transação empresarial
}

export function useProLabore(currentWeek: WeekInfo, weeklyBalance: number) {
  const [proLaboreRecords, setProLaboreRecords] = useState<ProLaboreRecord[]>([]);
  
  // Gerar chave única para a semana atual
  const currentWeekKey = currentWeek.start.toISOString().split('T')[0];
  
  // Carregar registros do localStorage (mantém compatibilidade temporária)
  useEffect(() => {
    const saved = localStorage.getItem('proLaboreRecords');
    if (saved) {
      try {
        setProLaboreRecords(JSON.parse(saved));
      } catch (error) {
        console.error('Erro ao carregar registros de pró-labore:', error);
        setProLaboreRecords([]);
      }
    }
  }, []);

  // Salvar registros no localStorage
  const saveRecords = useCallback((records: ProLaboreRecord[]) => {
    localStorage.setItem('proLaboreRecords', JSON.stringify(records));
    setProLaboreRecords(records);
  }, []);

  // Verificar se já foi retirado na semana atual
  const currentWeekRecord = proLaboreRecords.find(record => record.weekKey === currentWeekKey);
  const isAlreadyWithdrawn = currentWeekRecord?.withdrawn || false;

  // Calcular valor disponível (30% do saldo positivo)
  const availableAmount = weeklyBalance > 0 ? weeklyBalance * 0.3 : 0;

  // Função para retirar pró-labore (cria transações duplas)
  const withdrawProLabore = useCallback(async () => {
    if (isAlreadyWithdrawn || availableAmount <= 0) {
      return false;
    }

    try {
      // 1. Criar transação empresarial de saída (débito do fluxo de caixa)
      const businessTransactionData: Omit<Transaction, 'id' | 'createdAt'> = {
        amount: availableAmount,
        date: new Date().toISOString().split('T')[0],
        type: 'saída',
        category: 'pró-labore',
        description: `Retirada de pró-labore da semana ${currentWeek.label}`,
      };

      const businessTransaction = await createTransaction(businessTransactionData);
      
      if (!businessTransaction) {
        throw new Error('Falha ao criar transação empresarial');
      }

      // 2. Criar transação pessoal de entrada (crédito no controle pessoal)
      const personalTransaction = await createPersonalTransaction(
        'entrada',
        availableAmount,
        `Pró-labore da semana ${currentWeek.label}`,
        'pró-labore',
        currentWeekKey
      );

      // 3. Salvar registro local com IDs das duas transações
      const newRecord: ProLaboreRecord = {
        weekKey: currentWeekKey,
        amount: availableAmount,
        withdrawn: true,
        date: new Date().toISOString(),
        personalTransactionId: personalTransaction.id,
        businessTransactionId: businessTransaction.id
      };

      const updatedRecords = proLaboreRecords.filter(record => record.weekKey !== currentWeekKey);
      updatedRecords.push(newRecord);
      
      saveRecords(updatedRecords);

      console.log(`Pró-labore de R$ ${availableAmount.toFixed(2)} processado:
        - Debitado do fluxo empresarial (ID: ${businessTransaction.id})
        - Creditado no controle pessoal (ID: ${personalTransaction.id})`);
      
      return true;
    } catch (error) {
      console.error('Erro ao retirar pró-labore:', error);
      return false;
    }
  }, [isAlreadyWithdrawn, availableAmount, currentWeekKey, proLaboreRecords, saveRecords, currentWeek.label]);

  // Função para devolver pró-labore (remove ambas as transações)
  const returnProLabore = useCallback(async (weekKey: string) => {
    const recordToReturn = proLaboreRecords.find(record => record.weekKey === weekKey);
    
    if (!recordToReturn || !recordToReturn.withdrawn) {
      return false;
    }

    try {
      // 1. Remover transação pessoal se existir
      if (recordToReturn.personalTransactionId) {
        await deletePersonalTransaction(recordToReturn.personalTransactionId);
        console.log(`Transação pessoal removida: ${recordToReturn.personalTransactionId}`);
      }

      // 2. Remover transação empresarial se existir
      if (recordToReturn.businessTransactionId) {
        await deleteTransaction(recordToReturn.businessTransactionId);
        console.log(`Transação empresarial removida: ${recordToReturn.businessTransactionId}`);
      }

      // 3. Marcar o pró-labore como não retirado
      const updatedRecords = proLaboreRecords.map(record => 
        record.weekKey === weekKey 
          ? { 
              ...record, 
              withdrawn: false, 
              personalTransactionId: undefined,
              businessTransactionId: undefined
            }
          : record
      );
      
      saveRecords(updatedRecords);

      console.log(`Pró-labore da semana ${weekKey} devolvido completamente`);
      return true;
    } catch (error) {
      console.error('Erro ao devolver pró-labore:', error);
      return false;
    }
  }, [proLaboreRecords, saveRecords]);

  return {
    availableAmount,
    isAlreadyWithdrawn,
    canWithdraw: !isAlreadyWithdrawn && availableAmount > 0,
    withdrawProLabore,
    returnProLabore,
    currentWeekRecord
  };
}
