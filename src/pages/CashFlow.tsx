
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useClients } from "@/contexts/ClientsContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { TransactionList } from "@/components/TransactionList";
import { AddTransactionForm } from "@/components/AddTransactionForm";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AdvancedCashFlowDashboard } from "@/components/cashflow/AdvancedCashFlowDashboard";
import { Transaction, TransactionType } from "@/utils/types";
import { toast } from "sonner";

export default function CashFlow() {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const { clients, refreshClients } = useClients();
  const { transactions, addTransaction, deleteTransaction, refreshTransactions } = useTransactions();
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");

  useEffect(() => {
    document.title = "Fluxo de Caixa | Wedding CRM";
    
    // Ensure we have the latest data when the page loads
    refreshTransactions();
    refreshClients();
  }, [refreshTransactions, refreshClients]);

  // Filter transactions for the list
  const filteredTransactions = typeFilter === "all" 
    ? transactions 
    : transactions.filter(t => t.type === typeFilter);

  const handleAddTransaction = async (newTransaction: Omit<Transaction, "id" | "createdAt">) => {
    const result = await addTransaction(newTransaction);
    
    if (result) {
      setShowAddTransaction(false);
      
      // If this transaction is linked to a client and is an income, refresh clients data
      if (result.clientId && result.type === "entrada") {
        toast.success("Transação registrada e adicionada ao histórico do cliente!");
        refreshClients();
      } else {
        toast.success("Transação registrada com sucesso!");
      }
      
      refreshTransactions();
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    await deleteTransaction(transactionId);
    refreshClients();
    refreshTransactions();
  };

  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto px-4 py-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold">Gestão Financeira</h1>
          <Button 
            onClick={() => setShowAddTransaction(true)}
            disabled={showAddTransaction}
            className="gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Nova Transação
          </Button>
        </div>

        {/* Dashboard Avançado */}
        <AdvancedCashFlowDashboard />

        {/* Formulário de Nova Transação */}
        {showAddTransaction && (
          <div className="mt-6 p-4 border rounded-lg bg-gray-50">
            <h2 className="text-lg font-medium mb-4">Registrar Nova Transação</h2>
            <AddTransactionForm 
              clients={clients}
              onAddTransaction={handleAddTransaction}
              onCancel={() => setShowAddTransaction(false)}
            />
          </div>
        )}

        {/* Filtros e Lista de Transações */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Histórico de Transações</h2>
            <div className="flex flex-wrap gap-2">
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
          </div>

          <TransactionList 
            transactions={filteredTransactions} 
            clients={clients} 
            onDeleteTransaction={handleDeleteTransaction}
          />
        </div>
      </div>
    </Layout>
  );
}
