
import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { PlusCircle, MinusCircle, Loader2 } from "lucide-react";
import { PersonalFinancialSummary } from "@/components/personal/PersonalFinancialSummary";
import { PersonalTransactionForm } from "@/components/personal/PersonalTransactionForm";
import { PersonalTransactionsList } from "@/components/personal/PersonalTransactionsList";
import { PersonalControlCards } from "@/components/personal/PersonalControlCards";
import { CategoryManager } from "@/components/personal/CategoryManager";
import { usePersonalTransactions } from "@/hooks/usePersonalTransactions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PersonalFixedExpensesManager } from "@/components/personal/PersonalFixedExpensesManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PersonalControl() {
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [entryAmount, setEntryAmount] = useState('');
  const [entryDescription, setEntryDescription] = useState('');
  const [entryCategory, setEntryCategory] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');

  const { 
    transactions, 
    loading, 
    error, 
    addTransaction, 
    getTotals, 
    refreshTransactions 
  } = usePersonalTransactions();
  
  const { totalEntries, totalExpenses, balance } = getTotals();

  const handleAddEntry = async () => {
    const success = await addTransaction('entrada', entryAmount, entryDescription, entryCategory);
    if (success) {
      setEntryAmount('');
      setEntryDescription('');
      setEntryCategory('');
      setShowEntryForm(false);
    }
  };

  const handleAddExpense = async () => {
    const success = await addTransaction('saida', expenseAmount, expenseDescription, expenseCategory);
    if (success) {
      setExpenseAmount('');
      setExpenseDescription('');
      setExpenseCategory('');
      setShowExpenseForm(false);
    }
  };

  const handleTransactionRemoved = () => {
    refreshTransactions();
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-screen-2xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Carregando transações...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-screen-2xl mx-auto px-4 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Controle Pessoal</h1>
            <p className="text-muted-foreground">
              Gerencie suas informações pessoais e finanças
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <PersonalFinancialSummary 
          totalEntries={totalEntries}
          totalExpenses={totalExpenses}
          balance={balance}
        />

        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="fixed-expenses">Despesas Fixas</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-6">
            <div className="flex gap-4">
              <Button 
                onClick={() => setShowEntryForm(!showEntryForm)}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <PlusCircle className="h-4 w-4" />
                Lançar Entrada
              </Button>
              <Button 
                onClick={() => setShowExpenseForm(!showExpenseForm)}
                variant="destructive"
                className="gap-2"
              >
                <MinusCircle className="h-4 w-4" />
                Lançar Saída
              </Button>
            </div>

            <PersonalTransactionForm
              type="entry"
              show={showEntryForm}
              amount={entryAmount}
              description={entryDescription}
              category={entryCategory}
              onAmountChange={setEntryAmount}
              onDescriptionChange={setEntryDescription}
              onCategoryChange={setEntryCategory}
              onSubmit={handleAddEntry}
              onCancel={() => setShowEntryForm(false)}
            />

            <PersonalTransactionForm
              type="expense"
              show={showExpenseForm}
              amount={expenseAmount}
              description={expenseDescription}
              category={expenseCategory}
              onAmountChange={setExpenseAmount}
              onDescriptionChange={setExpenseDescription}
              onCategoryChange={setExpenseCategory}
              onSubmit={handleAddExpense}
              onCancel={() => setShowExpenseForm(false)}
            />

            <PersonalTransactionsList 
              transactions={transactions} 
              onTransactionRemoved={handleTransactionRemoved}
            />

            <CategoryManager />
          </TabsContent>

          <TabsContent value="fixed-expenses" className="space-y-6">
            <PersonalFixedExpensesManager />
          </TabsContent>
        </Tabs>

        <PersonalControlCards />
      </div>
    </Layout>
  );
}
