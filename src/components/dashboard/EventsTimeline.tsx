
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { useFutureContracts } from "@/hooks/useFutureContracts";

export function EventsTimeline() {
  const { eventsByMonth } = useFutureContracts();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Mostrar apenas os próximos 12 meses
  const next12Months = eventsByMonth.slice(0, 12);

  if (next12Months.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Linha do Tempo - Próximos 12 Meses
          </CardTitle>
          <CardDescription>Distribuição mensal de eventos futuros</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Nenhum evento nos próximos 12 meses
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...next12Months.map(m => m.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Linha do Tempo - Próximos 12 Meses
        </CardTitle>
        <CardDescription>Distribuição mensal de eventos futuros</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {next12Months.map((monthData, index) => {
            const barWidth = maxCount > 0 ? (monthData.count / maxCount) * 100 : 0;
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium capitalize">{monthData.month}</span>
                  <div className="text-right">
                    <div className="font-medium">{monthData.count} eventos</div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(monthData.totalValue)}
                    </div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
