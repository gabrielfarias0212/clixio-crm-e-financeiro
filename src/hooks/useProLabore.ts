
import { useState, useEffect, useCallback } from "react";
import { WeekInfo } from "@/utils/dates/weekUtils";
import { createPersonalTransaction } from "@/utils/supabase/personal-transactions";

export interface ProLaboreRecord {
  weekKey: string;
  amount: number;
  withdrawn: boolean;
  date: string;
  personalTransactionId?: string;
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

  // Função para retirar pró-labore
  const withdrawProLabore = useCallback(async () => {
    if (isAlreadyWithdrawn || availableAmount <= 0) {
      return false;
    }

    try {
      // Criar transação pessoal no banco de dados
      const newPersonalTransaction = await createPersonalTransaction(
        'entrada',
        availableAmount,
        `Pró-labore da semana ${currentWeek.label}`,
        'pró-labore',
        currentWeekKey
      );

      const newRecord: ProLaboreRecord = {
        weekKey: currentWeekKey,
        amount: availableAmount,
        withdrawn: true,
        date: new Date().toISOString(),
        personalTransactionId: newPersonalTransaction.id
      };

      const updatedRecords = proLaboreRecords.filter(record => record.weekKey !== currentWeekKey);
      updatedRecords.push(newRecord);
      
      saveRecords(updatedRecords);

      console.log(`Pró-labore de R$ ${availableAmount.toFixed(2)} transferido para controle pessoal`);
      return true;
    } catch (error) {
      console.error('Erro ao retirar pró-labore:', error);
      return false;
    }
  }, [isAlreadyWithdrawn, availableAmount, currentWeekKey, proLaboreRecords, saveRecords, currentWeek.label]);

  // Função para devolver pró-labore
  const returnProLabore = useCallback(async (weekKey: string) => {
    const recordToReturn = proLaboreRecords.find(record => record.weekKey === weekKey);
    
    if (!recordToReturn || !recordToReturn.withdrawn) {
      return false;
    }

    try {
      // A remoção da transação pessoal será feita pelo componente PersonalTransactionsList
      // quando o usuário clicar no botão "Devolver"
      
      // Marcar o pró-labore como não retirado
      const updatedRecords = proLaboreRecords.map(record => 
        record.weekKey === weekKey 
          ? { ...record, withdrawn: false, personalTransactionId: undefined }
          : record
      );
      
      saveRecords(updatedRecords);

      console.log(`Pró-labore da semana ${weekKey} devolvido para a empresa`);
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
