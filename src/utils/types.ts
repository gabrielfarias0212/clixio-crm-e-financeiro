
export type ClientStatus = 
  | "orçamento enviado" 
  | "follow-up" 
  | "fechado" 
  | "em andamento" 
  | "pago";

export type NextAction = 
  | "responder" 
  | "enviar proposta" 
  | "editar" 
  | "entregar" 
  | "nenhuma";

export type TransactionType = "entrada" | "saída";

export type TransactionCategory = 
  | "pagamento de cliente" 
  | "despesa operacional"
  | "material"
  | "serviço terceirizado"
  | "imposto"
  | "outras receitas"
  | "outras despesas"
  | string;

export type EventCategory = 
  | "Casamento"
  | "Aniversario"
  | "Civil"
  | "Ensaio Estudio"
  | "Ensaio externo"
  | "Evento Corporativo";

export interface Payment {
  id: string;
  amount: number;
  date: string; // Changed from Date to string
  notes?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  date: string; // Changed from Date to string
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  clientId?: string;
  paymentId?: string;
  createdAt: string; // Changed from Date to string
}

export interface FinancialCategory {
  id: string;
  name: string;
  type: TransactionType;
  createdAt: string; // Changed from Date to string
}

export interface Client {
  id: string;
  name: string;
  coupleName?: string;
  weddingDate: string | null; // Changed from Date to string
  weddingStartTime?: string;
  weddingEndTime?: string;
  contractValue: number;
  status: ClientStatus;
  nextAction: NextAction;
  email: string;
  phone: string;
  notes: string;
  downPayment: number;
  eventCategory: EventCategory;
  eventLocation?: string;
  preWeddingDate: string | null; // Changed from Date to string
  preWeddingStartTime?: string;
  preWeddingEndTime?: string;
  contractLink?: string;
  // Delivery workflow fields
  preWeddingScheduled?: boolean;
  preWeddingCompleted?: boolean;
  preWeddingDelivered?: boolean;
  weddingPhotographed?: boolean;
  inEditing?: boolean;
  linkSent?: boolean;
  boxDelivered?: boolean;
  albumDesigned?: boolean;
  albumApprovedDelivered?: boolean;
  payments: Payment[];
  createdAt: string; // Changed from Date to string
  updatedAt: string; // Changed from Date to string
}

export type EventType = 
  | 'custom' 
  | 'client' 
  | 'meeting' 
  | 'photoshoot' 
  | 'delivery' 
  | 'editing';

export type EventColor = 
  | 'blue' 
  | 'green' 
  | 'red' 
  | 'yellow' 
  | 'purple' 
  | 'gray';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // Changed from Date to string
  startTime: string;
  endTime: string;
  type: EventType;
  color: EventColor;
  clientId?: string;
}
