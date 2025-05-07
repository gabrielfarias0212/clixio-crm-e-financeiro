
import { ClientStatus, NextAction, EventCategory } from "@/utils/types";
import { excelSerialDateToJSDate, parseBrazilianDate } from "@/utils/dateUtils";

// Função para normalizar valores de texto
export const normalizeText = (value: any): string => {
  if (value === undefined || value === null) return '';
  return String(value).trim();
};

// Função para normalizar valores de data
export const normalizeDate = (value: any): Date | null => {
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
export const normalizeNumber = (value: any): number => {
  if (value === undefined || value === null) return 0;
  
  // Se for uma string, remover caracteres não numéricos exceto ponto decimal
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.,]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  }
  
  return Number(value) || 0;
};

// Função para normalizar status
export const normalizeStatus = (value: any): ClientStatus => {
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
export const normalizeNextAction = (value: any): NextAction => {
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
export const normalizeEventCategory = (value: any): EventCategory => {
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
