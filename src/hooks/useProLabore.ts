
import { useState, useEffect, useCallback } from "react";
import { WeekInfo } from "@/utils/dates/weekUtils";

export interface ProLaboreRecord {
  weekKey: string;
  amount: number;
  withdrawn: boolean;
  date: string;
}

export function useProLabore(currentWeek: WeekInfo, weeklyBalance: number) {
  const [proLaboreRecords, setProLaboreRecords] = useState<ProLaboreRecord[]>([]);
  
  // Gerar chave única para a semana atual
  const currentWeekKey = currentWeek.start.toISOString().split('T')[0];
  
  // Carregar registros do localStorage
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
  const withdrawProLabore = useCallback(() => {
    if (isAlreadyWithdrawn || availableAmount <= 0) {
      return false;
    }

    const newRecord: ProLaboreRecord = {
      weekKey: currentWeekKey,
      amount: availableAmount,
      withdrawn: true,
      date: new Date().toISOString()
    };

    const updatedRecords = proLaboreRecords.filter(record => record.weekKey !== currentWeekKey);
    updatedRecords.push(newRecord);
    
    saveRecords(updatedRecords);

    // Adicionar entrada no controle pessoal
    const personalTransactions = JSON.parse(localStorage.getItem('personalTransactions') || '[]');
    const newPersonalTransaction = {
      id: Date.now().toString(),
      type: 'entrada',
      amount: availableAmount,
      description: `Pró-labore da semana ${currentWeek.label}`,
      date: new Date().toLocaleDateString('pt-BR')
    };

    personalTransactions.unshift(newPersonalTransaction);
    localStorage.setItem('personalTransactions', JSON.stringify(personalTransactions));

    console.log(`Pró-labore de R$ ${availableAmount.toFixed(2)} transferido para controle pessoal`);
    return true;
  }, [isAlreadyWithdrawn, availableAmount, currentWeekKey, proLaboreRecords, saveRecords, currentWeek.label]);

  return {
    availableAmount,
    isAlreadyWithdrawn,
    canWithdraw: !isAlreadyWithdrawn && availableAmount > 0,
    withdrawProLabore,
    currentWeekRecord
  };
}
