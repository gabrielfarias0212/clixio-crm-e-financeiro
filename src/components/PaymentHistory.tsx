
import { Payment } from "@/utils/types";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface PaymentHistoryProps {
  payments: Payment[];
  className?: string;
}

export function PaymentHistory({ payments, className }: PaymentHistoryProps) {
  // Sort payments by date (newest first)
  const sortedPayments = [...payments].sort((a, b) => b.date.getTime() - a.date.getTime());
  
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
              <TableHead className="hidden sm:table-cell">Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{format(payment.date, "dd/MM/yyyy")}</TableCell>
                <TableCell className="font-medium">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(payment.amount)}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {payment.notes || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
