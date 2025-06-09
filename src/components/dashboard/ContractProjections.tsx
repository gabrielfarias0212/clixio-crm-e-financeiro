
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, DollarSign } from "lucide-react";
import { useFutureContracts } from "@/hooks/useFutureContracts";

export function ContractProjections() {
  const { projections, contractsByYear } = useFutureContracts();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const guaranteedPercentage = projections.totalProjectedRevenue > 0 
    ? (projections.guaranteedRevenue / projections.totalProjectedRevenue) * 100 
    : 0;

  const currentYear = new Date().getFullYear();
  const yearDistribution = contractsByYear.reduce((acc, year) => {
    acc[year.year] = year.count;
    return acc;
  }, {} as Record<number, number>);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Análise de Receita
          </CardTitle>
          <CardDescription>Distribuição entre receita garantida e projetada</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Receita Garantida</span>
              <span>{guaranteedPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={guaranteedPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{formatCurrency(projections.guaranteedRevenue)}</span>
              <span>{formatCurrency(projections.totalProjectedRevenue)}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(projections.guaranteedRevenue)}
              </div>
              <div className="text-xs text-muted-foreground">Garantida</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(projections.totalProjectedRevenue - projections.guaranteedRevenue)}
              </div>
              <div className="text-xs text-muted-foreground">Projetada</div>
            </div>
          </div>
        </CardContent>
      </Card>

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
            {Object.entries(yearDistribution).map(([year, count]) => (
              <div key={year} className="flex items-center justify-between">
                <span className="text-sm font-medium">{year}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ 
                        width: `${(count / Math.max(...Object.values(yearDistribution))) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
