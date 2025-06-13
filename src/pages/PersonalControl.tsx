import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, MinusCircle, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { toast } from "sonner";

interface PersonalTransaction {
  id: string;
  type: 'entrada' | 'saida';
  amount: number;
  description: string;
  date: string;
}

export default function PersonalControl() {
  const [transactions, setTransactions] = useState<PersonalTransaction[]>([]);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [entryAmount, setEntryAmount] = useState('');
  const [entryDescription, setEntryDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');

  // Load transactions from localStorage on component mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('personalTransactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  // Save transactions to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem('personalTransactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleAddEntry = () => {
    if (!entryAmount || !entryDescription) {
      toast.error('Preencha todos os campos');
      return;
    }

    const newTransaction: PersonalTransaction = {
      id: Date.now().toString(),
      type: 'entrada',
      amount: parseFloat(entryAmount),
      description: entryDescription,
      date: new Date().toLocaleDateString('pt-BR')
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setEntryAmount('');
    setEntryDescription('');
    setShowEntryForm(false);
    toast.success('Entrada registrada com sucesso!');
  };

  const handleAddExpense = () => {
    if (!expenseAmount || !expenseDescription) {
      toast.error('Preencha todos os campos');
      return;
    }

    const newTransaction: PersonalTransaction = {
      id: Date.now().toString(),
      type: 'saida',
      amount: parseFloat(expenseAmount),
      description: expenseDescription,
      date: new Date().toLocaleDateString('pt-BR')
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setExpenseAmount('');
    setExpenseDescription('');
    setShowExpenseForm(false);
    toast.success('Saída registrada com sucesso!');
  };

  const totalEntries = transactions
    .filter(t => t.type === 'entrada')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'saida')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalEntries - totalExpenses;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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

        {/* Financial Summary */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Entradas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalEntries)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Saídas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalExpenses)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
              <Wallet className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(balance)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
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

        {/* Entry Form */}
        {showEntryForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Nova Entrada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="entryAmount">Valor</Label>
                <Input
                  id="entryAmount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={entryAmount}
                  onChange={(e) => setEntryAmount(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="entryDescription">Descrição</Label>
                <Textarea
                  id="entryDescription"
                  placeholder="Descreva a origem da entrada..."
                  value={entryDescription}
                  onChange={(e) => setEntryDescription(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddEntry} className="bg-green-600 hover:bg-green-700">
                  Registrar Entrada
                </Button>
                <Button variant="outline" onClick={() => setShowEntryForm(false)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expense Form */}
        {showExpenseForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Nova Saída</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="expenseAmount">Valor</Label>
                <Input
                  id="expenseAmount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="expenseDescription">Descrição</Label>
                <Textarea
                  id="expenseDescription"
                  placeholder="Descreva o gasto..."
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddExpense} variant="destructive">
                  Registrar Saída
                </Button>
                <Button variant="outline" onClick={() => setShowExpenseForm(false)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transactions List */}
        {transactions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Últimas Transações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {transaction.type === 'entrada' ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">{transaction.date}</p>
                      </div>
                    </div>
                    <div className={`font-bold ${transaction.type === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'entrada' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Other Personal Control Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
              <CardDescription>
                Suas informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure seus dados pessoais e preferências
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>
                Personalize sua experiência
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ajuste as configurações do sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferências</CardTitle>
              <CardDescription>
                Defina suas preferências
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure notificações e outras preferências
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
