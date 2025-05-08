
import { z } from "zod";

export const paymentFormSchema = z.object({
  amount: z.coerce.number().positive({ message: "O valor deve ser maior que zero" }),
  date: z.string().min(1, { message: "A data é obrigatória" }),
  payment_status: z.enum(["pendente", "pago", "atrasado"]),
  notes: z.string().optional(),
  due_date: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;
