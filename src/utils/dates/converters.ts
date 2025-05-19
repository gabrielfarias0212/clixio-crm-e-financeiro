import { format, parseISO } from "date-fns";
import { DATE_FORMAT } from "./constants";

// Utility function to normalize dates to YYYY-MM-DD format without time component
export const normalizeDate = (date: string | Date | null): string => {
  if (!date) return "";
  
  // If it's already a string in our standard format, convert it to database format
  if (typeof date === "string") {
    // Check if it's in DD/MM/YYYY format (Brazilian format)
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

// Date string to Date object (for calendar component)
export const stringToDate = (dateStr: string | null): Date | null => {
  if (!dateStr) return null;
  
  try {
    // Check if it's in DD/MM/YYYY format (Brazilian format)
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
