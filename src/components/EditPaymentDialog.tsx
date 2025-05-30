
import { useState } from "react";
import { Payment, PaymentStatus } from "@/utils/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/utils/dates";

interface EditPaymentDialogProps {
  payment: Payment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedPayment: Payment) => void;
  isLoading?: boolean;
}

export function EditPaymentDialog({
  payment,
  open,
  onOpenChange,
  onSave,
  isLoading = false
}: EditPaymentDialogProps) {
  const [status, setStatus] = useState<PaymentStatus>(payment.payment_status || "pendente");
  const [dueDate, setDueDate] = useState(payment.due_date || "");
  const [notes, setNotes] = useState(payment.notes || "");

  const handleSave = () => {
    const updatedPayment: Payment = {
      ...payment,
      payment_status: status,
      due_date: dueDate || undefined,
      notes: notes || undefined,
    };
    onSave(updatedPayment);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Pagamento</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Valor</Label>
            <Input 
              value={new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(payment.amount)}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div>
            <Label>Data do Pagamento</Label>
            <Input 
              value={payment.date}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: PaymentStatus) => setStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="atrasado">Atrasado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dueDate">Data de Vencimento</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicionar observações..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
