
import { z } from "zod";
import { TransactionCategory, TransactionType } from "@/utils/types";

export const transactionFormSchema = z.object({
  type: z.enum(["entrada", "saída"]),
  category: z.string(),
  amount: z.coerce.number().positive({ message: "O valor deve ser maior que zero" }),
  date: z.string(),
  description: z.string().min(3, { message: "A descrição deve ter pelo menos 3 caracteres" }),
  clientId: z.string().optional(),
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;
