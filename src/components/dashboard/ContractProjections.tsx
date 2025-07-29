import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, DollarSign } from "lucide-react";
import { useFutureContracts } from "@/hooks/useFutureContracts";
import { FutureContractsDetailModal } from "./FutureContractsDetailModal";
export function ContractProjections() {
  const {
    projections,
    contractsByYear
  } = useFutureContracts();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"active" | "nextYear" | "guaranteed" | "projected">("guaranteed");
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  const guaranteedPercentage = projections.totalProjectedRevenue > 0 ? projections.guaranteedRevenue / projections.totalProjectedRevenue * 100 : 0;
  const currentYear = new Date().getFullYear();
  const yearDistribution = contractsByYear.reduce((acc, year) => {
    acc[year.year] = year.count;
    return acc;
  }, {} as Record<number, number>);
  return <>
      <div className="space-y-4">
        

        
      </div>

      <FutureContractsDetailModal open={modalOpen} onClose={() => setModalOpen(false)} type={modalType} />
    </>;
}