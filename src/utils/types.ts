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
  | "nenhuma"
  | "agendar reunião";

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
  | "Evento Corporativo"
  | "15 anos";

export type PaymentStatus = "pendente" | "pago" | "atrasado";

export interface Payment {
  id: string;
  amount: number;
  date: string;
  notes?: string;
  due_date?: string;
  payment_status?: PaymentStatus;
}

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  clientId?: string;
  paymentId?: string;
  createdAt: string;
}

export interface FinancialCategory {
  id: string;
  name: string;
  type: TransactionType;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  coupleName?: string;
  weddingDate: string | null;
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
  preWeddingDate: string | null;
  preWeddingStartTime?: string;
  preWeddingEndTime?: string;
  contractLink?: string;
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
  createdAt: string;
  updatedAt: string;
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
  date: string;
  startTime: string;
  endTime: string;
  type: EventType;
  color: EventColor;
  clientId?: string;
}
