
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
  date: Date;
  notes?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  date: Date;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  clientId?: string;
  paymentId?: string;
  createdAt: Date;
}

export interface FinancialCategory {
  id: string;
  name: string;
  type: TransactionType;
  createdAt: Date;
}

export interface Client {
  id: string;
  name: string;
  coupleName?: string;
  weddingDate: Date | null;
  contractValue: number;
  status: ClientStatus;
  nextAction: NextAction;
  email: string;
  phone: string;
  notes: string;
  downPayment: number;
  eventCategory: EventCategory;
  payments: Payment[];
  createdAt: Date;
  updatedAt: Date;
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
  date: Date;
  time: string;
  type: EventType;
  color: EventColor;
  clientId?: string;
}
