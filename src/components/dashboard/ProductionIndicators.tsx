
import { useClients } from "@/contexts/ClientsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock, CheckSquare, ClipboardCheck } from "lucide-react";
import { startOfMonth, endOfMonth, isWithinInterval, formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMemo } from "react";

export function ProductionIndicators() {
  const { clients } = useClients();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const stats = useMemo(() => {
    // Count events scheduled this month
    const eventsThisMonth = clients.filter(client => {
      if (!client.weddingDate) return false;
      const eventDate = new Date(client.weddingDate);
      return isWithinInterval(eventDate, { start: monthStart, end: monthEnd });
    }).length;

    // Count events by status
    const statusCounts = {
      scheduled: 0, // Pre-wedding scheduled
      editing: 0,   // In editing process
      delivered: 0  // Delivered
    };

    clients.forEach(client => {
      // Only count as scheduled if not delivered
      if (client.status === "em andamento") statusCounts.scheduled++;
      if (client.nextAction === "editar") statusCounts.editing++;
      if (client.status === "pago") statusCounts.delivered++;
    });

    // Calculate average delivery time (using nextAction as proxy for delivery status)
    let totalDeliveryDays = 0;
    let deliveredCount = 0;

    clients.forEach(client => {
      if (client.status === "pago" && client.weddingDate) {
        const weddingDate = new Date(client.weddingDate);
        const deliveryTime = Math.abs(now.getTime() - weddingDate.getTime());
        const deliveryDays = Math.ceil(deliveryTime / (1000 * 60 * 60 * 24));
        totalDeliveryDays += deliveryDays;
        deliveredCount++;
      }
    });

    const averageDeliveryDays = deliveredCount > 0 ? 
      Math.round(totalDeliveryDays / deliveredCount) : 0;

    return {
      eventsThisMonth,
      statusCounts,
      averageDeliveryDays
    };
  }, [clients, monthStart, monthEnd, now]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Indicadores de Produção</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <CalendarDays className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Eventos Agendados no Mês</p>
              <p className="text-xl font-bold">{stats.eventsThisMonth}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-amber-100 p-2 rounded-full">
              <Clock className="h-6 w-6 text-amber-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Prazo Médio de Entrega</p>
              <p className="text-xl font-bold">{stats.averageDeliveryDays} dias</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-purple-100 p-2 rounded-full">
              <ClipboardCheck className="h-6 w-6 text-purple-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Eventos em Edição</p>
              <p className="text-xl font-bold">{stats.statusCounts.editing}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-green-100 p-2 rounded-full">
              <CheckSquare className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Eventos Entregues</p>
              <p className="text-xl font-bold">{stats.statusCounts.delivered}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
