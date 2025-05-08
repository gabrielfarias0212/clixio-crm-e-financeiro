
import { useState } from "react";
import { Payment } from "@/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";

import { Form } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { PaymentAmountField } from "./PaymentAmountField";
import { PaymentDateFields } from "./PaymentDateFields";
import { PaymentStatusField } from "./PaymentStatusField";
import { PaymentNotesField } from "./PaymentNotesField";
import { paymentFormSchema, PaymentFormValues } from "./paymentFormSchema";

interface EditPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment;
  onSave: (paymentId: string, updates: Partial<Payment>) => Promise<void>;
  isSubmitting: boolean;
}

export function EditPaymentDialog({ 
  open, 
  onOpenChange, 
  payment, 
  onSave,
  isSubmitting 
}: EditPaymentDialogProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: payment.amount,
      date: payment.date,
      payment_status: payment.payment_status || "pendente",
      notes: payment.notes || "",
      due_date: payment.due_date || "",
    },
  });

  async function onSubmit(data: PaymentFormValues) {
    try {
      setFormError(null);
      await onSave(payment.id, {
        amount: data.amount,
        date: data.date,
        payment_status: data.payment_status,
        notes: data.notes,
        due_date: data.due_date || undefined
      });
    } catch (error) {
      console.error("Error saving payment:", error);
      setFormError("Erro ao atualizar pagamento. Tente novamente.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Pagamento</DialogTitle>
        </DialogHeader>
        
        <FormProvider {...form}>
          <Form>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded">
                  {formError}
                </div>
              )}

              <PaymentAmountField />
              <PaymentDateFields />
              <PaymentStatusField />
              <PaymentNotesField />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
