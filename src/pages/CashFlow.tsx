
import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import { useClients } from "@/contexts/ClientsContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { TransactionList } from "@/components/TransactionList";
import { AddTransactionForm } from "@/components/AddTransactionForm";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { TransactionSummary } from "@/components/TransactionSummary";
import { Transaction, TransactionType } from "@/utils/types";
import { toast } from "sonner";
import { useTransactionData } from "@/hooks/useTransactionDataContext";

export default function CashFlow() {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const { clients, refreshClients } = useClients();
  const { transactions, addTransaction, deleteTransaction, refreshTransactions } = useTransactions();
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const { refresh: refreshTransactionData } = useTransactionData();

  useEffect(() => {
    document.title = "Fluxo de Caixa | Wedding CRM";
    
    // Ensure we have the latest data when the page loads
    const loadData = async () => {
      try {
        await refreshTransactions();
        await refreshClients();
      } catch (error) {
        console.error("Error refreshing data:", error);
        toast.error("Erro ao carregar dados");
      }
    };
    
    loadData();
  }, [refreshTransactions, refreshClients]);

  // Use useMemo to filter transactions for better performance
  const filteredTransactions = useMemo(() => {
    if (typeFilter === "all") {
      return transactions;
    }
    return transactions.filter(t => t.type === typeFilter);
  }, [transactions, typeFilter]);

  const handleAddTransaction = async (newTransaction: Omit<Transaction, "id" | "createdAt">) => {
    try {
      const result = await addTransaction(newTransaction);
      
      if (result) {
        setShowAddTransaction(false);
        
        // If this transaction is linked to a client and is an income, refresh clients data
        // to update the client's payment history
        if (result.clientId && result.type === "entrada") {
          toast.success("Transação registrada e adicionada ao histórico do cliente!");
          await refreshClients();
        } else {
          toast.success("Transação registrada com sucesso!");
        }
        
        // Refresh transactions to update all views that depend on transaction data
        await refreshTransactions();
        
        // Also refresh transaction data context
        await refreshTransactionData();
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Erro ao registrar transação");
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await deleteTransaction(transactionId);
      
      toast.success("Transação removida com sucesso");
      
      // Refresh client data to update payment history
      await refreshClients();
      
      // Also refresh transactions to update all views
      await refreshTransactions();
      
      // Also refresh transaction data context
      await refreshTransactionData();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Erro ao remover transação");
    }
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

        <TransactionSummary transactions={transactions} className="mb-6" />

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

        <TransactionList 
          transactions={filteredTransactions} 
          clients={clients} 
          onDeleteTransaction={handleDeleteTransaction}
        />
      </div>
    </Layout>
  );
}
