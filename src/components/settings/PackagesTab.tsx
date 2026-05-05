import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, Check, X, ChevronDown, ChevronUp, ToggleLeft, ToggleRight, Package, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ServicePackage, PackageCost, PackageCategory,
  fetchPackages, addPackage, updatePackage, deletePackage,
  addPackageCost, deletePackageCost,
  fetchPackageCategories, addPackageCategory, deletePackageCategory,
} from "@/utils/supabase/packages";
import { COST_CATEGORIES } from "@/utils/supabase/project-costs";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(v);

const EMPTY_PKG = { name: "", description: "", price: "", category_id: "" };
const EMPTY_COST = { description: "", amount: "", category: "outro", supplier: "" };

export function PackagesTab() {
  const { toast } = useToast();
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [categories, setCategories] = useState<PackageCategory[]>([]);
  const [filterCat, setFilterCat] = useState<string>("all");
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

  // Category management
  const [showCatManager, setShowCatManager] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [addingCat, setAddingCat] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [pkgs, cats] = await Promise.all([fetchPackages(), fetchPackageCategories()]);
      setPackages(pkgs);
      setCategories(cats);
    } catch (e: any) {
      toast({ title: "Erro ao carregar pacotes", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCategory() {
    if (!newCatName.trim()) return;
    setAddingCat(true);
    try {
      const created = await addPackageCategory(newCatName);
      setCategories(prev => [...prev, created]);
      setNewCatName("");
      toast({ title: "Categoria criada" });
    } catch (e: any) {
      toast({ title: "Erro ao criar categoria", description: e.message, variant: "destructive" });
    } finally { setAddingCat(false); }
  }

  async function handleDeleteCategory(id: string) {
    try {
      await deletePackageCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      setPackages(prev => prev.map(p => p.category_id === id ? { ...p, category_id: null } : p));
    } catch (e: any) {
      toast({ title: "Erro ao remover categoria", description: e.message, variant: "destructive" });
    }
  }

  function toggleExpand(id: string) {
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function openAddPkg() { setEditingPkg(null); setPkgForm(EMPTY_PKG); setShowPkgForm(true); }
  function openEditPkg(p: ServicePackage) {
    setEditingPkg(p.id);
    setPkgForm({ name: p.name, description: p.description ?? "", price: String(p.price), category_id: p.category_id ?? "" });
    setShowPkgForm(true);
  }
  function cancelPkgForm() { setShowPkgForm(false); setEditingPkg(null); setPkgForm(EMPTY_PKG); }

  async function handleSavePkg() {
    if (!pkgForm.name.trim()) return toast({ title: "Informe o nome do pacote", variant: "destructive" });
    const price = parseFloat(pkgForm.price.replace(",", "."));
    if (isNaN(price) || price < 0) return toast({ title: "Valor inválido", variant: "destructive" });
    setSavingPkg(true);
    try {
      const payload = {
        name: pkgForm.name.trim(),
        description: pkgForm.description.trim(),
        price,
        category_id: pkgForm.category_id || null,
      };
      if (editingPkg) {
        await updatePackage(editingPkg, payload);
        setPackages(prev => prev.map(p => p.id === editingPkg ? { ...p, ...payload } : p));
        toast({ title: "Pacote atualizado" });
      } else {
        const created = await addPackage(payload);
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
        description: costForm.description.trim(), amount,
        category: costForm.category,
        supplier: costForm.supplier.trim() || undefined,
      });
      setPackages(prev => prev.map(p => p.id === pkgId ? { ...p, costs: [...p.costs, created] } : p));
      setCostForm(EMPTY_COST); setCostFormPkg(null);
      toast({ title: "Custo adicionado ao pacote" });
    } catch (e: any) { toast({ title: "Erro", description: e.message, variant: "destructive" }); }
    finally { setSavingCost(false); }
  }

  async function handleDeleteCost(pkgId: string, costId: string) {
    try {
      await deletePackageCost(costId);
      setPackages(prev => prev.map(p => p.id === pkgId ? { ...p, costs: p.costs.filter(c => c.id !== costId) } : p));
      setDeletingCost(null);
    } catch (e: any) { toast({ title: "Erro", description: e.message, variant: "destructive" }); }
  }

  const catLabel = (v: string) => COST_CATEGORIES.find(c => c.value === v)?.label ?? v;
  const catNeeds = (v: string) => COST_CATEGORIES.find(c => c.value === v)?.needsSupplier;
  const getCatName = (id?: string | null) => id ? categories.find(c => c.id === id)?.name : null;

  const filtered = filterCat === "all" ? packages : packages.filter(p => p.category_id === filterCat);

  if (loading) return <div className="text-sm text-stone-400 py-8 text-center">Carregando...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-stone-800">Pacotes de Serviços</h2>
          <p className="text-sm text-stone-500 mt-0.5">Cadastre seus pacotes com categorias, preço e custos fixos.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowCatManager(v => !v)} className="gap-1.5 text-xs">
            <Tag size={13} /> Categorias
          </Button>
          <Button size="sm" onClick={openAddPkg} className="gap-1.5">
            <Plus size={14} /> Novo pacote
          </Button>
        </div>
      </div>

      {/* Category manager */}
      {showCatManager && (
        <div className="border border-stone-200 rounded-xl p-4 bg-stone-50 space-y-3">
          <p className="text-sm font-medium text-stone-700">Gerenciar categorias</p>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-full px-3 py-1 text-xs text-stone-700">
                {cat.name}
                <button onClick={() => handleDeleteCategory(cat.id)} className="text-stone-300 hover:text-red-500 transition-colors ml-0.5">
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              className="h-8 text-xs max-w-xs"
              placeholder="Nova categoria..."
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddCategory()}
            />
            <Button size="sm" className="h-8 text-xs" onClick={handleAddCategory} disabled={addingCat || !newCatName.trim()}>
              <Plus size={12} className="mr-1" /> Adicionar
            </Button>
          </div>
        </div>
      )}

      {/* Category filter pills */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCat("all")}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filterCat === "all" ? "bg-stone-800 text-white border-stone-800" : "bg-white text-stone-500 border-stone-200 hover:border-stone-300"}`}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilterCat(cat.id)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filterCat === cat.id ? "bg-stone-800 text-white border-stone-800" : "bg-white text-stone-500 border-stone-200 hover:border-stone-300"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Package form */}
      {showPkgForm && (
        <div className="border border-stone-200 rounded-xl p-4 bg-stone-50 space-y-3">
          <p className="text-sm font-medium text-stone-700">{editingPkg ? "Editar pacote" : "Novo pacote"}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-stone-500 mb-1 block">Nome *</Label>
              <Input placeholder="Ex: Pacote Ouro" value={pkgForm.name} onChange={e => setPkgForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs text-stone-500 mb-1 block">Valor (R$) *</Label>
              <Input placeholder="0,00" value={pkgForm.price} onChange={e => setPkgForm(f => ({ ...f, price: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs text-stone-500 mb-1 block">Categoria</Label>
              <Select value={pkgForm.category_id || "none"} onValueChange={v => setPkgForm(f => ({ ...f, category_id: v === "none" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem categoria</SelectItem>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-stone-500 mb-1 block">Descrição</Label>
              <Input placeholder="Ex: 12h de cobertura, álbum incluso" value={pkgForm.description} onChange={e => setPkgForm(f => ({ ...f, description: e.target.value }))} />
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
      {filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-stone-200 rounded-xl">
          <Package size={28} className="text-stone-300 mx-auto mb-2" />
          <p className="text-sm text-stone-400">{filterCat === "all" ? "Nenhum pacote cadastrado." : "Nenhum pacote nesta categoria."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(pkg => {
            const isOpen = expanded.has(pkg.id);
            const totalCosts = pkg.costs.reduce((s, c) => s + Number(c.amount), 0);
            const margin = pkg.price - totalCosts;
            const catName = getCatName(pkg.category_id);
            return (
              <div key={pkg.id} className={`border rounded-xl overflow-hidden ${pkg.active ? "border-stone-200 bg-white" : "border-stone-100 bg-stone-50 opacity-60"}`}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <button onClick={() => toggleExpand(pkg.id)} className="flex-1 flex items-center gap-3 text-left min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-stone-800">{pkg.name}</p>
                        {catName && (
                          <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">{catName}</span>
                        )}
                      </div>
                      {pkg.description && <p className="text-xs text-stone-400 mt-0.5 truncate">{pkg.description}</p>}
                    </div>
                    <div className="flex items-center gap-3 ml-auto mr-2 flex-shrink-0">
                      <span className="text-sm font-bold text-stone-700">{fmt(pkg.price)}</span>
                      {pkg.costs.length > 0 && (
                        <span className="text-xs text-stone-400 hidden sm:block">
                          {pkg.costs.length} custo{pkg.costs.length > 1 ? "s" : ""} · {fmt(margin)}
                        </span>
                      )}
                      {isOpen ? <ChevronUp size={15} className="text-stone-400" /> : <ChevronDown size={15} className="text-stone-400" />}
                    </div>
                  </button>
                  <button onClick={() => handleTogglePkg(pkg)} className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 transition-colors">
                    {pkg.active ? <ToggleRight size={16} className="text-blue-500" /> : <ToggleLeft size={16} />}
                  </button>
                  <button onClick={() => openEditPkg(pkg)} className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 transition-colors">
                    <Pencil size={13} />
                  </button>
                  {deletingPkg === pkg.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDeletePkg(pkg.id)} className="text-xs text-red-500 font-medium px-1">Confirmar</button>
                      <button onClick={() => setDeletingPkg(null)} className="text-xs text-stone-400 px-1">Cancelar</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeletingPkg(pkg.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                {isOpen && (
                  <div className="border-t border-stone-100 px-4 py-3 space-y-2 bg-stone-50/50">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Custos fixos do pacote</p>
                      <Button size="sm" variant="ghost" className="h-6 text-xs gap-1 text-stone-500" onClick={() => { setCostFormPkg(costFormPkg === pkg.id ? null : pkg.id); setCostForm(EMPTY_COST); }}>
                        <Plus size={12} /> Adicionar custo
                      </Button>
                    </div>
                    {costFormPkg === pkg.id && (
                      <div className="border border-stone-200 rounded-lg p-3 bg-white space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <Select value={costForm.category} onValueChange={v => setCostForm(f => ({ ...f, category: v, supplier: "" }))}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {COST_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>)}
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
                            <Check size={12} className="mr-1" />{savingCost ? "..." : "Salvar"}
                          </Button>
                        </div>
                      </div>
                    )}
                    {pkg.costs.length === 0 ? (
                      <p className="text-xs text-stone-400 text-center py-2">Nenhum custo cadastrado.</p>
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
                            <span className="text-xs font-semibold text-red-600 whitespace-nowrap">R$ {Number(cost.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
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
                        <div className="flex justify-between text-xs text-stone-500 pt-1">
                          <span>Total custos</span>
                          <span className="font-semibold text-red-600">R$ {totalCosts.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-xs text-stone-500">
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
