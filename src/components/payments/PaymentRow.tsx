
import { Payment } from "@/utils/types";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { PaymentStatusBadge } from "./PaymentStatusBadge";

interface PaymentRowProps {
  payment: Payment;
  onEdit: (payment: Payment) => void;
  onDeleteClick: (paymentId: string) => void;
  showActions: boolean;
  isDisabled: boolean;
}

export function PaymentRow({
  payment,
  onEdit,
  onDeleteClick,
  showActions,
  isDisabled
}: PaymentRowProps) {
  const formattedAmount = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(payment.amount);

  return (
    <TableRow>
      <TableCell>{payment.date}</TableCell>
      <TableCell className="font-medium">{formattedAmount}</TableCell>
      <TableCell className="hidden md:table-cell">
        <PaymentStatusBadge payment={payment} />
      </TableCell>
      <TableCell className="hidden sm:table-cell text-muted-foreground">
        {payment.due_date || "-"}
      </TableCell>
      <TableCell className="hidden lg:table-cell text-muted-foreground">
        {payment.notes || "-"}
      </TableCell>
      {showActions && (
        <TableCell>
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onEdit(payment)}
              disabled={isDisabled}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4 text-blue-500" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onDeleteClick(payment.id)}
              disabled={isDisabled}
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </TableCell>
      )}
    </TableRow>
  );
}
