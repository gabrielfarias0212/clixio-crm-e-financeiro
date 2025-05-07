
import { format, parseISO, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { fromZonedTime, formatInTimeZone } from "date-fns-tz";

// Configuração do fuso horário brasileiro
export const TIMEZONE = "America/Sao_Paulo";

// Standard date format we'll use throughout the app
export const DATE_FORMAT = "dd/MM/yyyy";

// Utility function to normalize dates to YYYY-MM-DD format without time component
export const normalizeDate = (date: string | Date | null): string => {
  if (!date) return "";
  
  // If it's already a string in our standard format, convert it to database format
  if (typeof date === "string") {
    // Check if it's already in DD/MM/YYYY format
    if (date.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = date.split('/').map(Number);
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    
    // Otherwise try to parse it as an ISO date
    try {
      const d = parseISO(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    } catch (e) {
      return ""; // Invalid date
    }
  }
  
  // If it's a Date object
  const d = date;
  // Convert for database format (YYYY-MM-DD)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

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

// Date string to Date object (for calendar component)
export const stringToDate = (dateStr: string | null): Date | null => {
  if (!dateStr) return null;
  
  try {
    // Check if it's in DD/MM/YYYY format
    if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = dateStr.split('/').map(Number);
      const date = new Date(year, month - 1, day, 12, 0, 0);
      return isNaN(date.getTime()) ? null : date;
    }
    
    // Check if it's in YYYY-MM-DD format
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day, 12, 0, 0);
      return isNaN(date.getTime()) ? null : date;
    }
    
    // Try to parse as ISO string
    const parsedDate = parseISO(dateStr);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  } catch (error) {
    console.error("Error parsing date string:", dateStr, error);
    return null;
  }
};

// Date object to string (DD/MM/YYYY)
export const dateToString = (date: Date | null): string => {
  if (!date) return "";
  if (isNaN(date.getTime())) return "";
  return format(date, DATE_FORMAT);
};

// Parse Brazilian date format (DD/MM/YYYY)
export const parseBrazilianDate = (dateString: string | Date | null | number): string | null => {
  if (!dateString) return null;
  
  // Check if the date is already a Date object
  if (dateString instanceof Date) {
    if (isNaN(dateString.getTime())) return null;
    return format(dateString, DATE_FORMAT);
  }
  
  // Check if it's an Excel serial number
  if (typeof dateString === "number" || (!isNaN(Number(dateString)) && Number(dateString) > 10000)) {
    const numericDate = typeof dateString === "number" ? dateString : Number(dateString);
    const excelDate = excelSerialDateToJSDate(numericDate);
    return excelDate ? format(excelDate, DATE_FORMAT) : null;
  }
  
  // If it's already in our standard format
  if (typeof dateString === "string" && dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    return dateString;
  }
  
  // Try to parse the string date in DD/MM/YYYY format
  if (typeof dateString === "string") {
    // Check for DD/MM/YYYY format (with / or -)
    const brazilianDateRegex = /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/;
    const match = dateString.match(brazilianDateRegex);
    
    if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      const year = parseInt(match[3], 10);
      
      // Validate ranges
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
      }
    }
    
    // Try standard JavaScript date parsing as fallback
    try {
      const parsedDate = parseISO(dateString);
      if (!isNaN(parsedDate.getTime())) {
        return format(parsedDate, DATE_FORMAT);
      }
    } catch (_) {
      // Ignora erros de parsing
    }
  }
  
  return null;
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
  
  return resultDate;
};

// Format date for Supabase (YYYY-MM-DD)
export const formatDateForSupabase = (date: string | Date | null): string | null => {
  if (!date) return null;
  
  // If it's already a string in DD/MM/YYYY format, convert to database format
  if (typeof date === "string") {
    if (date.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = date.split('/').map(Number);
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    
    // If it's already in YYYY-MM-DD format, return as is
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return date;
    }
    
    // Try to parse as ISO date
    try {
      const d = parseISO(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    } catch (e) {
      return null;
    }
  }
  
  // If it's a Date object
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// Cria uma data segura como string no formato DD/MM/YYYY
export const createSafeDate = (year: number, month: number, day: number): string => {
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    console.error("Invalid date parameters:", year, month, day);
    return "";
  }
  
  try {
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) {
      return "";
    }
    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
  } catch (error) {
    console.error("Error creating safe date:", error);
    return "";
  }
};

// Create a valid date as a string in DD/MM/YYYY format
export const createValidDate = (year: number, month: number, day: number): string | null => {
  if (!year || !month || !day) return null;
  
  try {
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime()) || date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return null; // Date is invalid
    }
    return dateToString(date);
  } catch (error) {
    return null;
  }
};
