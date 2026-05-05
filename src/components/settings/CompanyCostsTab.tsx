import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, Check, X, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ProjectCostTemplate, CostCondition,
  CONDITION_LABELS, fetchCostTemplates, addCostTemplate,
  updateCostTemplate, deleteCostTemplate,
} from "@/utils/supabase/settings";
import { COST_CATEGORIES } from "@/utils/supabase/project-costs";

const EMPTY_FORM = {
  description: "",
  amount: "",
  category: "outro",
  supplier: "",
  condition: "always" as CostCondition,
};

export function CompanyCostsTab() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<ProjectCostTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setTemplates(await fetchCostTemplates());
    } catch (e: any) {
      toast({ title: "Erro ao carregar templates", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(t: ProjectCostTemplate) {
    setEditing(t.id);
    setForm({
      description: t.description,
      amount: String(t.amount),
      category: t.category,
      supplier: t.supplier ?? "",
      condition: t.condition,
    });
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  }

  async function handleSave() {
    if (!form.description.trim()) return toast({ title: "Informe a descrição", variant: "destructive" });
    const amount = parseFloat(form.amount.replace(",", "."));
    if (isNaN(amount) || amount <= 0) return toast({ title: "Valor inválido", variant: "destructive" });

    setSaving(true);
    try {
      const payload = {
        description: form.description.trim(),
        amount,
        category: form.category,
        supplier: form.supplier.trim() || undefined,
        condition: form.condition,
      };

      if (editing) {
        await updateCostTemplate(editing, payload);
        setTemplates(prev => prev.map(t => t.id === editing ? { ...t, ...payload } : t));
        toast({ title: "Template atualizado" });
      } else {
        const created = await addCostTemplate(payload);
        setTemplates(prev => [...prev, created]);
        toast({ title: "Template criado" });
      }
      cancelForm();
    } catch (e: any) {
      toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(t: ProjectCostTemplate) {
    try {
      await updateCostTemplate(t.id, { active: !t.active });
      setTemplates(prev => prev.map(x => x.id === t.id ? { ...x, active: !t.active } : x));
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteCostTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
      setDeletingId(null);
      toast({ title: "Template removido" });
    } catch (e: any) {
      toast({ title: "Erro ao remover", description: e.message, variant: "destructive" });
    }
  }

  const catNeeds = (cat: string) => COST_CATEGORIES.find(c => c.value === cat)?.needsSupplier;

  if (loading) return <div className="text-sm text-stone-400 py-8 text-center">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-stone-800">Custos Padrão de Projeto</h2>
          <p className="text-sm text-stone-500 mt-0.5">
            Defina custos que podem ser aplicados automaticamente em novos projetos conforme as condições.
          </p>
        </div>
        <Button size="sm" onClick={openAdd} className="flex items-center gap-1.5">
          <Plus size={14} /> Novo template
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="border border-stone-200 rounded-xl p-4 bg-stone-50 space-y-4">
          <p className="text-sm font-medium text-stone-700">{editing ? "Editar template" : "Novo template de custo"}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <Label className="text-xs text-stone-500 mb-1 block">Descrição *</Label>
              <Input
                placeholder="Ex: Kit entrega física (box + pen drive)"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div>
              <Label className="text-xs text-stone-500 mb-1 block">Valor estimado (R$) *</Label>
              <Input
                placeholder="0,00"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              />
            </div>

            <div>
              <Label className="text-xs text-stone-500 mb-1 block">Categoria *</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COST_CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {catNeeds(form.category) && (
              <div>
                <Label className="text-xs text-stone-500 mb-1 block">Fornecedor</Label>
                <Input
                  placeholder="Nome do fornecedor"
                  value={form.supplier}
                  onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))}
                />
              </div>
            )}

            <div className={catNeeds(form.category) ? "" : "sm:col-span-2"}>
              <Label className="text-xs text-stone-500 mb-1 block">Aplicar quando *</Label>
              <Select value={form.condition} onValueChange={v => setForm(f => ({ ...f, condition: v as CostCondition }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(CONDITION_LABELS) as [CostCondition, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={cancelForm}><X size={14} className="mr-1" />Cancelar</Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Check size={14} className="mr-1" />{saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {templates.length === 0 && !showForm ? (
        <div className="text-center py-12 border border-dashed border-stone-200 rounded-xl">
          <p className="text-sm text-stone-400">Nenhum template cadastrado ainda.</p>
          <p className="text-xs text-stone-400 mt-1">Clique em "Novo template" para começar.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {templates.map(t => (
            <div
              key={t.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                t.active ? "bg-white border-stone-200" : "bg-stone-50 border-stone-100 opacity-60"
              }`}
            >
              {/* Condition badge */}
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                t.condition === "always"            ? "bg-blue-50 text-blue-600" :
                t.condition === "physical_delivery" ? "bg-amber-50 text-amber-600" :
                t.condition === "pre_wedding"       ? "bg-purple-50 text-purple-600" :
                                                     "bg-green-50 text-green-600"
              }`}>
                {CONDITION_LABELS[t.condition]}
              </span>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-800 truncate">{t.description}</p>
                {t.supplier && <p className="text-xs text-stone-400">{t.supplier}</p>}
              </div>

              {/* Amount */}
              <span className="text-sm font-semibold text-stone-700 whitespace-nowrap">
                R$ {Number(t.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggle(t)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                  title={t.active ? "Desativar" : "Ativar"}
                >
                  {t.active ? <ToggleRight size={16} className="text-blue-500" /> : <ToggleLeft size={16} />}
                </button>
                <button
                  onClick={() => openEdit(t)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  <Pencil size={13} />
                </button>
                {deletingId === t.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium px-1"
                    >Confirmar</button>
                    <button
                      onClick={() => setDeletingId(null)}
                      className="text-xs text-stone-400 hover:text-stone-600 px-1"
                    >Cancelar</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeletingId(t.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
