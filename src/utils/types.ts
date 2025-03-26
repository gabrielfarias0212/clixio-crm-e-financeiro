
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
  createdAt: Date;
  updatedAt: Date;
}
