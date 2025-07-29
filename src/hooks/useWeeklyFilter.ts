import { useState, useCallback } from "react";
import { getCurrentWeekInfo, getNextWeek, getPreviousWeek, WeekInfo } from "@/utils/dates/weekUtils";

export type PeriodType = "monthly" | "weekly";
export type { WeekInfo };

export function useWeeklyFilter() {
  const [periodType, setPeriodType] = useState<PeriodType>("monthly");
  const [currentWeek, setCurrentWeek] = useState<WeekInfo>(getCurrentWeekInfo());

  const togglePeriod = useCallback(() => {
    setPeriodType(prev => prev === "monthly" ? "weekly" : "monthly");
    if (periodType === "monthly") {
      // Ao mudar para semanal, resetar para semana atual
      setCurrentWeek(getCurrentWeekInfo());
    }
  }, [periodType]);

  const goToNextWeek = useCallback(() => {
    setCurrentWeek(prev => getNextWeek(prev));
  }, []);

  const goToPreviousWeek = useCallback(() => {
    setCurrentWeek(prev => getPreviousWeek(prev));
  }, []);

  const goToCurrentWeek = useCallback(() => {
    setCurrentWeek(getCurrentWeekInfo());
  }, []);

  return {
    periodType,
    currentWeek,
    togglePeriod,
    goToNextWeek,
    goToPreviousWeek,
    goToCurrentWeek
  };
}
