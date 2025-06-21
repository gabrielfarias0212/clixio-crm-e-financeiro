
import React, { memo, useMemo } from "react";
import { TransactionList } from "@/components/TransactionList";
import { Transaction, Client } from "@/utils/types";

interface OptimizedTransactionListProps {
  transactions: Transaction[];
  clients: Client[];
  onDeleteTransaction: (transactionId: string) => Promise<void>;
}

// Memoizar o componente para evitar re-renders desnecessários
const OptimizedTransactionList = memo(({ 
  transactions, 
  clients, 
  onDeleteTransaction 
}: OptimizedTransactionListProps) => {
  
  // Memoizar o mapeamento de clientes para evitar recálculos
  const clientsMap = useMemo(() => {
    return new Map(clients.map(client => [client.id, client]));
  }, [clients]);

  // Memoizar transações ordenadas
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }, [transactions]);

  return (
    <TransactionList 
      transactions={sortedTransactions} 
      clients={clients} 
      onDeleteTransaction={onDeleteTransaction}
    />
  );
});

OptimizedTransactionList.displayName = 'OptimizedTransactionList';

export { OptimizedTransactionList };
