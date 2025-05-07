
import { EventCategory, ClientStatus, NextAction } from "@/utils/types";
import { excelSerialDateToJSDate, parseBrazilianDate } from "@/utils/dateUtils";

export interface RawClientData {
  [key: string]: any;
}

interface MappedClientData {
  name: string;
  coupleName?: string;
  email: string;
  phone: string;
  weddingDate: Date | null;
  contractValue: number;
  downPayment: number;
  status: ClientStatus;
  nextAction: NextAction;
  eventCategory: EventCategory;
  notes?: string;
}

// Função para normalizar valores de texto
const normalizeText = (value: any): string => {
  if (value === undefined || value === null) return '';
  return String(value).trim();
};

// Função para normalizar valores de data
const normalizeDate = (value: any): Date | null => {
  if (!value) return null;
  
  // Se for um número, pode ser uma data serial do Excel
  if (typeof value === 'number') {
    return excelSerialDateToJSDate(value);
  }
  
  // Se for uma string, pode ser uma data no formato brasileiro
  if (typeof value === 'string') {
    return parseBrazilianDate(value);
  }
  
  // Se já for um objeto Date
  if (value instanceof Date) {
    return value;
  }
  
  return null;
};

// Função para normalizar valores numéricos
const normalizeNumber = (value: any): number => {
  if (value === undefined || value === null) return 0;
  
  // Se for uma string, remover caracteres não numéricos exceto ponto decimal
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.,]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  }
  
  return Number(value) || 0;
};

// Função para normalizar status
const normalizeStatus = (value: any): ClientStatus => {
  if (!value) return 'orçamento enviado';
  
  const status = String(value).toLowerCase().trim();
  
  switch (status) {
    case 'orçamento enviado':
    case 'orcamento enviado':
    case 'orcamento':
    case 'orçamento':
      return 'orçamento enviado';
    case 'follow-up':
    case 'followup':
    case 'follow up':
      return 'follow-up';
    case 'fechado':
      return 'fechado';
    case 'em andamento':
    case 'andamento':
      return 'em andamento';
    case 'pago':
    case 'finalizado':
    case 'concluído':
    case 'concluido':
      return 'pago';
    default:
      return 'orçamento enviado';
  }
};

// Função para normalizar próxima ação
const normalizeNextAction = (value: any): NextAction => {
  if (!value) return 'enviar proposta';
  
  const action = String(value).toLowerCase().trim();
  
  switch (action) {
    case 'responder':
      return 'responder';
    case 'enviar proposta':
    case 'enviar':
    case 'proposta':
      return 'enviar proposta';
    case 'editar':
      return 'editar';
    case 'entregar':
      return 'entregar';
    case 'nenhuma':
    case 'nenhum':
    case '':
      return 'nenhuma';
    default:
      return 'enviar proposta';
  }
};

// Função para normalizar categoria de evento
const normalizeEventCategory = (value: any): EventCategory => {
  if (!value) return 'Casamento';
  
  const category = String(value).toLowerCase().trim();
  
  switch (category) {
    case 'casamento':
      return 'Casamento';
    case 'aniversario':
    case 'aniversário':
      return 'Aniversario';
    case 'civil':
      return 'Civil';
    case 'ensaio estudio':
    case 'ensaio estúdio':
    case 'estudio':
    case 'estúdio':
      return 'Ensaio Estudio';
    case 'ensaio externo':
    case 'externo':
      return 'Ensaio externo';
    case 'evento corporativo':
    case 'corporativo':
      return 'Evento Corporativo';
    default:
      return 'Casamento';
  }
};

// Função principal para mapear dados brutos para o formato esperado
export const mapClientData = (data: RawClientData): MappedClientData => {
  let name = '';
  let coupleName = '';
  let email = '';
  let phone = '';
  let weddingDate: Date | null = null;
  let contractValue = 0;
  let downPayment = 0;
  let status: ClientStatus = 'orçamento enviado';
  let nextAction: NextAction = 'enviar proposta';
  let eventCategory: EventCategory = 'Casamento';
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

// Função para gerar dados de exemplo para download
export const generateExampleData = () => {
  return [
    {
      "Nome do Cliente": "Maria e João",
      "Nome do Casal": "Maria & João Silva",
      "Email": "maria@exemplo.com",
      "Telefone": "(11) 98765-4321",
      "Data do Evento": "15/10/2024",
      "Valor do Contrato": "R$ 5.000,00",
      "Valor da Entrada": "R$ 1.000,00",
      "Status": "orçamento enviado",
      "Próxima Ação": "enviar proposta",
      "Categoria do Evento": "Casamento",
      "Notas": "Cerimônia às 16h"
    },
    {
      "Nome do Cliente": "Ana Silva",
      "Nome do Casal": "Ana & Pedro Oliveira",
      "Email": "ana@exemplo.com",
      "Telefone": "(21) 99876-5432",
      "Data do Evento": "22/11/2024",
      "Valor do Contrato": "R$ 3.500,00",
      "Valor da Entrada": "R$ 700,00",
      "Status": "fechado",
      "Próxima Ação": "editar",
      "Categoria do Evento": "Casamento",
      "Notas": "Local já confirmado"
    }
  ];
};
