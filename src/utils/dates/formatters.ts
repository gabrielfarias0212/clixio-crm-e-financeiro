import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import { DATE_FORMAT, TIMEZONE } from "./constants";

// Format date to locale string (DD/MM/YYYY)
export const formatDate = (date: string | Date | null, formatStr: string = DATE_FORMAT): string => {
  if (!date) return "";
  
  // If it's already a string in our standard format, return it or reformat as needed
  if (typeof date === "string") {
    // Check if it's in YYYY-MM-DD format (from database)
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = date.split('-').map(Number);
      return format(new Date(year, month - 1, day), formatStr, { locale: ptBR });
    }
    
    // Check if it's already in DD/MM/YYYY format
    if (date.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      // If requesting standard format, return as is
      if (formatStr === DATE_FORMAT) {
        return date;
      }
      // Otherwise parse and reformat
      const [day, month, year] = date.split('/').map(Number);
      return format(new Date(year, month - 1, day), formatStr, { locale: ptBR });
    }
    
    // Try to parse as ISO date string
    try {
      const parsedDate = parseISO(date);
      return format(parsedDate, formatStr, { locale: ptBR });
    } catch (e) {
      return date; // Return original string if parsing fails
    }
  }
  
  // If it's a Date object, format it
  return format(date, formatStr, { locale: ptBR });
};

// Format date with time
export const formatDateTime = (date: string | Date | null, formatStr: string = "dd/MM/yyyy HH:mm"): string => {
  if (!date) return "";
  
  // Similar logic as formatDate, but with time component
  if (typeof date === "string") {
    // For database or ISO format dates, parse and format
    try {
      // Try to parse as ISO string first
      const parsedDate = parseISO(date);
      return format(parsedDate, formatStr, { locale: ptBR });
    } catch (e) {
      // If that fails, try our standard date format
      if (date.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = date.split('/').map(Number);
        return format(new Date(year, month - 1, day, 12, 0, 0), formatStr, { locale: ptBR });
      }
      return date;
    }
  }
  
  // If it's a Date object
  return format(date, formatStr, { locale: ptBR });
};

// Get time from date
export const getTimeFromDate = (date: string | Date | null): string => {
  if (!date) return "";
  
  if (typeof date === "string") {
    // If the date already has a time component
    if (date.includes("T")) {
      try {
        const parsedDate = parseISO(date);
        return format(parsedDate, "HH:mm", { locale: ptBR });
      } catch (e) {
        return "";
      }
    }
    return ""; // Our standard date format doesn't include time
  }
  
  // If it's a Date object
  return format(date, "HH:mm", { locale: ptBR });
};

// Missing import
import { parseISO } from "date-fns";
