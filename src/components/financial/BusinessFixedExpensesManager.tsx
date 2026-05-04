import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit2, Calendar, DollarSign, Loader2, X, Check, AlertCircle, Info } from "lucide-react";
import { useBusinessFixedExpenses } from "@/hooks/useBusinessFixedExpenses";
import { EXPENSE_CATEGORIES } from "@/utils/supabase/business-fixed-expenses";
import type { BusinessFixedExpense } from "@/hooks/useBusinessFixedExpenses";
import { Alert, AlertDescription } from "@/components/ui/alert";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

interface FormState {
  description: string;
  amount: string;
  dueDate: string;
  category: string;
}

const EMPTY: FormState = {
  description: "",
  amount: "",
  dueDate: "",
  category: "",
};

export function BusinessFixedExpensesManager() {
  const {
    expenses,
    loading,
    error,
    addExpense,
    updateExpense,
    removeExpense,
    getActiveExpenses,
    getTotalMonthlyExpenses,
  } = useBusinessFixedExpenses();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const set = (key: keyof FormState) => (val: string) =>
    setForm(f => ({ ...f, [key]: val }));

  const resetForm = () => {
    setForm(EMPTY);
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    const amountNum = parseFloat(form.amount.replace(",", "."));
    const dueDateNum = form.dueDate ? parseInt(form.dueDate) : null;
    const category = form.category || null;

    let ok = false;
    if (editingId) {
      ok = await updateExpense(editingId, {
        description: form.description,
        amount: amountNum,
        due_date: dueDateNum,
        category: category as any,
      });
    } else {
      ok = await addExpense(form.description, amountNum, dueDateNum, category as any);
    }
    if (ok) resetForm();
  };

  const handleEdit = (expense: BusinessFixedExpense) => {
    setEditingId(expense.id);
    setForm({
      description: expense.description,
      amount: String(expense.amount),
      dueDate: expense.due_date ? String(expense.due_date) : "",
      category: (expense as any).category || "",
    });
    setShowForm(true);
  };

  const getCat = (val: string | null | undefined) =>
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
  const hasImpostos = expenses.some(e => (e as any).category === "impostos");

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
          <Button
            onClick={() => { if (showForm) { resetForm(); } else { setShowForm(true); setEditingId(null); setForm(EMPTY); } }}
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

        {!hasImpostos && (
          <div className="flex items-start gap-2 text-sm bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2.5">
            <Info className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
            <span className="text-amber-800 dark:text-amber-300">
              <span className="font-medium">Dica:</span> Cadastre o DAS MEI (~R$ 75,90/mês) na categoria <strong>Impostos / DAS</strong> para ele aparecer no ponto de equilíbrio e fluxo de caixa.
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
            <div>
              <Label>Descrição</Label>
              <Input
                placeholder="Ex: DAS MEI, Adobe CC, Hostinger..."
                value={form.description}
                onChange={e => set("description")(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Categoria</Label>
                <Select value={form.category || undefined} onValueChange={set("category")}>
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
                <Label>Dia do Vencimento</Label>
                <Select value={form.dueDate || undefined} onValueChange={set("dueDate")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sem dia fixo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                      <SelectItem key={d} value={String(d)}>Dia {d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Valor (R$)</Label>
              <Input
                placeholder="0,00"
                value={form.amount}
                onChange={e => set("amount")(e.target.value)}
              />
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
              const cat = getCat((expense as any).category);
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
                        <p className={`font-medium text-sm ${!expense.is_active ? "line-through" : ""}`}>
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
                      <p className="text-sm font-medium text-red-700 mb-2">
                        Excluir <strong>{expense.description}</strong>?
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive" className="h-7 text-xs"
                          onClick={() => { removeExpense(expense.id); setDeletingId(null); }}>
                          Sim, excluir
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs"
                          onClick={() => setDeletingId(null)}>
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
