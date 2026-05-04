import { useState, useEffect, useCallback } from "react";
import { Client } from "@/utils/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, Plus, TrendingDown, TrendingUp, Minus } from "lucide-react";
import {
  ProjectCost, COST_CATEGORIES,
  fetchProjectCosts, addProjectCost, deleteProjectCost,
} from "@/utils/supabase/project-costs";

interface ProjectCostsProps {
  client: Client;
}

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(v);

export function ProjectCosts({ client }: ProjectCostsProps) {
  const [costs, setCosts] = useState<ProjectCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    category: "outro" as ProjectCost["category"],
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });

  const load = useCallback(async () => {
    try {
      const data = await fetchProjectCosts(client.id);
      setCosts(data);
    } catch {
      toast.error("Erro ao carregar custos");
    } finally {
      setLoading(false);
    }
  }, [client.id]);

  useEffect(() => { load(); }, [load]);

  const totalCosts = costs.reduce((s, c) => s + c.amount, 0);
  const receita = client.contractValue || 0;
  const pago = client.payments?.reduce((s, p) => s + (p.amount || 0), 0) ?? 0;
  const margem = receita - totalCosts;
  const margemPct = receita > 0 ? (margem / receita) * 100 : 0;

  const handleAdd = async () => {
    if (!form.description.trim() || !form.amount) {
      toast.error("Preencha descrição e valor");
      return;
    }
    setSaving(true);
    try {
      const novo = await addProjectCost(client.id, {
        category: form.category,
        description: form.description.trim(),
        amount: parseFloat(form.amount.replace(",", ".")),
        date: form.date,
      });
      setCosts(prev => [novo, ...prev]);
      setForm({ category: "outro", description: "", amount: "", date: new Date().toISOString().split("T")[0] });
      setShowForm(false);
      toast.success("Custo registrado");
    } catch {
      toast.error("Erro ao salvar custo");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProjectCost(id);
      setCosts(prev => prev.filter(c => c.id !== id));
      toast.success("Custo removido");
    } catch {
      toast.error("Erro ao remover custo");
    }
  };

  const getCatLabel = (cat: string) =>
    COST_CATEGORIES.find(c => c.value === cat) ?? { label: cat, emoji: "📌" };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Custos do Projeto</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setShowForm(v => !v)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Adicionar custo
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Resumo financeiro */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs text-green-700 mb-1">Receita</p>
            <p className="text-sm font-bold text-green-700">{fmt(receita)}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <p className="text-xs text-red-700 mb-1">Custos</p>
            <p className="text-sm font-bold text-red-700">{fmt(totalCosts)}</p>
          </div>
          <div className={`rounded-lg p-3 ${margem >= 0 ? "bg-blue-50" : "bg-orange-50"}`}>
            <p className={`text-xs mb-1 ${margem >= 0 ? "text-blue-700" : "text-orange-700"}`}>
              Margem
            </p>
            <div className="flex items-center gap-1">
              {margem >= 0
                ? <TrendingUp className="h-3 w-3 text-blue-600" />
                : <TrendingDown className="h-3 w-3 text-orange-600" />}
              <p className={`text-sm font-bold ${margem >= 0 ? "text-blue-700" : "text-orange-700"}`}>
                {margemPct.toFixed(0)}%
              </p>
            </div>
            <p className={`text-xs ${margem >= 0 ? "text-blue-600" : "text-orange-600"}`}>{fmt(margem)}</p>
          </div>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
            <div className="grid grid-cols-2 gap-2">
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as ProjectCost["category"] }))}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COST_CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value} className="text-xs">
                      {c.emoji} {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                className="h-8 text-xs"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              />
            </div>
            <Input
              placeholder="Descrição (ex: Assistente Pedro)"
              className="h-8 text-xs"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
            <div className="flex gap-2">
              <Input
                placeholder="Valor (R$)"
                className="h-8 text-xs"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              />
              <Button size="sm" onClick={handleAdd} disabled={saving} className="h-8">
                {saving ? "Salvando..." : "Salvar"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)} className="h-8">
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Lista de custos */}
        {loading ? (
          <p className="text-xs text-muted-foreground text-center py-4">Carregando...</p>
        ) : costs.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            Nenhum custo registrado para este projeto
          </p>
        ) : (
          <div className="space-y-2">
            {costs.map(cost => {
              const cat = getCatLabel(cost.category);
              return (
                <div key={cost.id} className="flex items-center gap-3 p-2 rounded-lg border bg-background hover:bg-muted/30 transition-colors">
                  <span className="text-base">{cat.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{cost.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">{cat.label}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(cost.date).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-red-600">{fmt(cost.amount)}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-muted-foreground hover:text-red-600"
                    onClick={() => handleDelete(cost.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
            <div className="flex justify-between items-center pt-1 border-t text-xs">
              <span className="text-muted-foreground">Total de custos</span>
              <span className="font-bold text-red-600">{fmt(totalCosts)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
