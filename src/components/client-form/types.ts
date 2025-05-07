
import { z } from "zod";
import { Client } from "@/utils/types";

export const formSchema = z.object({
  name: z.string().min(1, { message: "O nome é obrigatório" }),
  coupleName: z.string().optional(),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().min(1, { message: "O telefone é obrigatório" }),
  weddingDate: z.string().nullable(),
  weddingStartTime: z.string().optional(),
  weddingEndTime: z.string().optional(),
  contractValue: z.coerce.number().min(0, { message: "O valor deve ser positivo" }),
  downPayment: z.coerce.number().min(0, { message: "O valor deve ser positivo" }),
  status: z.enum(["orçamento enviado", "follow-up", "fechado", "em andamento", "pago"]),
  nextAction: z.enum(["responder", "enviar proposta", "editar", "entregar", "nenhuma"]),
  eventCategory: z.enum(["Casamento", "Aniversario", "Civil", "Ensaio Estudio", "Ensaio externo", "Evento Corporativo"]),
  eventLocation: z.string().optional(),
  preWeddingDate: z.string().nullable(),
  preWeddingStartTime: z.string().optional(),
  preWeddingEndTime: z.string().optional(),
  contractLink: z.string().optional(),
  notes: z.string().optional(),
})
.refine(data => data.downPayment <= data.contractValue, {
  message: "O valor da entrada não pode ser maior que o valor do contrato",
  path: ["downPayment"],
})
.refine(
  data => !data.weddingStartTime || !data.weddingEndTime || data.weddingStartTime <= data.weddingEndTime,
  {
    message: "O horário de término deve ser após o horário de início",
    path: ["weddingEndTime"],
  }
)
.refine(
  data => !data.preWeddingStartTime || !data.preWeddingEndTime || data.preWeddingStartTime <= data.preWeddingEndTime,
  {
    message: "O horário de término do pré-wedding deve ser após o horário de início",
    path: ["preWeddingEndTime"],
  }
);

export type ClientFormValues = z.infer<typeof formSchema>;

export interface ClientFormProps {
  client?: Client;
  onSubmit: (data: ClientFormValues) => void;
  isSubmitting?: boolean;
}
