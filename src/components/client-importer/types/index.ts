
import { EventCategory, ClientStatus, NextAction } from "@/utils/types";

export interface RawClientData {
  [key: string]: any;
}

export interface MappedClientData {
  name: string;
  coupleName?: string;
  email: string;
  phone: string;
  weddingDate: Date | null;
  contractValue: number;
  downPayment: number;
  status: ClientStatus;
  nextAction: NextAction;
  eventCategory: EventCategory;
  notes: string;
}
