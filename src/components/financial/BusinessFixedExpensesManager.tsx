import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit2, Calendar, DollarSign, Loader2, X, Check, AlertCircle, Info } from "lucide-react";
import { useBusinessFixedExpenses, BusinessFixedExpense, EXPENSE_CATEGORIES, ExpenseCategory } from "@/hooks/useBusinessFixedExpenses";
import { Alert, AlertDescription } from "@/components/ui/alert";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const EMPTY_FORM = {
  description: "",
  amount: "",
  dueDate: "",
  category: "" as ExpenseCategory | "",
};

export function BusinessFixedExpensesManager() {
  const { expenses, loading, error, addExpense, updateExpense, removeExpense, getActiveExpenses, getTotalMonthlyExpenses } =
    useBusinessFixedExpenses();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    const dueDateNum = form.dueDate ? parseInt(form.dueDate) : null;
    const amountNum = parseFloat(form.amount.replace(",", "."));
    const category = (form.category || null) as ExpenseCategory | null;

    if (editingId) {
      const ok = await updateExpense(editingId, {
        description: form.description,
        amount: amountNum,
        due_date: dueDateNum,
        category,
      });
      if (ok) resetForm();
    } else {
      const ok = await addExpense(form.description, amountNum, dueDateNum, category);
      if (ok) resetForm();
    }
  };

  const handleEdit = (expense: BusinessFixedExpense) => {
    setEditingId(expense.id);
    setForm({
      description: expense.description,
      amount: expense.amount.toString(),
      dueDate: expense.due_date?.toString() || "",
      category: expense.category || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await removeExpense(id);
    setDeletingId(null);
  };

  const getCat = (val: string | null) =>
    EXPENSE_CATEGORIES.find(c => c.value === val) ?? { label: "Outro", emoji: "📌" };

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
              Despesas Fixas Empresariais
            </CardTitle>
            <CardDescription>Custos mensais recorrentes do seu negócio</CardDescription>
          </div>
          <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(EMPTY_FORM); }}
            variant={showForm ? "outline" : "default"} size="sm">
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

        {/* Aviso DAS MEI */}
        {!expenses.some(e => e.category === "impostos") && (
          <div className="flex items-start gap-2 text-sm bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2.5">
            <Info className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
            <span className="text-amber-800 dark:text-amber-300">
              <span className="font-medium">Dica:</span> Cadastre o DAS MEI (~R$ 75,90/mês) como uma despesa fixa na categoria <strong>Impostos / DAS</strong> para ele aparecer corretamente no ponto de equilíbrio e no fluxo de caixa.
            </span>
          </div>
        )}

        {/* Resumo */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Despesas Ativas</p>
            <p className="text-2xl font-bold">{activeExpenses.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Mensal</p>
            <p className="text-2xl font-bold text-red-600">{fmt(totalMonthly)}</p>
          </div>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="border rounded-lg p-4 space-y-3 bg-card">
            <h4 className="font-medium text-sm">{editingId ? "Editar Despesa" : "Nova Despesa Fixa"}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <Label>Descrição</Label>
                <Input
                  placeholder="Ex: DAS MEI, Hostinger, Adobe CC..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div>
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as ExpenseCategory }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.emoji} {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Valor (R$)</Label>
                <Input
                  placeholder="0,00"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                />
              </div>
              <div>
                <Label>Dia do Vencimento</Label>
                <Select value={form.dueDate} onValueChange={v => setForm(f => ({ ...f, dueDate: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sem dia fixo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sem dia fixo</SelectItem>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <SelectItem key={day} value={day.toString()}>Dia {day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={handleSubmit} size="sm">
                <Check className="h-4 w-4 mr-2" />
                {editingId ? "Salvar" : "Cadastrar"}
              </Button>
              <Button onClick={resetForm} variant="outline" size="sm">Cancelar</Button>
            </div>
          </div>
        )}

        {/* Lista */}
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p>Nenhuma despesa fixa cadastrada</p>
            <p className="text-sm mt-1">Clique em "Nova Despesa" para começar</p>
          </div>
        ) : (
          <div className="space-y-2">
            {expenses.map(expense => {
              const cat = getCat(expense.category);
              const isDeleting = deletingId === expense.id;

              return (
                <div key={expense.id} className={`border rounded-lg transition-colors ${expense.is_active ? "bg-card" : "bg-muted/50 opacity-60"}`}>
                  {!isDeleting ? (
                    <div className="flex items-center gap-3 p-3">
                      <Switch
                        checked={expense.is_active}
                        onCheckedChange={() => updateExpense(expense.id, { is_active: !expense.is_active })}
                      />
                      <span className="text-base shrink-0">{cat.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${!expense.is_active && "line-through"}`}>
                          {expense.description}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <Badge variant="secondary" className="text-xs px-1.5 py-0">{cat.label}</Badge>
                          {expense.due_date && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0">
                              Vence dia {expense.due_date}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <span className={`font-semibold text-sm shrink-0 ${expense.is_active ? "text-red-600" : "text-muted-foreground"}`}>
                        {fmt(expense.amount)}
                      </span>
                      <div className="flex gap-1 shrink-0">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(expense)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-red-600"
                          onClick={() => setDeletingId(expense.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                      <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">
                        Excluir <strong>{expense.description}</strong>?
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => handleDelete(expense.id)}>
                          Sim, excluir
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setDeletingId(null)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div className="flex justify-between items-center pt-2 border-t text-sm">
              <span className="text-muted-foreground">Total mensal ativo</span>
              <span className="font-bold text-red-600">{fmt(totalMonthly)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
