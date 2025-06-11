
import { z } from "zod";
import { Client, ClientStatus, NextAction, EventCategory } from "@/utils/types";

export const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  coupleName: z.string().optional(),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  weddingDate: z.string().nullable(),
  weddingStartTime: z.string().optional(),
  weddingEndTime: z.string().optional(),
  contractValue: z.number().min(0, "Valor deve ser positivo"),
  downPayment: z.number().min(0, "Entrada deve ser positiva"),
  status: z.string(),
  nextAction: z.string(),
  eventCategory: z.string(),
  eventLocation: z.string().optional(),
  preWeddingDate: z.string().nullable(),
  preWeddingStartTime: z.string().optional(),
  preWeddingEndTime: z.string().optional(),
  contractLink: z.string().optional(),
  hasPreWedding: z.boolean(),
  autoUpdateNextAction: z.boolean().optional(), // Add automation field
  notes: z.string().optional(),
});

export type ClientFormValues = z.infer<typeof formSchema>;

export interface ClientFormProps {
  client?: Client;
  onSubmit: (data: ClientFormValues) => void;
  isSubmitting?: boolean;
}
