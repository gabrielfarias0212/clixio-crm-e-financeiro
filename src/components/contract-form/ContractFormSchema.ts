
import { z } from "zod";

export const contractFormSchema = z.object({
  // Contratante data
  brideName: z.string().min(3, "Nome da noiva é obrigatório"),
  groomName: z.string().min(3, "Nome do noivo é obrigatório"),
  brideId: z.string().min(5, "RG da contratante é obrigatório"),
  brideCpf: z.string().min(11, "CPF da contratante é obrigatório"),
  contactPhone: z.string().min(10, "Telefone para contato é obrigatório"),
  contactEmail: z.string().email("E-mail inválido"),
  completeAddress: z.string().min(10, "Endereço completo é obrigatório"),
  
  // Event data
  eventDate: z.string().min(1, "Data do evento é obrigatória"),
  eventTime: z.string().min(1, "Horário do evento é obrigatório"),
  eventLocation: z.string().min(3, "Local do evento é obrigatório"),
  eventAddress: z.string().min(10, "Endereço do evento é obrigatório"),
  contractedPackage: z.string().min(3, "Pacote contratado é obrigatório"),
  ceremonialTeam: z.string().optional(),
  hasExclusivity: z.boolean(),
  
  // Financial data
  totalValue: z.number().min(1, "Valor total é obrigatório"),
  paymentMethod: z.string().min(1, "Forma de pagamento é obrigatória"),
  installmentsInfo: z.string().optional(),
  finalPaymentDate: z.string().optional(),
  
  // Additional information
  observations: z.string().optional(),
  allowsPortfolioUsage: z.boolean(),
  acceptsTerms: z.boolean().refine(val => val === true, {
    message: "Você precisa aceitar os termos e condições",
  })
});

export type ContractFormValues = z.infer<typeof contractFormSchema>;

export const paymentMethods = [
  { value: "pix", label: "PIX" },
  { value: "boleto", label: "Boleto Bancário" },
  { value: "cartao", label: "Cartão de Crédito/Débito" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "transferencia", label: "Transferência Bancária" },
];
