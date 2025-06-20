
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Client } from "@/utils/types";

interface MarkContractAsPaidDialogProps {
  open: boolean;
  onClose: () => void;
  client: Client;
  onConfirm: (createTransaction: boolean) => void;
  isSubmitting: boolean;
}

export function MarkContractAsPaidDialog({ 
  open, 
  onClose, 
  client, 
  onConfirm, 
  isSubmitting 
}: MarkContractAsPaidDialogProps) {
  const [createTransaction, setCreateTransaction] = useState(true);

  const totalPaid = client.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = client.contractValue - totalPaid;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  const handleConfirm = () => {
    onConfirm(createTransaction);
  };

  if (pendingAmount <= 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Marcar Contrato como Pago</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Total pendente:</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(pendingAmount)}
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="create-transaction"
              checked={createTransaction}
              onCheckedChange={(checked) => setCreateTransaction(checked as boolean)}
            />
            <div className="space-y-1">
              <label 
                htmlFor="create-transaction" 
                className="text-sm font-medium cursor-pointer"
              >
                Registrar entrada no fluxo de caixa
              </label>
              <p className="text-xs text-gray-500">
                Desmarque se o valor foi recebido em conta externa ou já foi registrado manualmente
              </p>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            Esta ação irá marcar todos os pagamentos pendentes como "pago" e o contrato será removido da lista de pendências financeiras.
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processando..." : "Confirmar Pagamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
