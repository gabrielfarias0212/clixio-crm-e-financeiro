
import { useState } from "react";
import { Payment } from "@/utils/types";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PaymentRow } from "./PaymentRow";
import { DeletePaymentDialog } from "./DeletePaymentDialog";
import { EditPaymentDialog } from "./edit/EditPaymentDialog";

interface PaymentHistoryProps {
  payments: Payment[];
  className?: string;
  onDeletePayment?: (paymentId: string) => void;
  onUpdatePayment?: (paymentId: string, updates: Partial<Payment>) => void;
  isDeleting?: boolean;
}

export function PaymentHistory({ 
  payments, 
  className, 
  onDeletePayment, 
  onUpdatePayment,
  isDeleting = false 
}: PaymentHistoryProps) {
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const [paymentToEdit, setPaymentToEdit] = useState<Payment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Sort payments by date (newest first) - using string comparison instead of Date.getTime()
  const sortedPayments = [...payments].sort((a, b) => {
    // Convert to Date objects for comparison
    const dateA = typeof a.date === 'string' ? new Date(a.date) : a.date;
    const dateB = typeof b.date === 'string' ? new Date(b.date) : b.date;
    
    // Compare the dates
    return dateB.getTime() - dateA.getTime();
  });
  
  const handleDelete = () => {
    if (paymentToDelete && onDeletePayment) {
      onDeletePayment(paymentToDelete);
      setPaymentToDelete(null);
    }
  };

  const handleEditPayment = async (paymentId: string, updates: Partial<Payment>) => {
    try {
      setIsSubmitting(true);
      
      // Update the payment through the parent component
      if (onUpdatePayment) {
        await onUpdatePayment(paymentId, updates);
      }
      
      setPaymentToEdit(null);
    } catch (error) {
      console.error("Error updating payment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showActions = !!onDeletePayment || !!onUpdatePayment;

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-lg font-medium">Histórico de Pagamentos</h3>
      
      {payments.length === 0 ? (
        <p className="text-gray-500 italic">Nenhum pagamento registrado</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="hidden sm:table-cell">Vencimento</TableHead>
              <TableHead className="hidden lg:table-cell">Detalhes</TableHead>
              {showActions && <TableHead className="w-[100px]">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPayments.map((payment) => (
              <PaymentRow
                key={payment.id}
                payment={payment}
                onEdit={() => setPaymentToEdit(payment)}
                onDeleteClick={(id) => setPaymentToDelete(id)}
                showActions={showActions}
                isDisabled={isDeleting || isSubmitting}
              />
            ))}
          </TableBody>
        </Table>
      )}

      {/* Delete Payment Dialog */}
      <DeletePaymentDialog
        open={!!paymentToDelete}
        onOpenChange={(open) => {
          if (!open) setPaymentToDelete(null);
        }}
        onConfirm={handleDelete}
      />

      {/* Edit Payment Dialog */}
      {paymentToEdit && (
        <EditPaymentDialog
          open={!!paymentToEdit}
          onOpenChange={(open) => {
            if (!open) setPaymentToEdit(null);
          }}
          payment={paymentToEdit}
          onSave={handleEditPayment}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
