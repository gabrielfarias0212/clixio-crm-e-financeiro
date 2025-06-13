
import { startOfWeek, endOfWeek, addWeeks, subWeeks, format, isSameWeek, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface WeekInfo {
  start: Date;
  end: Date;
  label: string;
}

// Obter informações da semana atual
export const getCurrentWeekInfo = (): WeekInfo => {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 0 }); // Domingo
  const end = endOfWeek(now, { weekStartsOn: 0 }); // Sábado
  
  return {
    start,
    end,
    label: `${format(start, "dd/MM", { locale: ptBR })} - ${format(end, "dd/MM/yyyy", { locale: ptBR })}`
  };
};

// Obter informações de uma semana específica
export const getWeekInfo = (date: Date): WeekInfo => {
  const start = startOfWeek(date, { weekStartsOn: 0 });
  const end = endOfWeek(date, { weekStartsOn: 0 });
  
  return {
    start,
    end,
    label: `${format(start, "dd/MM", { locale: ptBR })} - ${format(end, "dd/MM/yyyy", { locale: ptBR })}`
  };
};

// Navegar para próxima semana
export const getNextWeek = (currentWeek: WeekInfo): WeekInfo => {
  const nextWeekStart = addWeeks(currentWeek.start, 1);
  return getWeekInfo(nextWeekStart);
};

// Navegar para semana anterior
export const getPreviousWeek = (currentWeek: WeekInfo): WeekInfo => {
  const prevWeekStart = subWeeks(currentWeek.start, 1);
  return getWeekInfo(prevWeekStart);
};

// Verificar se uma data está dentro de uma semana
export const isDateInWeek = (date: Date, weekInfo: WeekInfo): boolean => {
  return isWithinInterval(date, { start: weekInfo.start, end: weekInfo.end });
};

// Verificar se uma transação pertence à semana
export const isTransactionInWeek = (transactionDate: string, weekInfo: WeekInfo): boolean => {
  let date: Date;
  
  try {
    if (transactionDate.includes('/')) {
      // DD/MM/YYYY format
      const [day, month, year] = transactionDate.split('/').map(Number);
      date = new Date(year, month - 1, day);
    } else {
      // ISO format
      date = new Date(transactionDate);
    }
    
    if (isNaN(date.getTime())) {
      return false;
    }
    
    return isDateInWeek(date, weekInfo);
  } catch (error) {
    console.error("Erro ao verificar data da transação:", error);
    return false;
  }
};
