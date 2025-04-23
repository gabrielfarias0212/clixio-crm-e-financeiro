
import { useState } from "react";
import { Client } from "@/utils/types";
import { PaymentHistory } from "./PaymentHistory";
import { AddPaymentForm } from "./AddPaymentForm";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { DialogContent, Dialog, DialogTrigger } from "@/components/ui/dialog";
import { createPayment } from "@/utils/supabaseUtils";
import { toast } from "sonner";

export interface ClientPaymentsProps {
  client: Client;
  onUpdate?: (updatedClient: Client) => void;
}

export function ClientPayments({ client, onUpdate }: ClientPaymentsProps) {
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
        notes: newPayment.notes
      });
      
      // Update the UI
      if (onUpdate) {
        onUpdate(updatedClient);
      }
      
      setIsAddPaymentOpen(false);
      toast.success("Pagamento registrado com sucesso!");
    } catch (error) {
      console.error("Error adding payment:", error);
      toast.error("Erro ao registrar o pagamento. Tente novamente.");
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
      
      <PaymentHistory payments={client.payments} />
    </div>
  );
}
