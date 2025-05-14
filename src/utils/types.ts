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

// Update the AlertItem type in the same file to include the 'due_payment' type
export interface AlertItem {
  type: "task" | "payment" | "due_payment" | "event";  // Includes all required types
  title: string;
  description: string;
  client: Client;
  date: Date;
  payment?: Payment;
  urgency?: "high" | "medium" | "low";
}

export interface ContractFormSubmission {
  id: string;
  clientId: string;
  createdAt: string;
  updatedAt: string;
  
  // Contratante data
  brideName: string;
  groomName: string;
  brideId: string;
  brideCpf: string;
  contactPhone: string;
  contactEmail: string;
  completeAddress: string;
  
  // Event data
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventAddress: string;
  contractedPackage: string;
  ceremonialTeam?: string;
  hasExclusivity: boolean;
  
  // Financial data
  totalValue: number;
  paymentMethod: string;
  installmentsInfo?: string;
  finalPaymentDate?: string;
  
  // Additional information
  observations?: string;
  allowsPortfolioUsage: boolean;
  acceptsTerms: boolean;
  
  // Form access
  accessToken: string;
  formStatus: 'pending' | 'completed' | 'approved';
}

export interface ContractFormInput {
  // All required fields match the ContractFormValues from the schema
  brideName: string;
  groomName: string;
  brideId: string;
  brideCpf: string;
  contactPhone: string;
  contactEmail: string;
  completeAddress: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventAddress: string;
  contractedPackage: string;
  hasExclusivity: boolean;
  totalValue: number;
  paymentMethod: string;
  acceptsTerms: boolean;
  // Optional fields
  ceremonialTeam?: string;
  installmentsInfo?: string;
  finalPaymentDate?: string;
  observations?: string;
  allowsPortfolioUsage: boolean;
}
