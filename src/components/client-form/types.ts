
import { z } from "zod";
import { Client } from "@/utils/types";

export const formSchema = z.object({
  name: z.string().min(1, { message: "O nome é obrigatório" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().min(1, { message: "O telefone é obrigatório" }),
  weddingDate: z.date().nullable(),
  contractValue: z.coerce.number().min(0, { message: "O valor deve ser positivo" }),
  downPayment: z.coerce.number().min(0, { message: "O valor deve ser positivo" }),
  status: z.enum(["orçamento enviado", "follow-up", "fechado", "em andamento", "pago"]),
  nextAction: z.enum(["responder", "enviar proposta", "editar", "entregar", "nenhuma"]),
  notes: z.string().optional(),
  eventCategory: z.string().min(1, { message: "Selecione uma categoria" }),
})
.refine(data => data.downPayment <= data.contractValue, {
  message: "O valor da entrada não pode ser maior que o valor do contrato",
  path: ["downPayment"],
});

export type ClientFormValues = z.infer<typeof formSchema>;

export interface ClientFormProps {
  client?: Client;
  onSubmit: (data: ClientFormValues) => void;
  isSubmitting?: boolean;
}
