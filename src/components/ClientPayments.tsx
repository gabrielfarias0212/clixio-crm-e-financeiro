
import { useState } from "react";
import { Client } from "@/utils/types";
import { PaymentHistory } from "./PaymentHistory";
import { AddPaymentForm } from "./AddPaymentForm";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { DialogContent, Dialog, DialogTrigger } from "@/components/ui/dialog";

export interface ClientPaymentsProps {
  client: Client;
  onUpdate?: (updatedClient: Client) => void;
}

export function ClientPayments({ client, onUpdate }: ClientPaymentsProps) {
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  
  const handlePaymentAdded = (updatedClient: Client) => {
    if (onUpdate) {
      onUpdate(updatedClient);
    }
    setIsAddPaymentOpen(false);
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
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <PaymentHistory payments={client.payments} />
    </div>
  );
}
