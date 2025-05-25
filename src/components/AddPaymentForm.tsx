
import { useState } from "react";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from 'uuid';
import { Client, Payment } from "@/utils/types";
import { dateToString, stringToDate } from "@/utils/dateUtils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { addDays } from "date-fns";

const paymentFormSchema = z.object({
  amount: z.coerce.number().positive({ message: "O valor deve ser maior que zero" }),
  payment_type: z.enum(["immediate", "scheduled"], {
    required_error: "Selecione o tipo de pagamento",
  }),
  payment_date: z.string(),
  scheduled_date: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export interface AddPaymentFormProps {
  client: Client;
  onSuccess: (updatedClient: Client) => void;
  onCancel?: () => void;
}

export function AddPaymentForm({ client, onSuccess, onCancel }: AddPaymentFormProps) {
  const totalPaid = client.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const maxAmount = client.contractValue - totalPaid;
  
  // Data padrão para agendamento - 7 dias antes do evento (se disponível) ou próxima semana
  const defaultScheduledDate = client.weddingDate 
    ? dateToString(addDays(stringToDate(client.weddingDate) || new Date(), -7))
    : dateToString(addDays(new Date(), 7));

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: maxAmount > 0 ? maxAmount : 0,
      payment_type: "immediate",
      payment_date: dateToString(new Date()),
      scheduled_date: defaultScheduledDate,
      notes: "",
    },
  });

  const paymentType = form.watch("payment_type");

  const handleSubmit = (data: PaymentFormValues) => {
    if (data.amount > maxAmount) {
      form.setError("amount", { 
        type: "manual", 
        message: `O valor não pode exceder ${new Intl.NumberFormat('pt-BR', { 
          style: 'currency', 
          currency: 'BRL' 
        }).format(maxAmount)}`
      });
      return;
    }

    const newPayment: Payment = {
      id: uuidv4(),
      amount: data.amount,
      date: data.payment_type === "immediate" ? data.payment_date : data.scheduled_date || data.payment_date,
      notes: data.notes,
      payment_status: data.payment_type === "immediate" ? "pago" : "pendente",
      due_date: data.payment_type === "scheduled" ? data.scheduled_date : undefined,
    };

    // Create a new client object with the new payment added
    const updatedClient = {
      ...client,
      payments: [...client.payments, newPayment]
    };

    onSuccess(updatedClient);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor do Pagamento</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    R$
                  </span>
                  <Input 
                    type="number" 
                    placeholder="0,00" 
                    {...field} 
                    className="pl-8 focus:ring-1 focus:ring-black dark:focus:ring-white transition-shadow"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payment_type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tipo de Pagamento</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="immediate" id="immediate" />
                    <Label htmlFor="immediate">Pagamento à vista (realizado hoje)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="scheduled" id="scheduled" />
                    <Label htmlFor="scheduled">Agendamento de pagamento (data futura)</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {paymentType === "immediate" && (
          <FormField
            control={form.control}
            name="payment_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data do Pagamento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          field.value
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={stringToDate(field.value) || undefined}
                      onSelect={(date) => field.onChange(date ? dateToString(date) : "")}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Data em que o pagamento foi efetivamente realizado
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {paymentType === "scheduled" && (
          <FormField
            control={form.control}
            name="scheduled_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data Agendada para Pagamento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          field.value
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={stringToDate(field.value) || undefined}
                      onSelect={(date) => field.onChange(date ? dateToString(date) : "")}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Por padrão, 7 dias antes do evento. Este pagamento ficará pendente até ser marcado como pago.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Detalhes sobre o pagamento (opcional)"
                  className="resize-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-shadow"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {paymentType === "scheduled" 
                  ? "Ex: Segunda parcela do contrato, Pagamento final antes do evento, etc."
                  : "Ex: Entrada do contrato, Pagamento via PIX, etc."
                }
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit">
            {paymentType === "immediate" ? "Registrar Pagamento" : "Agendar Pagamento"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
