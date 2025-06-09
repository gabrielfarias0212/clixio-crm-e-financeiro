
import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import { useClients } from "@/contexts/ClientsContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { TransactionList } from "@/components/TransactionList";
import { AddTransactionForm } from "@/components/AddTransactionForm";
import { Button } from "@/components/ui/button";
import { PlusCircle, TrendingUp } from "lucide-react";
import { TransactionSummary } from "@/components/TransactionSummary";
import { FutureProjections } from "@/components/FutureProjections";
import { TransactionCategoryCharts } from "@/components/TransactionCategoryCharts";
import { Transaction, TransactionType } from "@/utils/types";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CashFlow() {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const { clients, refreshClients } = useClients();
  const { transactions, addTransaction, deleteTransaction, refreshTransactions } = useTransactions();
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");

  useEffect(() => {
    document.title = "Financeiro | Wedding CRM";
    
    // Ensure we have the latest data when the page loads
    refreshTransactions();
    refreshClients();
  }, [refreshTransactions, refreshClients]);

  // Use useMemo to filter transactions for better performance
  const filteredTransactions = useMemo(() => {
    if (typeFilter === "all") {
      return transactions;
    }
    return transactions.filter(t => t.type === typeFilter);
  }, [transactions, typeFilter]);

  const handleAddTransaction = async (newTransaction: Omit<Transaction, "id" | "createdAt">) => {
    const result = await addTransaction(newTransaction);
    
    if (result) {
      setShowAddTransaction(false);
      
      // If this transaction is linked to a client and is an income, refresh clients data
      // to update the client's payment history
      if (result.clientId && result.type === "entrada") {
        toast.success("Transação registrada e adicionada ao histórico do cliente!");
        refreshClients();
      } else {
        toast.success("Transação registrada com sucesso!");
      }
      
      // Refresh transactions to update all views that depend on transaction data
      refreshTransactions();
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    await deleteTransaction(transactionId);
    
    // Refresh client data to update payment history
    refreshClients();
    
    // Also refresh transactions to update all views
    refreshTransactions();
  };

  return (
    <Layout>
      <div className="max-w-screen-lg mx-auto px-4 py-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold">Financeiro</h1>
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

        {/* Tabs para separar Transações e Projeções */}
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="projections" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Projeções
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-6">
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

            {/* Gráficos de categorias - adicionados abaixo das transações */}
            <TransactionCategoryCharts transactions={transactions} />
          </TabsContent>

          <TabsContent value="projections">
            <FutureProjections />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
