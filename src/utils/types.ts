export type WorkflowStage = 
  | 'evento_ensaio'
  | 'copia' 
  | 'backup'
  | 'curadoria'
  | 'edicao'
  | 'edicao_base'
  | 'edicao_final'
  | 'link_pronto'
  | 'link_enviado'
  | 'entrega_fisica'
  | 'album_em_andamento'
  | 'projeto_finalizado';

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

// Categorias são dinâmicas (tabela event_categories no banco)
export type EventCategory = string;

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

  // ── Workflow principal ──────────────────────────────
  weddingPhotographed?: boolean;  // Evento fotografado
  backupDone?: boolean;           // Cópia RAW+JPG para SSD (pré-wedding)
  curadoriaDone?: boolean;        // Curadoria no Aftershoot (pré-wedding)
  edicaoBaseDone?: boolean;       // Edição base do pré-wedding
  inEditing?: boolean;            // Edição final no Lightroom
  linkSent?: boolean;             // Link Wfolio enviado ao cliente
  boxDelivered?: boolean;         // Entrega física (pen drive)

  // ── Álbum (quando incluso no pacote) ───────────────
  hasAlbum?: boolean;             // Pacote inclui álbum?
  albumLinkSent?: boolean;        // Link enviado para cliente escolher fotos
  albumClientChose?: boolean;     // Cliente escolheu as fotos
  albumDiagrammed?: boolean;      // Álbum diagramado
  albumClientApproved?: boolean;  // Cliente aprovou o layout
  albumOrdered?: boolean;         // Pedido de produção feito

  // ── Campos legados (manter compatibilidade) ─────────
  albumDesigned?: boolean;
  albumApprovedDelivered?: boolean;
  isDelivered?: boolean;
  backupCompleted?: boolean;
  curationCompleted?: boolean;
  linkReady?: boolean;

  // ── Workflow stage e funil ──────────────────────────
  workflowStage?: WorkflowStage;
  salesFunnelStage: SalesFunnelStage;
  leadSource?: string;
  storageLocation?: string;
  semEntregaFisica?: boolean;  // Entrega somente digital (sem pen drive)
  packageId?: string | null;      // Pacote de serviço aplicado

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
  isEdited?: boolean;
  isDelivered?: boolean;
}

export interface AlertItem {
  type: "task" | "payment" | "due_payment" | "event" | "pre_wedding" | "calendar_event";
  title: string;
  description: string;
  client: Client;
  date: Date;
  payment?: Payment;
  event?: CalendarEvent;
  urgency?: "high" | "medium" | "low";
  isOverdue?: boolean;
}
// ── Adicionar ao final de src/utils/types.ts ──────────────────────────────────

export type MessageType =
  | "follow_up"
  | "cobranca"
  | "contrato"
  | "boas_vindas"
  | "personalizada";

export interface ClientMessage {
  id: string;
  client_id: string;
  user_id?: string;
  message_type: MessageType;
  message_text: string;
  sent_at: string;
  created_at: string;
}

// ── Forms Feature ──────────────────────────────────────────────────────────────

export type FormQuestionType = "text" | "multiple" | "boolean" | "scale";

export interface FormQuestion {
  id: string;
  type: FormQuestionType;
  question: string;
  required: boolean;
  options?: string[];   // only for "multiple"
  scaleMin?: number;    // for "scale", default 1
  scaleMax?: number;    // for "scale", default 5
}

export interface FormTemplate {
  id: string;
  user_id: string | null;
  title: string;
  description?: string;
  category?: string;
  questions: FormQuestion[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export type FormInstanceStatus = "pending" | "submitted" | "expired";

export interface FormInstance {
  id: string;
  user_id: string;
  client_id: string;
  template_id?: string;
  title: string;
  questions: FormQuestion[];
  token: string;
  status: FormInstanceStatus;
  sent_at?: string;
  submitted_at?: string;
  expires_at?: string;
  created_at: string;
}

export interface FormResponse {
  id: string;
  instance_id: string;
  answers: Record<string, string | string[] | boolean | number>;
  submitted_at: string;
}
