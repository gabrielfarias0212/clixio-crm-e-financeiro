import { format, parseISO, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { fromZonedTime, toZonedTime, formatInTimeZone } from "date-fns-tz";

// Configuração do fuso horário brasileiro
export const TIMEZONE = "America/Sao_Paulo";

// Utility function to normalize dates to YYYY-MM-DD format without time component
export const normalizeDate = (date: Date | string | null): string => {
  if (!date) return "";
  
  // Se for string, converte para Date mantendo o fuso horário de São Paulo
  const d = typeof date === "string" ? parseISO(date) : date;
  // Converte para o fuso horário de São Paulo
  const spDate = toZonedTime(d, TIMEZONE);
  
  return `${spDate.getFullYear()}-${String(spDate.getMonth() + 1).padStart(2, '0')}-${String(spDate.getDate()).padStart(2, '0')}`;
};

// Format date to locale string
export const formatDate = (date: Date | string | null, formatStr: string = "dd/MM/yyyy"): string => {
  if (!date) return "";
  
  // Se for string, converte para Date
  const d = typeof date === "string" ? parseISO(date) : date;
  // Converte para o fuso horário de São Paulo
  const spDate = toZonedTime(d, TIMEZONE);
  
  // Updated to match the v3 signature which takes format string directly
  return formatInTimeZone(spDate, TIMEZONE, formatStr, { locale: ptBR });
};

// Format date with time
export const formatDateTime = (date: Date | string | null, formatStr: string = "dd/MM/yyyy HH:mm"): string => {
  if (!date) return "";
  
  // Se for string, converte para Date
  const d = typeof date === "string" ? parseISO(date) : date;
  // Converte para o fuso horário de São Paulo
  const spDate = toZonedTime(d, TIMEZONE);
  
  // Updated to match the v3 signature
  return formatInTimeZone(spDate, TIMEZONE, formatStr, { locale: ptBR });
};

// Get time from date
export const getTimeFromDate = (date: Date | string | null): string => {
  if (!date) return "";
  
  // Se for string, converte para Date
  const d = typeof date === "string" ? parseISO(date) : date;
  // Converte para o fuso horário de São Paulo
  const spDate = toZonedTime(d, TIMEZONE);
  
  // Updated to match the v3 signature
  return formatInTimeZone(spDate, TIMEZONE, "HH:mm", { locale: ptBR });
};

// Combine date and time
export const combineDateAndTime = (date: Date, timeStr: string): Date => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  
  // Cria uma nova data no fuso horário de São Paulo
  const spDate = toZonedTime(date, TIMEZONE);
  spDate.setHours(hours);
  spDate.setMinutes(minutes);
  
  // Converte de volta para UTC para armazenamento
  return fromZonedTime(spDate, TIMEZONE);
};

// Convert Excel serial number to JavaScript Date
export const excelSerialDateToJSDate = (serialNumber: number): Date | null => {
  if (!serialNumber) return null;
  
  // Excel's date system starts on January 0, 1900,
  // which is actually December 31, 1899
  const excelEpoch = new Date(1899, 11, 30);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  
  // Convert serial number to milliseconds and add to Excel epoch
  const resultDate = new Date(excelEpoch.getTime() + serialNumber * millisecondsPerDay);
  
  // Ajusta para o fuso horário de São Paulo
  return toZonedTime(resultDate, TIMEZONE);
};

// Parse Brazilian date format (DD/MM/YYYY)
export const parseBrazilianDate = (dateString: string | Date | null | number): Date | null => {
  if (!dateString) return null;
  
  // Check if the date is already a Date object
  if (dateString instanceof Date) {
    // Garante que a data esteja no fuso horário de São Paulo
    return toZonedTime(dateString, TIMEZONE);
  }
  
  // Check if it's an Excel serial number
  if (typeof dateString === "number" || (!isNaN(Number(dateString)) && Number(dateString) > 10000)) {
    const numericDate = typeof dateString === "number" ? dateString : Number(dateString);
    return excelSerialDateToJSDate(numericDate);
  }
  
  // Try to parse the string date in DD/MM/YYYY format
  if (typeof dateString === "string") {
    // Check for DD/MM/YYYY format (with / or -)
    const brazilianDateRegex = /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/;
    const match = dateString.match(brazilianDateRegex);
    
    if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1; // 0-based month
      const year = parseInt(match[3], 10);
      
      // Validate ranges
      if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 1900 && year <= 2100) {
        // Cria a data no fuso horário de São Paulo (meio-dia para evitar problemas)
        const parsedDate = new Date(year, month, day, 12, 0, 0);
        // Check if the date is valid (e.g., not Feb 31)
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }
    }
    
    // Try standard JavaScript date parsing as fallback
    try {
      const parsedDate = parseISO(dateString);
      if (!isNaN(parsedDate.getTime())) {
        // Garante que a data esteja no fuso horário de São Paulo
        return toZonedTime(parsedDate, TIMEZONE);
      }
    } catch (_) {
      // Ignora erros de parsing
    }
    
    // Última tentativa com o construtor Date
    const fallbackDate = new Date(dateString);
    if (!isNaN(fallbackDate.getTime())) {
      // Garante que a data esteja no fuso horário de São Paulo
      return toZonedTime(fallbackDate, TIMEZONE);
    }
  }
  
  return null;
};

// Cria uma data segura no fuso horário de São Paulo
export const createSafeDate = (year: number, month: number, day: number): Date => {
  // Criar a data com horário meio-dia para evitar problemas de fuso
  const date = new Date(year, month - 1, day, 12, 0, 0);
  return date;
};
