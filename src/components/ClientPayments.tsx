import { useState } from "react";
import { Client, Payment, PaymentStatus } from "@/utils/types";
import { PaymentHistory } from "./PaymentHistory";
import { AddPaymentForm } from "./AddPaymentForm";
import { MarkContractAsPaidDialog } from "./MarkContractAsPaidDialog";
import { Button } from "@/components/ui/button";
import { PlusIcon, CheckCircleIcon } from "lucide-react";
import { DialogContent, Dialog, DialogTrigger } from "@/components/ui/dialog";
import { createPayment, deletePayment, updatePaymentStatus, updatePaymentDueDate, markContractAsPaid } from "@/utils/supabaseUtils";
import { toast } from "sonner";
import { useTransactions } from "@/contexts/TransactionsContext";
import { createTransaction, deleteTransaction } from "@/utils/supabase/transactions";
import { useClients } from "@/contexts/ClientsContext";

export interface ClientPaymentsProps {
  client: Client;
  onUpdate?: (updatedClient: Client) => void;
}

export function ClientPayments({ client, onUpdate }: ClientPaymentsProps) {
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isMarkAsPaidOpen, setIsMarkAsPaidOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refreshTransactions } = useTransactions();
  const { refreshClients } = useClients();
  
  // Calculate if contract has pending payments
  const totalPaid = client.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = client.contractValue - totalPaid;
  const hasPendingPayments = pendingAmount > 0;
  
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
      
      // Find the original payment
      const originalPayment = client.payments.find(p => p.id === updatedPayment.id);
      if (!originalPayment) {
        toast.error("Pagamento não encontrado.");
        return;
      }

      // Update payment status if changed
      if (originalPayment.payment_status !== updatedPayment.payment_status) {
        const success = await updatePaymentStatus(updatedPayment.id, updatedPayment.payment_status!);
        if (!success) {
          toast.error("Erro ao atualizar o status do pagamento.");
          return;
        }

        // Handle transaction creation/deletion based on status change
        if (originalPayment.payment_status === "pendente" && updatedPayment.payment_status === "pago") {
          // Create transaction when marking as paid
          await createTransaction({
            amount: updatedPayment.amount,
            date: updatedPayment.date,
            type: 'entrada',
            category: 'pagamento de cliente',
            description: updatedPayment.notes ? `Pagamento de cliente: ${updatedPayment.notes}` : 'Pagamento de cliente',
            clientId: client.id,
            paymentId: updatedPayment.id
          });
        } else if (originalPayment.payment_status === "pago" && updatedPayment.payment_status !== "pago") {
          // Remove transaction when unmarking as paid
          // Note: This would require finding and deleting the related transaction
          // For now, we'll refresh transactions to keep consistency
        }
      }

      // Update due date if changed
      if (originalPayment.due_date !== updatedPayment.due_date && updatedPayment.due_date) {
        const success = await updatePaymentDueDate(updatedPayment.id, updatedPayment.due_date);
        if (!success) {
          toast.error("Erro ao atualizar a data de vencimento.");
          return;
        }
      }

      // Update client locally
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
      
      toast.success("Pagamento atualizado com sucesso!");
    } catch (error) {
      console.error("Error updating payment:", error);
      toast.error("Erro ao atualizar o pagamento. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkContractAsPaid = async (createTransaction: boolean) => {
    try {
      setIsSubmitting(true);
      
      console.log('Marking contract as paid for client:', client.id);
      
      const success = await markContractAsPaid(client.id, createTransaction);
      
      if (success) {
        // Refresh the clients data to get the updated payments
        await refreshClients();
        
        setIsMarkAsPaidOpen(false);
        
        const message = createTransaction 
          ? "Contrato marcado como pago! O fluxo de caixa e resumo financeiro foram atualizados."
          : "Contrato marcado como pago! Nenhuma transação foi criada no fluxo de caixa.";
        
        toast.success(message);
        
        // Refresh transactions if transaction was created
        if (createTransaction) {
          refreshTransactions();
        }
      } else {
        toast.error("Erro ao marcar contrato como pago. Tente novamente.");
      }
    } catch (error) {
      console.error("Error marking contract as paid:", error);
      toast.error("Erro ao marcar contrato como pago. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Pagamentos</h2>
        <div className="flex gap-2">
          {hasPendingPayments && (
            <Button 
              size="sm" 
              onClick={() => setIsMarkAsPaidOpen(true)}
              className="bg-green-600 hover:bg-green-700"
              disabled={isSubmitting}
            >
              <CheckCircleIcon className="h-4 w-4 mr-1" />
              Marcar como Pago
            </Button>
          )}
          <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" disabled={isSubmitting}>
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
      </div>
      
      <PaymentHistory 
        payments={client.payments} 
        client={client}
        onDeletePayment={handleDeletePayment}
        onUpdatePayment={handleUpdatePayment}
        isDeleting={isSubmitting}
        isUpdating={isSubmitting}
      />

      <MarkContractAsPaidDialog
        open={isMarkAsPaidOpen}
        onClose={() => setIsMarkAsPaidOpen(false)}
        client={client}
        onConfirm={handleMarkContractAsPaid}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
