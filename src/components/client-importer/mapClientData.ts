
import { RawClientData, MappedClientData } from './types';
import { normalizeClientName, normalizeCoupleName, normalizeAmount, normalizeDate, normalizeStatus, normalizeNextAction, normalizeEventCategory } from './utils/normalizers';

export const mapImportedClientToModel = (rawData: RawClientData): MappedClientData => {
  // Initialize with default values
  const mappedData: MappedClientData = {
    name: '',
    email: '',
    phone: '',
    weddingDate: null,
    contractValue: 0,
    downPayment: 0,
    status: 'orçamento enviado',
    nextAction: 'enviar proposta',
    eventCategory: 'Casamento',
    notes: ''
  };

  try {
    // Extract client name (required field)
    const nameKey = findKeyByPattern(rawData, /nome.*(cliente|contato)/i);
    if (nameKey) {
      mappedData.name = normalizeClientName(rawData[nameKey]);
    }

    // Extract couple name (optional)
    const coupleNameKey = findKeyByPattern(rawData, /nome.*(casal|noivos)/i);
    if (coupleNameKey) {
      mappedData.coupleName = normalizeCoupleName(rawData[coupleNameKey]);
    }

    // Extract email (required field)
    const emailKey = findKeyByPattern(rawData, /e-?mail/i);
    if (emailKey) {
      mappedData.email = String(rawData[emailKey]).trim();
    }

    // Extract phone (required field)
    const phoneKey = findKeyByPattern(rawData, /(telefone|celular|whatsapp|fone)/i);
    if (phoneKey) {
      mappedData.phone = String(rawData[phoneKey]).trim();
    }

    // Extract wedding date (optional)
    const dateKey = findKeyByPattern(rawData, /(data|dia).*(evento|casamento|wedding)/i);
    if (dateKey) {
      mappedData.weddingDate = normalizeDate(rawData[dateKey]);
    }

    // Extract contract value (optional)
    const contractValueKey = findKeyByPattern(rawData, /(valor|preço|price).*(contrato|serviço|pacote|total)/i);
    if (contractValueKey) {
      mappedData.contractValue = normalizeAmount(rawData[contractValueKey]);
    }

    // Extract down payment (optional)
    const downPaymentKey = findKeyByPattern(rawData, /(entrada|sinal|depósito|down.?payment)/i);
    if (downPaymentKey) {
      mappedData.downPayment = normalizeAmount(rawData[downPaymentKey]);
    }

    // Extract status (optional)
    const statusKey = findKeyByPattern(rawData, /status/i);
    if (statusKey) {
      mappedData.status = normalizeStatus(rawData[statusKey]);
    }

    // Extract next action (optional)
    const nextActionKey = findKeyByPattern(rawData, /(próxima|próximo|next).*(ação|passo|action|step)/i);
    if (nextActionKey) {
      mappedData.nextAction = normalizeNextAction(rawData[nextActionKey]);
    }

    // Extract event category (optional)
    const categoryKey = findKeyByPattern(rawData, /(categoria|tipo|category|type).*(evento|event)/i);
    if (categoryKey) {
      mappedData.eventCategory = normalizeEventCategory(rawData[categoryKey]);
    }

    // Extract notes (optional)
    const notesKey = findKeyByPattern(rawData, /(notas|observa|notes|obs)/i);
    if (notesKey) {
      mappedData.notes = String(rawData[notesKey]).trim();
    }
  } catch (error) {
    console.error('Error mapping client data:', error);
  }

  return mappedData;
};

// Helper function to find keys in object that match a pattern
const findKeyByPattern = (obj: Record<string, any>, pattern: RegExp): string | null => {
  const keys = Object.keys(obj);
  for (const key of keys) {
    if (pattern.test(key)) {
      return key;
    }
  }
  return null;
};
