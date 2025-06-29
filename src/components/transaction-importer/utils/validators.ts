
export const isValidDate = (dateStr: string): boolean => {
  if (!dateStr || typeof dateStr !== 'string') return false;
  
  // Tentar diferentes formatos de data
  const formats = [
    /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
    /^\d{1,2}\/\d{1,2}\/\d{4}$/, // D/M/YYYY ou DD/M/YYYY
  ];
  
  const matchesFormat = formats.some(format => format.test(dateStr));
  if (!matchesFormat) return false;
  
  const date = parseDate(dateStr);
  return date !== null && !isNaN(new Date(convertToISODate(date)).getTime());
};

const convertToISODate = (dateStr: string): string => {
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

export const parseDate = (dateStr: string): string | null => {
  if (!dateStr || typeof dateStr !== 'string') return null;
  
  const cleanDateStr = String(dateStr).trim();
  if (!cleanDateStr) return null;
  
  try {
    // Se é um número (serial do Excel)
    if (!isNaN(Number(cleanDateStr)) && Number(cleanDateStr) > 10000) {
      const excelDate = new Date((Number(cleanDateStr) - 25569) * 86400 * 1000);
      if (!isNaN(excelDate.getTime())) {
        const day = excelDate.getDate();
        const month = excelDate.getMonth() + 1;
        const year = excelDate.getFullYear();
        return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
      }
    }
    
    // DD/MM/YYYY ou D/M/YYYY
    if (cleanDateStr.includes('/')) {
      const parts = cleanDateStr.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        
        if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
          return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
        }
      }
    }
    
    // YYYY-MM-DD
    if (cleanDateStr.includes('-') && cleanDateStr.length === 10) {
      const [year, month, day] = cleanDateStr.split('-');
      if (year && month && day && year.length === 4) {
        const dayNum = parseInt(day, 10);
        const monthNum = parseInt(month, 10);
        const yearNum = parseInt(year, 10);
        
        if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum >= 1900 && yearNum <= 2100) {
          return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
        }
      }
    }
    
    // DD-MM-YYYY
    if (cleanDateStr.includes('-')) {
      const parts = cleanDateStr.split('-');
      if (parts.length === 3 && parts[2].length === 4) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        
        if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
          return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao processar data:', cleanDateStr, error);
    return null;
  }
};

export const isValidAmount = (value: any): boolean => {
  if (value === null || value === undefined || value === '') return false;
  
  // Se já é um número
  if (typeof value === 'number') return !isNaN(value) && value !== 0;
  
  // Se é string, tentar converter
  if (typeof value === 'string') {
    const cleanValue = value.trim().replace(/[^\d,.-]/g, '');
    if (!cleanValue) return false;
    
    // Converter vírgula para ponto (formato brasileiro)
    const normalizedValue = cleanValue.replace(',', '.');
    const num = parseFloat(normalizedValue);
    return !isNaN(num) && num !== 0;
  }
  
  return false;
};

export const parseAmount = (value: any): number => {
  if (typeof value === 'number') return value;
  
  if (typeof value === 'string') {
    const cleanValue = value.trim().replace(/[^\d,.-]/g, '');
    if (!cleanValue) return 0;
    
    // Converter vírgula para ponto (formato brasileiro)
    const normalizedValue = cleanValue.replace(',', '.');
    const parsed = parseFloat(normalizedValue);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  return 0;
};
