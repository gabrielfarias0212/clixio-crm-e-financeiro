
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { transactions } from "@/utils/mockTransactions";
import { clients } from "@/utils/mockData";
import { TransactionList } from "@/components/TransactionList";
import { AddTransactionForm } from "@/components/AddTransactionForm";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { TransactionSummary } from "@/components/TransactionSummary";
import { Transaction, TransactionType } from "@/utils/types";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

export default function CashFlow() {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>(transactions);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(transactions);
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");

  useEffect(() => {
    document.title = "Fluxo de Caixa | Wedding CRM";
  }, []);

  useEffect(() => {
    if (typeFilter === "all") {
      setFilteredTransactions(allTransactions);
    } else {
      setFilteredTransactions(allTransactions.filter(t => t.type === typeFilter));
    }
  }, [allTransactions, typeFilter]);

  const handleAddTransaction = (newTransaction: Omit<Transaction, "id" | "createdAt">) => {
    const transaction: Transaction = {
      ...newTransaction,
      id: uuidv4(),
      createdAt: new Date(),
    };

    // If transaction is linked to a client and is an income, create a payment record
    if (transaction.clientId && transaction.type === "entrada") {
      const clientIndex = clients.findIndex(c => c.id === transaction.clientId);
      
      if (clientIndex !== -1) {
        const paymentId = uuidv4();
        
        // Add payment to client
        const payment = {
          id: paymentId,
          amount: transaction.amount,
          date: transaction.date,
          notes: transaction.description
        };
        
        clients[clientIndex].payments.push(payment);
        clients[clientIndex].updatedAt = new Date();
        
        // Update client status if fully paid
        const totalPaid = clients[clientIndex].payments.reduce(
          (sum, payment) => sum + payment.amount, 0
        );
        
        if (totalPaid >= clients[clientIndex].contractValue) {
          clients[clientIndex].status = "pago";
        }
        
        // Link payment to transaction
        transaction.paymentId = paymentId;
      }
    }

    // Add transaction to the list
    const updatedTransactions = [transaction, ...allTransactions];
    setAllTransactions(updatedTransactions);
    
    // Close the form
    setShowAddTransaction(false);
    toast.success("Transação registrada com sucesso!");
  };

  return (
    <Layout>
      <div className="max-w-screen-lg mx-auto px-4 py-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold">Fluxo de Caixa</h1>
          <Button 
            onClick={() => setShowAddTransaction(true)}
            disabled={showAddTransaction}
            className="gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Nova Transação
          </Button>
        </div>

        <TransactionSummary transactions={allTransactions} className="mb-6" />

        {showAddTransaction && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h2 className="text-lg font-medium mb-4">Registrar Nova Transação</h2>
            <AddTransactionForm 
              clients={clients}
              onAddTransaction={handleAddTransaction}
              onCancel={() => setShowAddTransaction(false)}
            />
          </div>
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          <Button
            variant={typeFilter === "all" ? "default" : "outline"}
            onClick={() => setTypeFilter("all")}
            size="sm"
          >
            Todas
          </Button>
          <Button
            variant={typeFilter === "entrada" ? "default" : "outline"}
            onClick={() => setTypeFilter("entrada")}
            size="sm"
            className="text-green-700 bg-green-100 hover:bg-green-200 border-green-200"
          >
            Entradas
          </Button>
          <Button
            variant={typeFilter === "saída" ? "default" : "outline"}
            onClick={() => setTypeFilter("saída")}
            size="sm"
            className="text-red-700 bg-red-100 hover:bg-red-200 border-red-200"
          >
            Saídas
          </Button>
        </div>

        <TransactionList transactions={filteredTransactions} clients={clients} />
      </div>
    </Layout>
  );
}
