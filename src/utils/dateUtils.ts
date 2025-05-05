
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

// Utility function to normalize dates to YYYY-MM-DD format without time component
export const normalizeDate = (date: Date | string | null): string => {
  if (!date) return "";
  
  const d = typeof date === "string" ? new Date(date) : date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Format date to locale string
export const formatDate = (date: Date | string | null, formatStr: string = "dd/MM/yyyy"): string => {
  if (!date) return "";
  
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, formatStr, { locale: ptBR });
};

// Get time from date
export const getTimeFromDate = (date: Date | string | null): string => {
  if (!date) return "";
  
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "HH:mm");
};

// Combine date and time
export const combineDateAndTime = (date: Date, timeStr: string): Date => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours);
  newDate.setMinutes(minutes);
  return newDate;
};
