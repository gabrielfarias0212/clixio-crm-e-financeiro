
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, X } from "lucide-react";
import { Payment, Client } from "@/utils/types";
import { PaymentReceiptTemplate } from "./PaymentReceiptTemplate";

interface PaymentReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment;
  client: Client;
}

export function PaymentReceiptDialog({ 
  open, 
  onOpenChange, 
  payment, 
  client 
}: PaymentReceiptDialogProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Trigger print dialog which can be saved as PDF
    window.print();
  };

  // Calculate financial summary
  const contractValue = Number(client.contractValue) || 0;
  const totalPaid = client.payments
    .filter(p => p.payment_status === 'pago')
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const remainingBalance = contractValue - totalPaid;

  const receiptNumber = `${client.id.slice(0, 8).toUpperCase()}-${payment.id.slice(0, 4).toUpperCase()}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between print:hidden">
          <DialogTitle>Comprovante de Pagamento</DialogTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <PaymentReceiptTemplate
          payment={payment}
          client={client}
          receiptNumber={receiptNumber}
          contractValue={contractValue}
          totalPaid={totalPaid}
          remainingBalance={remainingBalance}
        />
      </DialogContent>
    </Dialog>
  );
}
