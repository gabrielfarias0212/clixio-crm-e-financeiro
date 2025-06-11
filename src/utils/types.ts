
export type ClientStatus = 
  | "novo_lead"
  | "proposta_enviada" 
  | "negociacao"
  | "orçamento enviado" 
  | "follow-up" 
  | "fechado_aguardando_assinatura"
  | "fechado" 
  | "contrato_assinado"
  | "pre_wedding_agendado"
  | "pre_wedding_feito"
  | "em andamento"
  | "evento_principal_fotografado"
  | "galeria_entregue"
  | "album_aprovado_producao"
  | "caixinha_entregue"
  | "pago"
  | "entregue"
  | "contrato_concluido";

export type NextAction = 
  | "enviar_proposta"
  | "aguardar_resposta"
  | "negociar_condicoes"
  | "responder" 
  | "enviar proposta" 
  | "redigir_enviar_contrato"
  | "agendar_pre_wedding"
  | "editar_pre_wedding"
  | "fotografar_evento_principal"
  | "iniciar_edicao"
  | "editar" 
  | "entregar_galeria_digital"
  | "entregar" 
  | "aprovar_album"
  | "entregar_caixinha_final"
  | "agradecer_pedir_feedback"
  | "agendar reunião"
  | "nenhuma"
  | "nenhuma_acao_pendente";

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
  autoUpdateNextAction?: boolean; // New field for automation control
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

// New interfaces for automation system
export interface ClientStatusHistory {
  id: string;
  clientId: string;
  previousStatus?: string;
  newStatus: string;
  previousNextAction?: string;
  newNextAction?: string;
  changeType: 'manual' | 'automatic' | 'system';
  changedByUserId?: string;
  notes?: string;
  createdAt: string;
}

export type StatusToActionMapping = Record<ClientStatus, NextAction>;

// Status-to-action mapping for automation
export const DEFAULT_STATUS_ACTION_MAPPING: StatusToActionMapping = {
  "novo_lead": "enviar_proposta",
  "proposta_enviada": "aguardar_resposta",
  "negociacao": "negociar_condicoes",
  "orçamento enviado": "aguardar_resposta",
  "follow-up": "responder",
  "fechado_aguardando_assinatura": "redigir_enviar_contrato",
  "fechado": "agendar_pre_wedding",
  "contrato_assinado": "agendar_pre_wedding",
  "pre_wedding_agendado": "fotografar_evento_principal",
  "pre_wedding_feito": "editar_pre_wedding",
  "em andamento": "entregar_galeria_digital",
  "evento_principal_fotografado": "iniciar_edicao",
  "galeria_entregue": "aprovar_album",
  "album_aprovado_producao": "entregar_caixinha_final",
  "caixinha_entregue": "agradecer_pedir_feedback",
  "pago": "entregar_galeria_digital",
  "entregue": "nenhuma_acao_pendente",
  "contrato_concluido": "nenhuma_acao_pendente"
};
