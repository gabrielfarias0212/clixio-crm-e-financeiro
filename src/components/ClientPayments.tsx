
import { useState } from "react";
import { Client, Payment } from "@/utils/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentHistory } from "./PaymentHistory";
import { AddPaymentForm } from "./AddPaymentForm";
import { DollarSign, Plus } from "lucide-react";
import { toast } from "sonner";
import { createPayment } from "@/utils/supabaseUtils";
import { useClients } from "@/contexts/ClientsContext";
import { getUpdatedStatus } from "@/utils/clientUtils";

interface ClientPaymentsProps {
  client: Client;
}

export function ClientPayments({ client }: ClientPaymentsProps) {
  const [showAddPayment, setShowAddPayment] = useState(false);
  const { updateClient } = useClients();

  // Calculate the total amount paid
  const totalPaid = client.payments.reduce((sum, payment) => sum + payment.amount, 0);
  
  // Calculate the remaining amount
  const remainingAmount = Math.max(0, client.contractValue - totalPaid);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(amount);
  };

  const handleAddPayment = async (newPayment: Payment) => {
    try {
      // Add the payment through the API
      const result = await createPayment({
        clientId: client.id,
        amount: newPayment.amount,
        date: newPayment.date,
        notes: newPayment.notes
      });

      if (result) {
        // Check if the client status should be updated
        const updatedStatus = getUpdatedStatus(client, newPayment.amount);
        
        // Update client status if needed
        if (updatedStatus !== client.status) {
          await updateClient(client.id, { status: updatedStatus });
        }
        
        // Hide the form
        setShowAddPayment(false);
        
        // Notify the user
        toast.success("Pagamento registrado com sucesso!");
      }
    } catch (error) {
      console.error("Error adding payment:", error);
      toast.error("Erro ao registrar pagamento");
    }
  };

  return (
    <Card className="mb-6 animate-scale-in [animation-delay:200ms]">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <h2 className="text-lg font-medium">Informações Financeiras</h2>
          
          {remainingAmount > 0 && client.status !== "orçamento enviado" && client.status !== "follow-up" && (
            <Button 
              size="sm"
              onClick={() => setShowAddPayment(true)}
              disabled={showAddPayment}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar Pagamento
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Valor do Contrato</h3>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
              <span className="font-medium">{formatCurrency(client.contractValue)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Valor Pago</h3>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1 text-green-500" />
              <span className="font-medium text-green-700">{formatCurrency(totalPaid)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Valor Restante</h3>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1 text-orange-500" />
              <span className="font-medium text-orange-700">{formatCurrency(remainingAmount)}</span>
            </div>
          </div>
        </div>

        {showAddPayment ? (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-md font-medium mb-3">Registrar Novo Pagamento</h3>
            <AddPaymentForm 
              maxAmount={remainingAmount}
              onAddPayment={handleAddPayment}
              onCancel={() => setShowAddPayment(false)}
            />
          </div>
        ) : null}

        <PaymentHistory payments={client.payments} />
      </CardContent>
    </Card>
  );
}
