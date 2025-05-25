
export type ClientStatus =
  | "orçamento enviado"
  | "proposta enviada"
  | "aguardando resposta"
  | "contrato assinado"
  | "pré-wedding"
  | "casamento"
  | "entregue"
  | "cancelado";

export type NextAction =
  | "enviar proposta"
  | "enviar contrato"
  | "agendar reunião"
  | "confirmar data"
  | "acompanhar"
  | "nenhuma";

export type EventCategory =
  | "Casamento"
  | "Debutante"
  | "Aniversário"
  | "Corporativo"
  | "Outro";

export interface Client {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  name: string;
  coupleName?: string;
  email: string;
  phone: string;
  weddingDate?: string | null;
  weddingStartTime?: string;
  weddingEndTime?: string;
  contractValue: number;
  downPayment: number;
  status: ClientStatus;
  nextAction: NextAction;
  notes?: string;
  eventCategory: EventCategory;
  eventLocation?: string;
  preWeddingDate?: string | null;
  preWeddingStartTime?: string;
  preWeddingEndTime?: string;
  contractLink?: string;
  hasPreWedding?: boolean;
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
  payments?: Payment[];
}

export interface Payment {
  id: string;
  createdAt: string;
  clientId: string;
  date: string;
  amount: number;
  paymentMethod: string;
  notes?: string;
  paymentStatus?: string;
  scheduledDate?: string | null;
}

export interface Transaction {
  id: string;
  createdAt: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
}

export interface FinancialCategory {
  id: string;
  createdAt: string;
  name: string;
  type: "income" | "expense";
}

export interface CalendarEvent {
  id: string;
  clientId?: string; // Add optional clientId field
  title: string;
  description?: string;
  date: string; // DD/MM/YYYY format
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  type: 'wedding' | 'pre-wedding' | 'meeting' | 'other';
  color: string;
}
