
import { Payment } from "@/utils/types";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { isBefore } from "date-fns";
import { parseDate } from "@/utils/supabase/base";

interface PaymentStatusBadgeProps {
  payment: Payment;
}

export function PaymentStatusBadge({ payment }: PaymentStatusBadgeProps) {
  if (!payment.payment_status || payment.payment_status === "pago") {
    return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Pago</Badge>;
  } else if (payment.payment_status === "pendente") {
    // Check if past due date
    if (payment.due_date) {
      const dueDate = new Date(parseDate(payment.due_date) || '');
      if (isBefore(dueDate, new Date())) {
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" /> Atrasado
          </Badge>
        );
      }
    }
    return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pendente</Badge>;
  } else if (payment.payment_status === "atrasado") {
    return (
      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 flex items-center">
        <AlertCircle className="h-3 w-3 mr-1" /> Atrasado
      </Badge>
    );
  }
  return null;
}
