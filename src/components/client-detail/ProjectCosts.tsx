import { useState, useEffect, useCallback } from "react";
import { Client } from "@/utils/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, Plus, TrendingDown, TrendingUp, Store, Sparkles, Check, X } from "lucide-react";
import {
  ProjectCost, COST_CATEGORIES,
  fetchProjectCosts, addProjectCost, deleteProjectCost,
} from "@/utils/supabase/project-costs";
import {
  ProjectCostTemplate, fetchCostTemplates, getApplicableTemplates, CONDITION_LABELS,
} from "@/utils/supabase/settings";

interface ProjectCostsProps { client: Client; }

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(v);

const EMPTY_FORM = {
  category: "outro",
  description: "",
  amount: "",
  date: new Date().toISOString().split("T")[0],
  supplier: "",
};

export function ProjectCosts({ client }: ProjectCostsProps) {
  const [costs, setCosts] = useState<ProjectCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  // Templates
  const [applicableTemplates, setApplicableTemplates] = useState<ProjectCostTemplate[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
  const [showTemplateBanner, setShowTemplateBanner] = useState(false);
  const [applyingTemplates, setApplyingTemplates] = useState(false);

  const load = useCallback(async () => {
    try {
      const [data, templates] = await Promise.all([
        fetchProjectCosts(client.id),
        fetchCostTemplates(),
      ]);
      setCosts(data);

      const hasPhysicalDelivery = !client.semEntregaFisica;
      const hasPreWedding = !!(client.hasPreWedding || client.preWeddingDate);
      const hasDigitalDelivery = !!client.semEntregaFisica;

      const applicable = getApplicableTemplates(templates, {
        hasPhysicalDelivery,
        hasPreWedding,
        hasDigitalDelivery,
      });

      setApplicableTemplates(applicable);

      // Mostra banner se há templates aplicáveis e projeto ainda sem custos
      if (applicable.length > 0 && data.length === 0) {
        setSelectedTemplates(new Set(applicable.map(t => t.id)));
        setShowTemplateBanner(true);
      }
    } catch {
      toast.error("Erro ao carregar custos");
    } finally {
      setLoading(false);
    }
  }, [client.id, client.semEntregaFisica, client.hasPreWedding, client.preWeddingDate]);

  useEffect(() => { load(); }, [load]);

  const totalCosts = costs.reduce((s, c) => s + c.amount, 0);
  const receita = client.contractValue || 0;
  const margem = receita - totalCosts;
  const margemPct = receita > 0 ? (margem / receita) * 100 : 0;

  const selectedCat = COST_CATEGORIES.find(c => c.value === form.category);
  const showSupplier = selectedCat?.needsSupplier;

  const handleAdd = async () => {
    if (!form.description.trim() || !form.amount) {
      toast.error("Preencha descrição e valor");
      return;
    }
    const amountNum = parseFloat(form.amount.replace(",", "."));
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Valor inválido");
      return;
    }
    const costDate = form.date || new Date().toISOString().split("T")[0];
    setSaving(true);
    try {
      const novo = await addProjectCost(client.id, {
        category: form.category,
        description: form.description.trim(),
        amount: amountNum,
        date: costDate,
        supplier: form.supplier.trim() || undefined,
      });
      setCosts(prev => [novo, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      toast.success("Custo registrado");
    } catch (err: any) {
      const msg = err?.message || err?.error_description || JSON.stringify(err);
      toast.error(`Erro: ${msg}`);
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

  const toggleTemplate = (id: string) => {
    setSelectedTemplates(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleApplyTemplates = async () => {
    const toApply = applicableTemplates.filter(t => selectedTemplates.has(t.id));
    if (toApply.length === 0) { setShowTemplateBanner(false); return; }
    setApplyingTemplates(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const created = await Promise.all(
        toApply.map(t =>
          addProjectCost(client.id, {
            category: t.category,
            description: t.description,
            amount: t.amount,
            date: today,
            supplier: t.supplier,
          })
        )
      );
      setCosts(prev => [...created, ...prev]);
      setShowTemplateBanner(false);
      toast.success(`${created.length} custo(s) aplicado(s)`);
    } catch (err: any) {
      toast.error(`Erro: ${err.message}`);
    } finally {
      setApplyingTemplates(false);
    }
  };

  const getCat = (val: string) =>
    COST_CATEGORIES.find(c => c.value === val) ?? { label: val, emoji: "📌", needsSupplier: false };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Custos do Projeto</CardTitle>
          <div className="flex items-center gap-2">
            {applicableTemplates.length > 0 && !showTemplateBanner && (
              <Button
                size="sm" variant="outline"
                className="h-7 text-xs gap-1.5 text-purple-600 border-purple-200 hover:bg-purple-50"
                onClick={() => {
                  setSelectedTemplates(new Set(applicableTemplates.map(t => t.id)));
                  setShowTemplateBanner(true);
                }}
              >
                <Sparkles size={12} /> Custos padrão
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => setShowForm(v => !v)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar custo
            </Button>
          </div>
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
            <p className={`text-xs mb-1 ${margem >= 0 ? "text-blue-700" : "text-orange-700"}`}>Margem</p>
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

        {/* Banner de templates aplicáveis */}
        {showTemplateBanner && applicableTemplates.length > 0 && (
          <div className="border border-purple-200 bg-purple-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-purple-500" />
              <p className="text-sm font-medium text-purple-800">Custos padrão disponíveis para este projeto</p>
            </div>
            <p className="text-xs text-purple-600">
              Selecione os custos que deseja aplicar automaticamente:
            </p>
            <div className="space-y-2">
              {applicableTemplates.map(t => (
                <label
                  key={t.id}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div
                    onClick={() => toggleTemplate(t.id)}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      selectedTemplates.has(t.id)
                        ? "bg-purple-500 border-purple-500"
                        : "border-stone-300 bg-white"
                    }`}
                  >
                    {selectedTemplates.has(t.id) && <Check size={10} className="text-white" strokeWidth={3} />}
                  </div>
                  <div className="flex-1 min-w-0" onClick={() => toggleTemplate(t.id)}>
                    <span className="text-sm text-stone-700">{t.description}</span>
                    {t.supplier && <span className="text-xs text-stone-400 ml-1.5">· {t.supplier}</span>}
                  </div>
                  <span className="text-sm font-semibold text-stone-600 whitespace-nowrap">
                    R$ {Number(t.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white h-8 text-xs"
                onClick={handleApplyTemplates}
                disabled={applyingTemplates || selectedTemplates.size === 0}
              >
                <Check size={12} className="mr-1" />
                {applyingTemplates ? "Aplicando..." : `Aplicar ${selectedTemplates.size} custo(s)`}
              </Button>
              <Button
                size="sm" variant="ghost"
                className="h-8 text-xs text-stone-500"
                onClick={() => setShowTemplateBanner(false)}
              >
                <X size={12} className="mr-1" /> Ignorar
              </Button>
            </div>
          </div>
        )}

        {/* Formulário */}
        {showForm && (
          <div className="border rounded-lg p-3 space-y-2 bg-muted/30">
            <div className="grid grid-cols-2 gap-2">
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v, supplier: "" }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
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
              placeholder="Descrição (ex: Álbum 30x30cm, 60 páginas)"
              className="h-8 text-xs"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
            <div className="relative">
              <Store className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder={showSupplier ? "Fornecedor (ex: Gráfica Studio X)" : "Fornecedor (opcional)"}
                className="h-8 text-xs pl-7"
                value={form.supplier}
                onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))}
              />
            </div>
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
              <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }} className="h-8">
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Lista */}
        {loading ? (
          <p className="text-xs text-muted-foreground text-center py-4">Carregando...</p>
        ) : costs.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            Nenhum custo registrado para este projeto
          </p>
        ) : (
          <div className="space-y-2">
            {costs.map(cost => {
              const cat = getCat(cost.category);
              return (
                <div key={cost.id} className="flex items-center gap-3 p-2 rounded-lg border bg-background hover:bg-muted/30 transition-colors">
                  <span className="text-base">{cat.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{cost.description}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">{cat.label}</Badge>
                      {cost.supplier && (
                        <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                          <Store className="h-3 w-3" />{cost.supplier}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(cost.date + "T12:00:00").toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-red-600 shrink-0">{fmt(cost.amount)}</span>
                  <Button
                    size="icon" variant="ghost"
                    className="h-6 w-6 text-muted-foreground hover:text-red-600 shrink-0"
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
