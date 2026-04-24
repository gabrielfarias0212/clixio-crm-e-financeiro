import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useFutureContracts } from "@/hooks/useFutureContracts";
import { FutureContractsDetailModal } from "./FutureContractsDetailModal";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function ContractProjections() {
  const { projections, contractsByYear } = useFutureContracts();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"active" | "nextYear" | "guaranteed" | "projected">("guaranteed");

  const guaranteedPct = projections.totalProjectedRevenue > 0
    ? Math.round((projections.guaranteedRevenue / projections.totalProjectedRevenue) * 100)
    : 0;

  const maxCount = Math.max(...contractsByYear.map(y => y.count), 1);

  return (
    <>
      <Card className="rounded-xl border-stone-200 shadow-sm">
        <CardContent className="p-5 space-y-5">

          {/* Receita garantida vs projetada */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] text-stone-400">Receita garantida vs projetada</p>
              <span className="font-mono text-[11px] text-stone-500">{guaranteedPct}%</span>
            </div>
            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-stone-400 rounded-full transition-all"
                style={{ width: `${guaranteedPct}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-stone-400">
                {formatCurrency(projections.guaranteedRevenue)} garantido
              </span>
              <span className="text-[10px] text-stone-400">
                {formatCurrency(projections.totalProjectedRevenue)} total
              </span>
            </div>
          </div>

          {/* Distribuição por ano */}
          {contractsByYear.length > 0 && (
            <div>
              <p className="text-[11px] text-stone-400 mb-3">Contratos por ano</p>
              <div className="space-y-2">
                {contractsByYear.map(({ year, count }) => (
                  <div key={year} className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-stone-400 w-10">{year}</span>
                    <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-stone-300 rounded-full"
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-stone-500 w-4 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={() => { setModalType("projected"); setModalOpen(true); }}
            className="w-full text-[11px] text-stone-400 hover:text-stone-600 transition-colors text-center pt-1"
          >
            Ver detalhes da projeção →
          </button>

        </CardContent>
      </Card>

      <FutureContractsDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
      />
    </>
  );
}
