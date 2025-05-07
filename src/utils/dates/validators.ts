
// Validate if a date object is valid
export const isValidDate = (date: Date | null): boolean => {
  return date !== null && !isNaN(date.getTime());
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

// Importing missing function
import { dateToString } from "./converters";
