
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

const paymentFormSchema = z.object({
  amount: z.coerce.number().positive({ message: "O valor deve ser maior que zero" }),
  date: z.date(),
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

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: maxAmount > 0 ? maxAmount : 0,
      date: new Date(),
      notes: "",
    },
  });

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
      date: data.date,
      notes: data.notes,
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
          name="date"
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
                        format(field.value, "dd/MM/yyyy")
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
                    selected={field.value || undefined}
                    onSelect={field.onChange}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

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
            Registrar Pagamento
          </Button>
        </div>
      </form>
    </Form>
  );
}
