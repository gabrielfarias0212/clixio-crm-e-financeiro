
import { useState } from "react";
import { Client, Payment } from "@/utils/types";
import { PaymentHistory } from "./payments/PaymentHistory";
import { AddPaymentForm } from "./AddPaymentForm";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { DialogContent, Dialog, DialogTrigger } from "@/components/ui/dialog";
import { createPayment, deletePayment, updatePayment } from "@/utils/supabaseUtils";
import { toast } from "sonner";
import { useTransactions } from "@/contexts/TransactionsContext";

export interface ClientPaymentsProps {
  client: Client;
  onUpdate?: (updatedClient: Client) => void;
}

export function ClientPayments({ client, onUpdate }: ClientPaymentsProps) {
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refreshTransactions } = useTransactions();
  
  const handlePaymentAdded = async (updatedClient: Client) => {
    try {
      setIsSubmitting(true);
      
      // Get the last payment (the one just added)
      const newPayment = updatedClient.payments[updatedClient.payments.length - 1];
      
      // Save the payment to the database
      await createPayment({
        clientId: client.id,
        amount: newPayment.amount,
        date: newPayment.date,
        notes: newPayment.notes,
        due_date: newPayment.due_date,
        payment_status: newPayment.payment_status
      });
      
      // Update the UI
      if (onUpdate) {
        onUpdate(updatedClient);
      }

      // Refresh transactions to update the financial summary chart
      refreshTransactions();
      
      setIsAddPaymentOpen(false);
      toast.success("Pagamento registrado com sucesso! O fluxo de caixa e resumo financeiro foram atualizados.");
    } catch (error) {
      console.error("Error adding payment:", error);
      toast.error("Erro ao registrar o pagamento. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      setIsSubmitting(true);
      
      // Delete the payment from the database (this will also delete related transaction)
      await deletePayment(paymentId);
      
      // Update client locally by removing the payment
      const updatedClient = {
        ...client,
        payments: client.payments.filter(payment => payment.id !== paymentId)
      };
      
      // Update the UI
      if (onUpdate) {
        onUpdate(updatedClient);
      }

      // Refresh transactions to update the financial summary chart
      refreshTransactions();
      
      toast.success("Pagamento excluído com sucesso! O fluxo de caixa e resumo financeiro foram atualizados.");
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast.error("Erro ao excluir o pagamento. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePayment = async (updatedPayment: Payment) => {
    try {
      setIsSubmitting(true);

      // Update client locally with the updated payment
      const updatedClient = {
        ...client,
        payments: client.payments.map(payment => 
          payment.id === updatedPayment.id ? updatedPayment : payment
        )
      };

      // Update the UI
      if (onUpdate) {
        onUpdate(updatedClient);
      }

      // Refresh transactions to update the financial summary chart
      refreshTransactions();

      toast.success("Pagamento atualizado com sucesso! O fluxo de caixa e resumo financeiro foram atualizados.");
    } catch (error) {
      console.error("Error updating payment:", error);
      toast.error("Erro ao atualizar o pagamento. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Pagamentos</h2>
        <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <PlusIcon className="h-4 w-4 mr-1" />
              Adicionar Pagamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <AddPaymentForm 
              client={client} 
              onSuccess={handlePaymentAdded}
              onCancel={() => setIsAddPaymentOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <PaymentHistory 
        payments={client.payments} 
        onDeletePayment={handleDeletePayment}
        onUpdatePayment={handleUpdatePayment}
        isDeleting={isSubmitting}
      />
    </div>
  );
}
