
import { RawClientData, MappedClientData } from "./types";
import { 
  normalizeText,
  normalizeDate,
  normalizeNumber,
  normalizeStatus,
  normalizeNextAction,
  normalizeEventCategory
} from "./utils/normalizers";
import { generateExampleData } from "./utils/exampleData";

// Função principal para mapear dados brutos para o formato esperado
export const mapClientData = (data: RawClientData): MappedClientData => {
  let name = '';
  let coupleName = '';
  let email = '';
  let phone = '';
  let weddingDate: Date | null = null;
  let contractValue = 0;
  let downPayment = 0;
  let status = 'orçamento enviado';
  let nextAction = 'enviar proposta';
  let eventCategory = 'Casamento';
  let notes = '';
  
  // Iterar por todas as chaves e valores para encontrar os campos correspondentes
  Object.entries(data).forEach(([key, value]) => {
    const lowercaseKey = key.toLowerCase().trim();
    
    if (lowercaseKey.includes('nome') && !lowercaseKey.includes('casal')) {
      name = normalizeText(value);
    } 
    else if (lowercaseKey.includes('nome do casal') || lowercaseKey.includes('casal')) {
      coupleName = normalizeText(value);
    }
    else if (lowercaseKey.includes('email')) {
      email = normalizeText(value);
    }
    else if (lowercaseKey.includes('telefone') || lowercaseKey.includes('phone')) {
      phone = normalizeText(value);
    }
    else if (lowercaseKey.includes('data') || lowercaseKey.includes('casamento')) {
      weddingDate = normalizeDate(value);
    }
    else if (lowercaseKey.includes('valor') || lowercaseKey.includes('contrato')) {
      contractValue = normalizeNumber(value);
    }
    else if (lowercaseKey.includes('entrada') || lowercaseKey.includes('sinal') || lowercaseKey.includes('down')) {
      downPayment = normalizeNumber(value);
    }
    else if (lowercaseKey.includes('status')) {
      status = normalizeStatus(value);
    }
    else if (lowercaseKey.includes('ação') || lowercaseKey.includes('acao') || lowercaseKey.includes('action')) {
      nextAction = normalizeNextAction(value);
    }
    else if (lowercaseKey.includes('categoria') || lowercaseKey.includes('evento') || lowercaseKey.includes('type')) {
      eventCategory = normalizeEventCategory(value);
    }
    else if (lowercaseKey.includes('notas') || lowercaseKey.includes('notes') || lowercaseKey.includes('obs')) {
      notes = normalizeText(value);
    }
  });
  
  // Garantir valores padrão para campos obrigatórios
  if (!name) name = 'Cliente sem nome';
  if (!email) email = `cliente-${Date.now()}@exemplo.com`;
  if (!phone) phone = '(00) 00000-0000';
  
  return {
    name,
    coupleName,
    email,
    phone,
    weddingDate,
    contractValue,
    downPayment,
    status,
    nextAction,
    eventCategory,
    notes
  };
};

// Re-export the example data generator for backward compatibility
export { generateExampleData } from "./utils/exampleData";
