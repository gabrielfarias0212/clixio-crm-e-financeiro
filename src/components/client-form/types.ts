
import * as z from "zod";
import { Client } from "@/utils/types";

export const formSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  coupleName: z.string().optional(),
  email: z.string().email({
    message: "Email inválido.",
  }),
  phone: z.string().min(10, {
    message: "Telefone deve ter pelo menos 10 caracteres.",
  }),
  weddingDate: z.string().nullable(),
  weddingStartTime: z.string().optional(),
  weddingEndTime: z.string().optional(),
  contractValue: z.number(),
  downPayment: z.number(),
  status: z.string(),
  nextAction: z.string(),
  eventCategory: z.string(),
  eventLocation: z.string().optional(),
  preWeddingDate: z.string().nullable(),
  preWeddingStartTime: z.string().optional(),
  preWeddingEndTime: z.string().optional(),
  contractLink: z.string().optional(),
  hasPreWedding: z.boolean().optional(),
  notes: z.string().optional(),
});

export interface ClientFormProps {
    client?: Client;
    onSubmit: (values: ClientFormValues) => void;
    isSubmitting?: boolean;
}

export interface ClientFormValues {
  name: string;
  coupleName: string;
  email: string;
  phone: string;
  weddingDate: string | null;
  weddingStartTime: string;
  weddingEndTime: string;
  contractValue: number;
  downPayment: number;
  status: string;
  nextAction: string;
  eventCategory: string;
  eventLocation: string;
  preWeddingDate: string | null;
  preWeddingStartTime: string;
  preWeddingEndTime: string;
  contractLink: string;
  hasPreWedding: boolean;
  notes: string;
}
