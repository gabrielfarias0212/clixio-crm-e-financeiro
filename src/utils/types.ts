
export type ClientStatus = 
  | "orçamento enviado" 
  | "follow-up" 
  | "fechado" 
  | "em andamento" 
  | "pago"
  | "entregue";

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
  | "venda de produtos"
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

export type ProductType = "album" | "moldura" | "ensaio" | "pacote" | "outros";

export type ProductOrderStatus = "pedido" | "producao" | "pronto" | "entregue" | "cancelado";

export type ProductPaymentStatus = "pendente" | "parcial" | "pago";

export interface Payment {
  id: string;
  amount: number;
  date: string;
  notes?: string;
  due_date?: string;
  payment_status?: PaymentStatus;
}

export interface ProductPayment {
  id: string;
  product_sale_id: string;
  amount: number;
  due_date: string;
  payment_date?: string;
  status: PaymentStatus;
  notes?: string;
  created_at: string;
}

export interface ProductSale {
  id: string;
  user_id: string;
  client_id?: string;
  product_name: string;
  product_type: ProductType;
  description?: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  delivery_date?: string;
  payment_method: string;
  payment_status: ProductPaymentStatus;
  order_status: ProductOrderStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  client?: Client;
  payments?: ProductPayment[];
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

export interface AlertItem {
  type: "task" | "payment" | "due_payment" | "event" | "pre_wedding";
  title: string;
  description: string;
  client: Client;
  date: Date;
  payment?: Payment;
  urgency?: "high" | "medium" | "low";
  isOverdue?: boolean;
}
