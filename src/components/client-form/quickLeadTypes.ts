import * as z from "zod";

// Simplified schema for quick lead entry
export const quickLeadSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  phone: z.string().min(10, {
    message: "Telefone deve ter pelo menos 10 caracteres.",
  }),
  email: z.string().email({
    message: "Email inválido.",
  }),
  weddingDate: z.string().nullable().optional(),
  eventCategory: z.string().default("Casamento"),
  notes: z.string().optional(),
});

// Expanded schema for converted clients (full form)
export const expandedClientSchema = z.object({
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

export interface QuickLeadValues {
  name: string;
  phone: string;
  email: string;
  weddingDate?: string | null;
  eventCategory: string;
  notes?: string;
}

export interface QuickLeadFormProps {
  onSubmit: (values: QuickLeadValues) => void;
  isSubmitting?: boolean;
  onCancel: () => void;
}

// Helper function to determine if client is in lead stage
export const isLeadStage = (status: string): boolean => {
  return status === "primeiro_contato";
};

// Helper function to get appropriate schema based on status
export const getFormSchema = (status?: string) => {
  return isLeadStage(status || "primeiro_contato") ? quickLeadSchema : expandedClientSchema;
};