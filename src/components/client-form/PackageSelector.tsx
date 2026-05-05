import { useEffect, useState } from "react";
import { Package, ChevronDown, X } from "lucide-react";
import { ServicePackage, PackageCategory, fetchPackages, fetchPackageCategories } from "@/utils/supabase/packages";

interface PackageSelectorProps {
  selectedId: string | null;
  onSelect: (pkg: ServicePackage | null) => void;
}

export function PackageSelector({ selectedId, onSelect }: PackageSelectorProps) {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [categories, setCategories] = useState<PackageCategory[]>([]);
  const [filterCat, setFilterCat] = useState<string>("all");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    Promise.all([fetchPackages(), fetchPackageCategories()])
      .then(([pkgs, cats]) => {
        setPackages(pkgs.filter(p => p.active));
        setCategories(cats);
      })
      .catch(() => {});
  }, []);

  const selected = packages.find(p => p.id === selectedId) ?? null;
  const filtered = filterCat === "all" ? packages : packages.filter(p => p.category_id === filterCat);
  const getCatName = (id?: string | null) => categories.find(c => c.id === id)?.name;

  if (packages.length === 0) return null;

  return (
    <div className="col-span-2">
      <label className="text-sm font-medium text-stone-700 block mb-1.5">
        Pacote de serviço
        <span className="text-stone-400 font-normal ml-1">(opcional)</span>
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center gap-2 px-3 py-2.5 border border-stone-200 rounded-lg bg-white text-left text-sm hover:border-stone-300 transition-colors"
        >
          <Package size={15} className="text-stone-400 flex-shrink-0" />
          {selected ? (
            <span className="flex-1 text-stone-800 font-medium">
              {selected.name}
              {getCatName(selected.category_id) && (
                <span className="ml-2 text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-full font-normal">
                  {getCatName(selected.category_id)}
                </span>
              )}
              <span className="ml-2 text-stone-400 font-normal">
                R$ {Number(selected.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </span>
          ) : (
            <span className="flex-1 text-stone-400">Selecionar pacote...</span>
          )}
          {selected ? (
            <span
              onClick={e => { e.stopPropagation(); onSelect(null); }}
              className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              <X size={12} />
            </span>
          ) : (
            <ChevronDown size={14} className="text-stone-400" />
          )}
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg z-20 overflow-hidden">
              {/* Category filter */}
              {categories.length > 0 && (
                <div className="flex gap-1.5 p-2 border-b border-stone-100 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setFilterCat("all")}
                    className={`text-xs px-2.5 py-1 rounded-full transition-colors ${filterCat === "all" ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"}`}
                  >
                    Todos
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFilterCat(cat.id)}
                      className={`text-xs px-2.5 py-1 rounded-full transition-colors ${filterCat === cat.id ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}

              <div className="p-1 max-h-64 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => { onSelect(null); setOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-stone-400 hover:bg-stone-50 rounded-lg"
                >
                  Sem pacote / valor personalizado
                </button>
                {filtered.length === 0 ? (
                  <p className="text-xs text-stone-400 text-center py-3">Nenhum pacote nesta categoria</p>
                ) : filtered.map(pkg => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => { onSelect(pkg); setOpen(false); }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-stone-50 ${selectedId === pkg.id ? "bg-stone-50" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-medium text-stone-800 truncate">{pkg.name}</span>
                        {getCatName(pkg.category_id) && (
                          <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                            {getCatName(pkg.category_id)}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold text-stone-700 whitespace-nowrap flex-shrink-0">
                        R$ {Number(pkg.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {pkg.description && (
                      <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{pkg.description}</p>
                    )}
                    {pkg.costs.length > 0 && (
                      <p className="text-xs text-purple-500 mt-0.5">
                        {pkg.costs.length} custo{pkg.costs.length > 1 ? "s" : ""} fixo{pkg.costs.length > 1 ? "s" : ""} incluso{pkg.costs.length > 1 ? "s" : ""}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {selected && (
        <p className="text-xs text-stone-400 mt-1.5 flex items-center gap-1">
          <Package size={11} />
          Valor preenchido automaticamente. Edite o campo acima se precisar personalizar.
        </p>
      )}
    </div>
  );
}
