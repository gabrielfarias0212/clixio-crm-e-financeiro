
import { Client, ClientStatus, NextAction, EventCategory } from "@/utils/types";
import { formatDateForSupabase } from "@/utils/supabase/base";
import { 
  normalizeStatus, 
  normalizeNextAction, 
  normalizeEventCategory,
  normalizeDate,
  normalizePhoneNumber
} from "./utils/normalizers";
import { dateToString } from "@/utils/dateUtils";

/**
 * Maps data from an Excel/CSV row to a Client object
 */
export function mapClientData(row: any): Partial<Client> {
  // Helper function to get property with various possible column names
  function getProperty(options: string[]): string | null {
    for (const option of options) {
      if (row[option] !== undefined && row[option] !== null && row[option] !== '') {
        return String(row[option]).trim();
      }
    }
    return null;
  }

  // Get client name
  const name = getProperty([
    'nome', 'Nome', 'nome do cliente', 'Nome do Cliente', 'cliente', 'Cliente',
    'name', 'Name', 'client name', 'Client Name'
  ]);

  // Get couple name
  const coupleName = getProperty([
    'casal', 'Casal', 'nome do casal', 'Nome do Casal', 'couple name', 'Couple Name',
    'partner', 'Partner', 'cônjuge', 'Cônjuge'
  ]);

  // Get email
  const email = getProperty([
    'email', 'Email', 'e-mail', 'E-mail', 'contato', 'Contato'
  ]);

  // Get phone
  const rawPhone = getProperty([
    'telefone', 'Telefone', 'tel', 'Tel', 'celular', 'Celular', 'whatsapp', 'Whatsapp',
    'phone', 'Phone', 'mobile', 'Mobile'
  ]);

  // Get wedding date
  const rawWeddingDate = getProperty([
    'data', 'Data', 'data do evento', 'Data do Evento', 'evento', 'Evento',
    'data de casamento', 'Data de Casamento', 'data casamento', 'Data Casamento',
    'date', 'Date', 'event date', 'Event Date', 'wedding date', 'Wedding Date'
  ]);

  // Get meeting date
  const rawMeetingDate = getProperty([
    'data reunião', 'Data Reunião', 'data da reunião', 'Data da Reunião',
    'meeting date', 'Meeting Date', 'reunião', 'Reunião'
  ]);

  // Get contract value
  const rawContractValue = getProperty([
    'valor', 'Valor', 'valor do contrato', 'Valor do Contrato', 'valor contrato', 'Valor Contrato',
    'preço', 'Preço', 'price', 'Price', 'contract value', 'Contract Value', 'value', 'Value'
  ]);

  // Get down payment
  const rawDownPayment = getProperty([
    'entrada', 'Entrada', 'valor de entrada', 'Valor de Entrada', 'valor entrada', 'Valor Entrada',
    'down payment', 'Down Payment', 'sinal', 'Sinal'
  ]);

  // Get event location
  const eventLocation = getProperty([
    'local', 'Local', 'local do evento', 'Local do Evento', 'venue', 'Venue',
    'location', 'Location', 'endereço', 'Endereço', 'address', 'Address'
  ]);

  // Get status
  const rawStatus = getProperty([
    'status', 'Status', 'situação', 'Situação', 'state', 'State'
  ]);

  // Get next action
  const rawNextAction = getProperty([
    'próxima ação', 'Próxima Ação', 'próxima ação', 'Próxima Ação', 'ação', 'Ação',
    'next action', 'Next Action', 'next step', 'Next Step'
  ]);

  // Get event category
  const rawEventCategory = getProperty([
    'categoria', 'Categoria', 'tipo de evento', 'Tipo de Evento', 'tipo evento', 'Tipo Evento',
    'category', 'Category', 'event type', 'Event Type'
  ]);

  // Get contract link
  const contractLink = getProperty([
    'link contrato', 'Link Contrato', 'contrato', 'Contrato', 'contract', 'Contract',
    'contract link', 'Contract Link'
  ]);

  // Get notes
  const notes = getProperty([
    'notas', 'Notas', 'observações', 'Observações', 'obs', 'Obs',
    'notes', 'Notes', 'comments', 'Comments'
  ]);

  // Parse values
  const phone = normalizePhoneNumber(rawPhone);
  
  // Parse wedding date as string
  let weddingDate: string | null = null;
  if (rawWeddingDate) {
    const date = normalizeDate(rawWeddingDate);
    weddingDate = date ? dateToString(date) : null;
  }

  // Parse meeting date as string
  let meetingDate: string | null = null;
  if (rawMeetingDate) {
    const date = normalizeDate(rawMeetingDate);
    meetingDate = date ? dateToString(date) : null;
  }

  // Parse contract value
  let contractValue = 0;
  if (rawContractValue) {
    contractValue = parseFloat(
      String(rawContractValue)
        .replace(/[^0-9.,]/g, '')
        .replace(/\./g, '')
        .replace(',', '.')
    ) || 0;
  }

  // Parse down payment
  let downPayment = 0;
  if (rawDownPayment) {
    downPayment = parseFloat(
      String(rawDownPayment)
        .replace(/[^0-9.,]/g, '')
        .replace(/\./g, '')
        .replace(',', '.')
    ) || 0;
  }

  // Handle status
  const status: ClientStatus = normalizeStatus(rawStatus);
  
  // Handle next action
  const nextAction: NextAction = normalizeNextAction(rawNextAction);
  
  // Handle event category
  const eventCategory: EventCategory = normalizeEventCategory(rawEventCategory);

  return {
    name: name || 'Cliente sem nome',
    coupleName: coupleName || '',
    email: email || '',
    phone: phone || '',
    weddingDate,
    contractValue,
    downPayment,
    status,
    nextAction,
    eventCategory,
    eventLocation: eventLocation || '',
    contractLink: contractLink || '',
    meetingDate,
    notes: notes || ''
  };
}
