
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

export interface Payment {
  id: string;
  amount: number;
  date: Date;
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  weddingDate: Date | null;
  contractValue: number;
  status: ClientStatus;
  nextAction: NextAction;
  email: string;
  phone: string;
  notes: string;
  downPayment: number;
  payments: Payment[];
  createdAt: Date;
  updatedAt: Date;
}
