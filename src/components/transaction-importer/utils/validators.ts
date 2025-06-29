
export const isValidDate = (dateStr: string): boolean => {
  if (!dateStr || typeof dateStr !== 'string') return false;
  
  // Tentar diferentes formatos de data
  const formats = [
    /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
  ];
  
  const matchesFormat = formats.some(format => format.test(dateStr));
  if (!matchesFormat) return false;
  
  const date = parseDate(dateStr);
  return date !== null && !isNaN(new Date(date).getTime());
};

export const parseDate = (dateStr: string): string | null => {
  if (!dateStr) return null;
  
  try {
    // DD/MM/YYYY
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      if (day && month && year && year.length === 4) {
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
      }
    }
    
    // YYYY-MM-DD
    if (dateStr.includes('-') && dateStr.length === 10) {
      const [year, month, day] = dateStr.split('-');
      if (year && month && day && year.length === 4) {
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
      }
    }
    
    // DD-MM-YYYY
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3 && parts[2].length === 4) {
        const [day, month, year] = parts;
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao processar data:', dateStr, error);
    return null;
  }
};

export const isValidAmount = (value: any): boolean => {
  if (value === null || value === undefined || value === '') return false;
  
  // Se já é um número
  if (typeof value === 'number') return !isNaN(value);
  
  // Se é string, tentar converter
  if (typeof value === 'string') {
    // Remover espaços e caracteres especiais, exceto vírgula e ponto
    const cleanValue = value.replace(/[^\d,.-]/g, '');
    
    // Converter vírgula para ponto (formato brasileiro)
    const normalizedValue = cleanValue.replace(',', '.');
    
    const num = parseFloat(normalizedValue);
    return !isNaN(num);
  }
  
  return false;
};

export const parseAmount = (value: any): number => {
  if (typeof value === 'number') return value;
  
  if (typeof value === 'string') {
    // Remover espaços e caracteres especiais, exceto vírgula e ponto
    const cleanValue = value.replace(/[^\d,.-]/g, '');
    
    // Converter vírgula para ponto (formato brasileiro)
    const normalizedValue = cleanValue.replace(',', '.');
    
    return parseFloat(normalizedValue);
  }
  
  return 0;
};
