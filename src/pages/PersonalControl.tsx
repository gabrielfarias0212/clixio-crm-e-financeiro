
import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { PlusCircle, MinusCircle } from "lucide-react";
import { PersonalFinancialSummary } from "@/components/personal/PersonalFinancialSummary";
import { PersonalTransactionForm } from "@/components/personal/PersonalTransactionForm";
import { PersonalTransactionsList } from "@/components/personal/PersonalTransactionsList";
import { PersonalControlCards } from "@/components/personal/PersonalControlCards";
import { usePersonalTransactions } from "@/hooks/usePersonalTransactions";

export default function PersonalControl() {
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [entryAmount, setEntryAmount] = useState('');
  const [entryDescription, setEntryDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');

  const { transactions, addTransaction, getTotals } = usePersonalTransactions();
  const { totalEntries, totalExpenses, balance } = getTotals();

  const handleAddEntry = () => {
    const success = addTransaction('entrada', entryAmount, entryDescription);
    if (success) {
      setEntryAmount('');
      setEntryDescription('');
      setShowEntryForm(false);
    }
  };

  const handleAddExpense = () => {
    const success = addTransaction('saida', expenseAmount, expenseDescription);
    if (success) {
      setExpenseAmount('');
      setExpenseDescription('');
      setShowExpenseForm(false);
    }
  };

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

        <PersonalFinancialSummary 
          totalEntries={totalEntries}
          totalExpenses={totalExpenses}
          balance={balance}
        />

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
          onAmountChange={setEntryAmount}
          onDescriptionChange={setEntryDescription}
          onSubmit={handleAddEntry}
          onCancel={() => setShowEntryForm(false)}
        />

        <PersonalTransactionForm
          type="expense"
          show={showExpenseForm}
          amount={expenseAmount}
          description={expenseDescription}
          onAmountChange={setExpenseAmount}
          onDescriptionChange={setExpenseDescription}
          onSubmit={handleAddExpense}
          onCancel={() => setShowExpenseForm(false)}
        />

        <PersonalTransactionsList transactions={transactions} />

        <PersonalControlCards />
      </div>
    </Layout>
  );
}
