
import { useClients } from "@/contexts/ClientsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { isAfter, isBefore, addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell, Calendar, DollarSign } from "lucide-react";
import { useMemo } from "react";
import { Client } from "@/utils/types";

export function AlertsReminders() {
  const { clients } = useClients();
  const navigate = useNavigate();
  
  const alerts = useMemo(() => {
    const now = new Date();
    const nextWeek = addDays(now, 7);
    const nextMonth = addDays(now, 30);
    
    // Pending tasks (based on nextAction not being "nenhuma")
    const pendingTasks = clients
      .filter(client => client.nextAction !== "nenhuma")
      .map(client => ({
        type: "task",
        title: `Ação pendente: ${client.nextAction}`,
        description: `Cliente: ${client.name}`,
        client,
        date: now // Current date as these are already pending
      }))
      .slice(0, 3); // Limit to 3 pending tasks
    
    // Upcoming events (in the next 7 days)
    const upcomingEvents = clients
      .filter(client => {
        if (!client.weddingDate) return false;
        const eventDate = new Date(client.weddingDate);
        return isAfter(eventDate, now) && isBefore(eventDate, nextWeek);
      })
      .map(client => ({
        type: "event",
        title: `Evento próximo: ${client.eventCategory}`,
        description: `Cliente: ${client.name} - ${client.weddingDate ? format(new Date(client.weddingDate), "dd/MM/yyyy") : ""}`,
        client,
        date: client.weddingDate ? new Date(client.weddingDate) : now
      }));
    
    // Payment alerts (contracts without full payment)
    const paymentAlerts = clients
      .filter(client => {
        if (client.status !== "fechado" && client.status !== "em andamento") return false;
        const totalPaid = client.payments.reduce((sum, payment) => sum + payment.amount, 0);
        return totalPaid < client.contractValue; // Still has pending payments
      })
      .map(client => {
        const totalPaid = client.payments.reduce((sum, payment) => sum + payment.amount, 0);
        const pendingAmount = client.contractValue - totalPaid;
        return {
          type: "payment",
          title: `Pagamento pendente: R$ ${pendingAmount.toFixed(2)}`,
          description: `Cliente: ${client.name}`,
          client,
          date: now // Current date as these are already pending
        };
      })
      .slice(0, 3); // Limit to 3 payment alerts
    
    // Combine all alerts and sort by date
    return [...pendingTasks, ...upcomingEvents, ...paymentAlerts]
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5); // Limit total alerts to 5
  }, [clients]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "task":
        return <Bell className="h-5 w-5 text-amber-500" />;
      case "event":
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case "payment":
        return <DollarSign className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Alertas e Lembretes</CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">Nenhum alerta pendente</p>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <Alert 
                key={index} 
                className="cursor-pointer border-l-4 border-l-primary"
                onClick={() => navigate(`/clients/${alert.client.id}`)}
              >
                <div className="flex items-start">
                  <div className="mr-2">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <AlertTitle>{alert.title}</AlertTitle>
                    <AlertDescription>{alert.description}</AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
