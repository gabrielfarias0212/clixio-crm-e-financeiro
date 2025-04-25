
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

interface TransactionListProps {
  transactions: Transaction[];
  clients: Client[];
  onDeleteTransaction?: (transactionId: string) => Promise<void>;
}

export function TransactionList({ transactions, clients, onDeleteTransaction }: TransactionListProps) {
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : "Cliente não encontrado";
  };

  const handleDelete = async () => {
    if (transactionToDelete && onDeleteTransaction) {
      await onDeleteTransaction(transactionToDelete);
      setTransactionToDelete(null);
    }
  };

  return (
    <div className="space-y-3">
      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 italic">Nenhuma transação registrada</p>
        </div>
      ) : (
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
                <TableCell className="font-medium">
                  {format(transaction.date, "dd/MM/yyyy")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {transaction.type === "entrada" ? (
                      <ArrowUpCircle className="h-4 w-4 mr-2 text-green-500" />
                    ) : (
                      <ArrowDownCircle className="h-4 w-4 mr-2 text-red-500" />
                    )}
                    {transaction.description}
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
                <TableCell className={`text-right font-medium ${
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
      )}

      <AlertDialog open={!!transactionToDelete} onOpenChange={() => setTransactionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
