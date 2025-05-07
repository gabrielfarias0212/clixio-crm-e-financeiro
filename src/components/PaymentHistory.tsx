
import { Payment } from "@/utils/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AlertCircle, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { parseDate } from "@/utils/supabase/base";
import { Badge } from "@/components/ui/badge";
import { isBefore } from "date-fns";

interface PaymentHistoryProps {
  payments: Payment[];
  className?: string;
  onDeletePayment?: (paymentId: string) => void;
  isDeleting?: boolean;
}

export function PaymentHistory({ payments, className, onDeletePayment, isDeleting = false }: PaymentHistoryProps) {
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  
  // Sort payments by date (newest first) - using string comparison instead of Date.getTime()
  const sortedPayments = [...payments].sort((a, b) => {
    // Convert to Date objects for comparison
    const dateA = typeof a.date === 'string' ? new Date(parseDate(a.date) || '') : a.date;
    const dateB = typeof b.date === 'string' ? new Date(parseDate(b.date) || '') : b.date;
    
    // Compare the dates
    return dateB.getTime() - dateA.getTime();
  });
  
  const handleDelete = () => {
    if (paymentToDelete && onDeletePayment) {
      onDeletePayment(paymentToDelete);
      setPaymentToDelete(null);
    }
  };

  const getStatusBadge = (payment: Payment) => {
    if (!payment.payment_status || payment.payment_status === "pago") {
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Pago</Badge>;
    } else if (payment.payment_status === "pendente") {
      // Check if past due date
      if (payment.due_date) {
        const dueDate = new Date(parseDate(payment.due_date) || '');
        if (isBefore(dueDate, new Date())) {
          return (
            <div className="flex items-center">
              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" /> Atrasado
              </Badge>
            </div>
          );
        }
      }
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pendente</Badge>;
    } else if (payment.payment_status === "atrasado") {
      return (
        <div className="flex items-center">
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" /> Atrasado
          </Badge>
        </div>
      );
    }
    return null;
  };

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
              {onDeletePayment && <TableHead className="w-[80px]">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.date}</TableCell>
                <TableCell className="font-medium">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(payment.amount)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {getStatusBadge(payment)}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {payment.due_date || "-"}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">
                  {payment.notes || "-"}
                </TableCell>
                {onDeletePayment && (
                  <TableCell>
                    <AlertDialog open={paymentToDelete === payment.id} onOpenChange={(open) => {
                      if (!open) setPaymentToDelete(null);
                    }}>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setPaymentToDelete(payment.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir este pagamento? 
                            Esta ação não pode ser desfeita e o pagamento será removido do fluxo de caixa.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-red-500 hover:bg-red-600"
                            onClick={handleDelete}
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
