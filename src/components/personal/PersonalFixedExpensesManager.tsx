import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit2, Calendar, Wallet, Loader2, X, Check, AlertCircle } from "lucide-react";
import { usePersonalFixedExpenses, PersonalFixedExpense } from "@/hooks/usePersonalFixedExpenses";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export function PersonalFixedExpensesManager() {
  const {
    expenses,
    loading,
    error,
    addExpense,
    updateExpense,
    removeExpense,
    getActiveExpenses,
    getTotalMonthlyExpenses
  } = usePersonalFixedExpenses();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState<string>('');

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setDueDate('');
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    const dueDateNum = dueDate ? parseInt(dueDate) : null;
    const amountNum = parseFloat(amount);

    if (editingId) {
      const success = await updateExpense(editingId, {
        description,
        amount: amountNum,
        due_date: dueDateNum
      });
      if (success) resetForm();
    } else {
      const success = await addExpense(description, amountNum, dueDateNum);
      if (success) resetForm();
    }
  };

  const handleEdit = (expense: PersonalFixedExpense) => {
    setEditingId(expense.id);
    setDescription(expense.description);
    setAmount(expense.amount.toString());
    setDueDate(expense.due_date?.toString() || '');
    setShowForm(true);
  };

  const handleToggleActive = async (expense: PersonalFixedExpense) => {
    await updateExpense(expense.id, { is_active: !expense.is_active });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Carregando despesas fixas...</span>
        </CardContent>
      </Card>
    );
  }

  const activeExpenses = getActiveExpenses();
  const totalMonthly = getTotalMonthlyExpenses();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Despesas Fixas Pessoais
            </CardTitle>
            <CardDescription>
              Gerencie suas despesas mensais recorrentes pessoais
            </CardDescription>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? "outline" : "default"}
            size="sm"
          >
            {showForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            {showForm ? "Cancelar" : "Nova Despesa"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Resumo */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Despesas Ativas</p>
            <p className="text-2xl font-bold">{activeExpenses.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Mensal</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalMonthly)}</p>
          </div>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="border rounded-lg p-4 space-y-4 bg-card">
            <h4 className="font-medium">{editingId ? 'Editar Despesa' : 'Nova Despesa Fixa'}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  placeholder="Ex: Aluguel, Luz, Internet"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Dia do Vencimento</Label>
                <Select value={dueDate} onValueChange={setDueDate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o dia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sem dia fixo</SelectItem>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        Dia {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit} size="sm">
                <Check className="h-4 w-4 mr-2" />
                {editingId ? 'Salvar' : 'Cadastrar'}
              </Button>
              <Button onClick={resetForm} variant="outline" size="sm">
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Lista de Despesas */}
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Wallet className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma despesa fixa cadastrada</p>
            <p className="text-sm">Clique em "Nova Despesa" para começar</p>
          </div>
        ) : (
          <div className="space-y-2">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                  expense.is_active ? 'bg-card' : 'bg-muted/50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Switch
                    checked={expense.is_active}
                    onCheckedChange={() => handleToggleActive(expense)}
                  />
                  <div>
                    <p className={`font-medium ${!expense.is_active && 'line-through'}`}>
                      {expense.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {expense.due_date && (
                        <Badge variant="outline" className="text-xs">
                          Vence dia {expense.due_date}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-semibold ${expense.is_active ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {formatCurrency(expense.amount)}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(expense)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeExpense(expense.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
