import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, Check, X, ChevronDown, ChevronUp, ToggleLeft, ToggleRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ServicePackage, PackageCost,
  fetchPackages, addPackage, updatePackage, deletePackage,
  addPackageCost, deletePackageCost,
} from "@/utils/supabase/packages";
import { COST_CATEGORIES } from "@/utils/supabase/project-costs";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(v);

const EMPTY_PKG = { name: "", description: "", price: "" };
const EMPTY_COST = { description: "", amount: "", category: "outro", supplier: "" };

export function PackagesTab() {
  const { toast } = useToast();
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [deletingPkg, setDeletingPkg] = useState<string | null>(null);
  const [deletingCost, setDeletingCost] = useState<string | null>(null);

  // Package form
  const [showPkgForm, setShowPkgForm] = useState(false);
  const [editingPkg, setEditingPkg] = useState<string | null>(null);
  const [pkgForm, setPkgForm] = useState(EMPTY_PKG);
  const [savingPkg, setSavingPkg] = useState(false);

  // Cost form per package
  const [costFormPkg, setCostFormPkg] = useState<string | null>(null);
  const [costForm, setCostForm] = useState(EMPTY_COST);
  const [savingCost, setSavingCost] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try { setPackages(await fetchPackages()); }
    catch (e: any) { toast({ title: "Erro ao carregar pacotes", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  }

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function openAddPkg() { setEditingPkg(null); setPkgForm(EMPTY_PKG); setShowPkgForm(true); }
  function openEditPkg(p: ServicePackage) {
    setEditingPkg(p.id);
    setPkgForm({ name: p.name, description: p.description ?? "", price: String(p.price) });
    setShowPkgForm(true);
  }
  function cancelPkgForm() { setShowPkgForm(false); setEditingPkg(null); setPkgForm(EMPTY_PKG); }

  async function handleSavePkg() {
    if (!pkgForm.name.trim()) return toast({ title: "Informe o nome do pacote", variant: "destructive" });
    const price = parseFloat(pkgForm.price.replace(",", "."));
    if (isNaN(price) || price < 0) return toast({ title: "Valor inválido", variant: "destructive" });
    setSavingPkg(true);
    try {
      if (editingPkg) {
        await updatePackage(editingPkg, { name: pkgForm.name.trim(), description: pkgForm.description.trim(), price });
        setPackages(prev => prev.map(p => p.id === editingPkg ? { ...p, name: pkgForm.name.trim(), description: pkgForm.description.trim(), price } : p));
        toast({ title: "Pacote atualizado" });
      } else {
        const created = await addPackage({ name: pkgForm.name.trim(), description: pkgForm.description.trim(), price });
        setPackages(prev => [...prev, created]);
        setExpanded(prev => new Set([...prev, created.id]));
        toast({ title: "Pacote criado" });
      }
      cancelPkgForm();
    } catch (e: any) {
      toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" });
    } finally { setSavingPkg(false); }
  }

  async function handleTogglePkg(p: ServicePackage) {
    try {
      await updatePackage(p.id, { active: !p.active });
      setPackages(prev => prev.map(x => x.id === p.id ? { ...x, active: !p.active } : x));
    } catch (e: any) { toast({ title: "Erro", description: e.message, variant: "destructive" }); }
  }

  async function handleDeletePkg(id: string) {
    try {
      await deletePackage(id);
      setPackages(prev => prev.filter(p => p.id !== id));
      setDeletingPkg(null);
      toast({ title: "Pacote removido" });
    } catch (e: any) { toast({ title: "Erro ao remover", description: e.message, variant: "destructive" }); }
  }

  async function handleSaveCost(pkgId: string) {
    if (!costForm.description.trim()) return toast({ title: "Informe a descrição", variant: "destructive" });
    const amount = parseFloat(costForm.amount.replace(",", "."));
    if (isNaN(amount) || amount <= 0) return toast({ title: "Valor inválido", variant: "destructive" });
    setSavingCost(true);
    try {
      const created = await addPackageCost(pkgId, {
        description: costForm.description.trim(),
        amount,
        category: costForm.category,
        supplier: costForm.supplier.trim() || undefined,
      });
      setPackages(prev => prev.map(p => p.id === pkgId ? { ...p, costs: [...p.costs, created] } : p));
      setCostForm(EMPTY_COST);
      setCostFormPkg(null);
      toast({ title: "Custo adicionado ao pacote" });
    } catch (e: any) {
      toast({ title: "Erro ao salvar custo", description: e.message, variant: "destructive" });
    } finally { setSavingCost(false); }
  }

  async function handleDeleteCost(pkgId: string, costId: string) {
    try {
      await deletePackageCost(costId);
      setPackages(prev => prev.map(p => p.id === pkgId ? { ...p, costs: p.costs.filter(c => c.id !== costId) } : p));
      setDeletingCost(null);
    } catch (e: any) { toast({ title: "Erro ao remover custo", description: e.message, variant: "destructive" }); }
  }

  const catLabel = (v: string) => COST_CATEGORIES.find(c => c.value === v)?.label ?? v;
  const catNeeds = (v: string) => COST_CATEGORIES.find(c => c.value === v)?.needsSupplier;

  if (loading) return <div className="text-sm text-stone-400 py-8 text-center">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-stone-800">Pacotes de Serviços</h2>
          <p className="text-sm text-stone-500 mt-0.5">
            Cadastre seus pacotes com preço e custos fixos de cada um. Ao fechar um contrato, aplique o pacote para preencher os dados automaticamente.
          </p>
        </div>
        <Button size="sm" onClick={openAddPkg} className="flex items-center gap-1.5">
          <Plus size={14} /> Novo pacote
        </Button>
      </div>

      {/* Package form */}
      {showPkgForm && (
        <div className="border border-stone-200 rounded-xl p-4 bg-stone-50 space-y-3">
          <p className="text-sm font-medium text-stone-700">{editingPkg ? "Editar pacote" : "Novo pacote"}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-stone-500 mb-1 block">Nome do pacote *</Label>
              <Input placeholder='Ex: Pacote Ouro' value={pkgForm.name} onChange={e => setPkgForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs text-stone-500 mb-1 block">Valor (R$) *</Label>
              <Input placeholder="0,00" value={pkgForm.price} onChange={e => setPkgForm(f => ({ ...f, price: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs text-stone-500 mb-1 block">Descrição (opcional)</Label>
              <Input placeholder="Ex: 12h de cobertura, pré-wedding incluso, álbum 30x30" value={pkgForm.description} onChange={e => setPkgForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={cancelPkgForm}><X size={14} className="mr-1" />Cancelar</Button>
            <Button size="sm" onClick={handleSavePkg} disabled={savingPkg}>
              <Check size={14} className="mr-1" />{savingPkg ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      )}

      {/* Package list */}
      {packages.length === 0 && !showPkgForm ? (
        <div className="text-center py-12 border border-dashed border-stone-200 rounded-xl">
          <Package size={28} className="text-stone-300 mx-auto mb-2" />
          <p className="text-sm text-stone-400">Nenhum pacote cadastrado ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {packages.map(pkg => {
            const isOpen = expanded.has(pkg.id);
            const totalCosts = pkg.costs.reduce((s, c) => s + Number(c.amount), 0);
            const margin = pkg.price - totalCosts;
            return (
              <div key={pkg.id} className={`border rounded-xl overflow-hidden transition-colors ${pkg.active ? "border-stone-200 bg-white" : "border-stone-100 bg-stone-50 opacity-60"}`}>
                {/* Package header */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <button onClick={() => toggleExpand(pkg.id)} className="flex-1 flex items-center gap-3 text-left">
                    <div>
                      <p className="text-sm font-semibold text-stone-800">{pkg.name}</p>
                      {pkg.description && <p className="text-xs text-stone-400 mt-0.5">{pkg.description}</p>}
                    </div>
                    <div className="ml-auto flex items-center gap-3 mr-2">
                      <span className="text-sm font-bold text-stone-700">{fmt(pkg.price)}</span>
                      {pkg.costs.length > 0 && (
                        <span className="text-xs text-stone-400">
                          {pkg.costs.length} custo{pkg.costs.length > 1 ? "s" : ""} · margem {fmt(margin)}
                        </span>
                      )}
                      {isOpen ? <ChevronUp size={15} className="text-stone-400" /> : <ChevronDown size={15} className="text-stone-400" />}
                    </div>
                  </button>
                  <button onClick={() => handleTogglePkg(pkg)} className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 transition-colors" title={pkg.active ? "Desativar" : "Ativar"}>
                    {pkg.active ? <ToggleRight size={16} className="text-blue-500" /> : <ToggleLeft size={16} />}
                  </button>
                  <button onClick={() => openEditPkg(pkg)} className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 transition-colors">
                    <Pencil size={13} />
                  </button>
                  {deletingPkg === pkg.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDeletePkg(pkg.id)} className="text-xs text-red-500 hover:text-red-700 font-medium px-1">Confirmar</button>
                      <button onClick={() => setDeletingPkg(null)} className="text-xs text-stone-400 px-1">Cancelar</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeletingPkg(pkg.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                {/* Expanded: costs */}
                {isOpen && (
                  <div className="border-t border-stone-100 px-4 py-3 space-y-2 bg-stone-50/50">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Custos fixos do pacote</p>
                      <Button
                        size="sm" variant="ghost"
                        className="h-6 text-xs gap-1 text-stone-500 hover:text-stone-700"
                        onClick={() => { setCostFormPkg(costFormPkg === pkg.id ? null : pkg.id); setCostForm(EMPTY_COST); }}
                      >
                        <Plus size={12} /> Adicionar custo
                      </Button>
                    </div>

                    {/* Cost form */}
                    {costFormPkg === pkg.id && (
                      <div className="border border-stone-200 rounded-lg p-3 bg-white space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <Select value={costForm.category} onValueChange={v => setCostForm(f => ({ ...f, category: v, supplier: "" }))}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {COST_CATEGORIES.map(c => (
                                <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input className="h-8 text-xs" placeholder="Valor (R$)" value={costForm.amount} onChange={e => setCostForm(f => ({ ...f, amount: e.target.value }))} />
                        </div>
                        <Input className="h-8 text-xs" placeholder="Descrição" value={costForm.description} onChange={e => setCostForm(f => ({ ...f, description: e.target.value }))} />
                        {catNeeds(costForm.category) && (
                          <Input className="h-8 text-xs" placeholder="Fornecedor" value={costForm.supplier} onChange={e => setCostForm(f => ({ ...f, supplier: e.target.value }))} />
                        )}
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setCostFormPkg(null)}><X size={12} className="mr-1" />Cancelar</Button>
                          <Button size="sm" className="h-7 text-xs" onClick={() => handleSaveCost(pkg.id)} disabled={savingCost}>
                            <Check size={12} className="mr-1" />{savingCost ? "Salvando..." : "Salvar"}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Cost list */}
                    {pkg.costs.length === 0 ? (
                      <p className="text-xs text-stone-400 text-center py-2">Nenhum custo cadastrado para este pacote.</p>
                    ) : (
                      <div className="space-y-1">
                        {pkg.costs.map(cost => (
                          <div key={cost.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white border border-stone-100">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-stone-700 truncate">{cost.description}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-full">{catLabel(cost.category)}</span>
                                {cost.supplier && <span className="text-[10px] text-stone-400">{cost.supplier}</span>}
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-red-600 whitespace-nowrap">
                              R$ {Number(cost.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                            {deletingCost === cost.id ? (
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleDeleteCost(pkg.id, cost.id)} className="text-xs text-red-500 font-medium">Confirmar</button>
                                <button onClick={() => setDeletingCost(null)} className="text-xs text-stone-400">Cancelar</button>
                              </div>
                            ) : (
                              <button onClick={() => setDeletingCost(cost.id)} className="w-6 h-6 flex items-center justify-center rounded text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        ))}
                        <div className="flex justify-between items-center pt-1 text-xs text-stone-500">
                          <span>Total de custos</span>
                          <span className="font-semibold text-red-600">R$ {totalCosts.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-stone-500">
                          <span>Margem estimada</span>
                          <span className={`font-semibold ${margin >= 0 ? "text-green-600" : "text-orange-600"}`}>{fmt(margin)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
