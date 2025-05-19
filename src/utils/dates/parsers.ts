
import { parse, parseISO } from "date-fns";
import { DATE_FORMAT } from "./constants";
import { isValidDate } from "./validators";

// Parse Brazilian date format (DD/MM/YYYY)
export const parseBrazilianDate = (dateString: string | Date | null | number): string | null => {
  if (!dateString) return null;
  
  // Check if the date is already a Date object
  if (dateString instanceof Date) {
    if (isNaN(dateString.getTime())) return null;
    return formatDate(dateString);
  }
  
  // Check if it's an Excel serial number
  if (typeof dateString === "number" || (!isNaN(Number(dateString)) && Number(dateString) > 10000)) {
    const numericDate = typeof dateString === "number" ? dateString : Number(dateString);
    const excelDate = excelSerialDateToJSDate(numericDate);
    return excelDate ? formatDate(excelDate) : null;
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
    
    // Check for YYYY-MM-DD format (ISO format from database)
    const isoDateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
    const isoMatch = dateString.match(isoDateRegex);
    
    if (isoMatch) {
      const year = parseInt(isoMatch[1], 10);
      const month = parseInt(isoMatch[2], 10);
      const day = parseInt(isoMatch[3], 10);
      
      // Validate ranges before returning
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
      }
    }
    
    // Try standard JavaScript date parsing as fallback
    try {
      const parsedDate = parseISO(dateString);
      if (!isNaN(parsedDate.getTime())) {
        return formatDate(parsedDate);
      }
    } catch (_) {
      // Ignora erros de parsing
    }
  }
  
  return null;
};

// Importing missing functions
import { formatDate } from "./formatters";
import { excelSerialDateToJSDate } from "./converters";
