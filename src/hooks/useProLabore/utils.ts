
import { CalculationType } from './types';

export const getCurrentPeriodReference = (tipo: CalculationType): string => {
  const now = new Date();
  if (tipo === 'mensal') {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  } else {
    const weekNumber = getWeekNumber(now);
    return `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
  }
};

export const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};
