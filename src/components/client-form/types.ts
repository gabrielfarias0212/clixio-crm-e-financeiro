
import * as z from "zod";
import { Client } from "@/utils/types";
import { isLeadStage } from "./quickLeadTypes";

// Dynamic schema based on client status
export const createFormSchema = (status?: string) => {
  const isLead = isLeadStage(status || "primeiro_contato");
  
  if (isLead) {
    // Simplified schema for leads
    return z.object({
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
      contractValue: z.number().optional().default(0),
      downPayment: z.number().optional().default(0),
      status: z.string(),
      eventCategory: z.string(),
      eventLocation: z.string().optional(),
      preWeddingDate: z.string().nullable(),
      preWeddingStartTime: z.string().optional(),
      preWeddingEndTime: z.string().optional(),
      contractLink: z.string().optional(),
      hasPreWedding: z.boolean().optional(),
      notes: z.string().optional(),
      leadSource: z.string().optional().default("Não informado"),
      packageId: z.string().nullable().optional(),
    });
  }
  
  // Full schema for converted clients
  return z.object({
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
    eventCategory: z.string(),
    eventLocation: z.string().optional(),
    preWeddingDate: z.string().nullable(),
    preWeddingStartTime: z.string().optional(),
    preWeddingEndTime: z.string().optional(),
    contractLink: z.string().optional(),
    hasPreWedding: z.boolean().optional(),
    notes: z.string().optional(),
    leadSource: z.string().optional().default("Não informado"),
  packageId: z.string().nullable().optional(),
  });
};

// Default schema for backward compatibility
export const formSchema = createFormSchema();

export interface ClientFormProps {
    client?: Client;
    onSubmit: (values: ClientFormValues) => void;
    isSubmitting?: boolean;
    isLeadForm?: boolean;
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
  eventCategory: string;
  eventLocation: string;
  preWeddingDate: string | null;
  preWeddingStartTime: string;
  preWeddingEndTime: string;
  contractLink: string;
  hasPreWedding: boolean;
  notes: string;
  leadSource?: string;
}
