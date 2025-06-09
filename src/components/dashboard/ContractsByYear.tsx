
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFutureContracts } from "@/hooks/useFutureContracts";

export function ContractsByYear() {
  const { contractsByYear } = useFutureContracts();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fechado':
        return 'bg-green-100 text-green-800';
      case 'em andamento':
        return 'bg-blue-100 text-blue-800';
      case 'pago':
        return 'bg-emerald-100 text-emerald-800';
      case 'entregue':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (contractsByYear.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contratos por Ano</CardTitle>
          <CardDescription>Distribuição de contratos pelos próximos anos</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Nenhum contrato futuro encontrado
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contratos por Ano</CardTitle>
        <CardDescription>Distribuição de contratos pelos próximos anos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contractsByYear.map((yearData) => (
            <div key={yearData.year} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">{yearData.year}</h3>
                <div className="text-right">
                  <div className="text-sm font-medium">{yearData.count} contratos</div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(yearData.totalValue)}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {Object.entries(yearData.statusBreakdown).map(([status, count]) => (
                  <Badge 
                    key={status} 
                    variant="secondary" 
                    className={getStatusColor(status)}
                  >
                    {status}: {count}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
