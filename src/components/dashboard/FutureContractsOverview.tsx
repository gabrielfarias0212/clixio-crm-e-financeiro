import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, TrendingUp, DollarSign, Target } from "lucide-react";
import { useFutureContracts } from "@/hooks/useFutureContracts";
import { FutureContractsDetailModal } from "./FutureContractsDetailModal";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function FutureContractsOverview() {
  const { projections } = useFutureContracts();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"active" | "nextYear" | "guaranteed" | "projected">("active");

  const handleCardClick = (type: typeof modalType) => {
    setModalType(type);
    setModalOpen(true);
  };

  const cards = [
    {
      type: "active" as const,
      label: "Contratos Ativos",
      value: String(projections.totalActiveContracts),
      sub: "Total de contratos futuros",
      icon: Target,
    },
    {
      type: "nextYear" as const,
      label: "Próximo Ano",
      value: String(projections.nextYearContracts),
      sub: formatCurrency(projections.nextYearRevenue),
      icon: CalendarDays,
    },
    {
      type: "guaranteed" as const,
      label: "Receita Garantida",
      value: formatCurrency(projections.guaranteedRevenue),
      sub: "Contratos fechados/pagos",
      icon: DollarSign,
    },
    {
      type: "projected" as const,
      label: "Projeção Total",
      value: formatCurrency(projections.totalProjectedRevenue),
      sub: "Valor total projetado",
      icon: TrendingUp,
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map(({ type, label, value, sub, icon: Icon }) => (
          <Card
            key={type}
            onClick={() => handleCardClick(type)}
            className="cursor-pointer rounded-xl border-stone-200 shadow-sm hover:shadow-md hover:border-stone-300 transition-all"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <p className="text-[11px] text-stone-400">{label}</p>
                <Icon size={13} strokeWidth={1.5} className="text-stone-300 flex-shrink-0" />
              </div>
              <p className="font-mono text-xl font-medium text-stone-900 leading-none tracking-tight mb-1">
                {value}
              </p>
              <p className="text-[11px] text-stone-400">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <FutureContractsDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
      />
    </>
  );
}
