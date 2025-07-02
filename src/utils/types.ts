export type ClientStatus = 
  | "primeiro_contato"
  | "orçamento enviado" 
  | "negociacao"
  | "fechado"
  | "projeto_finalizado"
  | "contrato_perdido";

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
  | "pró-labore"
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

export type SalesFunnelStage = 
  | "primeiro_contato" 
  | "orcamento_enviado" 
  | "negociacao" 
  | "contrato_fechado" 
  | "projeto_finalizado"
  | "contrato_perdido";

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
  hasPreWedding?: boolean;
  preWeddingScheduled?: boolean;
  preWeddingCompleted?: boolean;
  preWeddingDelivered?: boolean;
  weddingPhotographed?: boolean;
  inEditing?: boolean;
  linkSent?: boolean;
  boxDelivered?: boolean;
  albumDesigned?: boolean;
  albumApprovedDelivered?: boolean;
  isDelivered?: boolean;
  salesFunnelStage: SalesFunnelStage;
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
  | 'editing'
  | 'pre-wedding';

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

// Update the AlertItem type to include the 'pre_wedding' type and 'isOverdue' property
export interface AlertItem {
  type: "task" | "payment" | "due_payment" | "event" | "pre_wedding";
  title: string;
  description: string;
  client: Client;
  date: Date;
  payment?: Payment;
  urgency?: "high" | "medium" | "low";
  isOverdue?: boolean;  // Added isOverdue flag for payment alerts
}

// New types for Services & Products system
export interface ServiceCatalogItem {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  default_price: number;
  category?: string;
  estimated_time?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductCatalogItem {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  default_price: number;
  category?: string;
  product_type: string;
  variations?: Record<string, any>;
  stock_control: boolean;
  current_stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceSale {
  id: string;
  user_id: string;
  client_id?: string;
  service_catalog_id?: string;
  service_name: string;
  amount: number;
  sale_date: string;
  payment_method: string;
  payment_status: string;
  installments: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface QuickTransaction {
  id: string;
  user_id: string;
  client_id?: string;
  transaction_type: 'service' | 'product';
  item_name: string;
  catalog_id?: string;
  amount: number;
  sale_date: string;
  payment_method: string;
  payment_status: string;
  installments: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface QuickSaleFormData {
  type: 'service' | 'product';
  catalogItemId?: string;
  clientId?: string;
  customName?: string;
  amount: number;
  saleDate: string;
  paymentMethod: string;
  installments: number;
  notes?: string;
}
