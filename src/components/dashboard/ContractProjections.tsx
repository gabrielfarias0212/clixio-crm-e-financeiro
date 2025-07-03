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
        

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Distribuição por Ano
            </CardTitle>
            <CardDescription>Quantidade de contratos por ano</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(yearDistribution).map(([year, count]) => <div key={year} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{year}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{
                    width: `${count / Math.max(...Object.values(yearDistribution)) * 100}%`
                  }} />
                    </div>
                    <span className="text-sm text-muted-foreground w-8">{count}</span>
                  </div>
                </div>)}
            </div>
          </CardContent>
        </Card>
      </div>

      <FutureContractsDetailModal open={modalOpen} onClose={() => setModalOpen(false)} type={modalType} />
    </>;
}