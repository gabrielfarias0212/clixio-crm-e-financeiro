
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

// Parse Brazilian date format (DD/MM/YYYY)
export const parseBrazilianDate = (dateString: string | Date | null | number): Date | null => {
  if (!dateString) return null;
  
  // Check if the date is already a Date object
  if (dateString instanceof Date) return dateString;
  
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
        const parsedDate = new Date(year, month, day, 12, 0, 0); // noon to avoid timezone issues
        // Check if the date is valid (e.g., not Feb 31)
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }
    }
    
    // Try standard JavaScript date parsing as fallback
    const fallbackDate = new Date(dateString);
    if (!isNaN(fallbackDate.getTime())) {
      return fallbackDate;
    }
  }
  
  return null;
};
