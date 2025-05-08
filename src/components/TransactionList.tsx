
import { Client, Transaction } from "@/utils/types";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowDownCircle, ArrowUpCircle, ExternalLink, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Button } from "./ui/button";
import { stringToDate } from "@/utils/dates";

interface TransactionListProps {
  transactions: Transaction[];
  clients: Client[];
  onDeleteTransaction?: (transactionId: string) => Promise<void>;
}

export function TransactionList({ transactions, clients, onDeleteTransaction }: TransactionListProps) {
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : "Cliente não encontrado";
  };

  const handleDelete = async () => {
    if (transactionToDelete && onDeleteTransaction) {
      setIsDeleting(true);
      try {
        await onDeleteTransaction(transactionToDelete);
      } finally {
        setIsDeleting(false);
        setTransactionToDelete(null);
      }
    }
  };

  // Close the dialog if we're not deleting anything
  const handleOpenChange = (open: boolean) => {
    if (!isDeleting && !open) {
      setTransactionToDelete(null);
    }
  };

  // Safely format a date with fallback
  const safeFormatDate = (dateStr: string | Date | null): string => {
    if (!dateStr) return "Data inválida";
    
    try {
      // Convert string to Date object safely using our utility
      const dateObj = typeof dateStr === 'string' ? stringToDate(dateStr) : dateStr;
      
      // Only format if we have a valid date
      if (dateObj && !isNaN(dateObj.getTime())) {
        return format(dateObj, "dd/MM/yyyy");
      }
      return "Data inválida";
    } catch (error) {
      console.error("Error formatting date:", dateStr, error);
      return "Data inválida";
    }
  };

  return (
    <div className="space-y-3 overflow-x-auto">
      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 italic">Nenhuma transação registrada</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="hidden sm:table-cell">Cliente</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-[50px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id} className="group">
                  <TableCell className="font-medium whitespace-nowrap">
                    {safeFormatDate(transaction.date)}
                  </TableCell>
                  <TableCell className="max-w-[180px] sm:max-w-none truncate">
                    <div className="flex items-center">
                      {transaction.type === "entrada" ? (
                        <ArrowUpCircle className="h-4 w-4 mr-2 text-green-500 shrink-0" />
                      ) : (
                        <ArrowDownCircle className="h-4 w-4 mr-2 text-red-500 shrink-0" />
                      )}
                      <span className="truncate">{transaction.description}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${
                        transaction.type === "entrada"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {transaction.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {transaction.clientId ? (
                      <Link
                        to={`/clients/${transaction.clientId}`}
                        className="flex items-center text-blue-600 hover:underline group-hover:text-blue-800"
                      >
                        {getClientName(transaction.clientId)}
                        <ExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className={`text-right font-medium whitespace-nowrap ${
                    transaction.type === "entrada" ? "text-green-600" : "text-red-600"
                  }`}>
                    {transaction.type === "entrada" ? "+" : "-"}
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-red-600"
                      onClick={() => setTransactionToDelete(transaction.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!transactionToDelete} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
