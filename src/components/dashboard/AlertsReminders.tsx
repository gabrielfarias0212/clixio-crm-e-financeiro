
import { useClients } from "@/contexts/ClientsContext";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { isAfter, isBefore, addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell, Calendar, DollarSign, Eye } from "lucide-react";
import { useMemo, useState } from "react";
import { Client } from "@/utils/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DashboardCardModal } from "./DashboardCardModal";
import { formatDateTime, stringToDate } from "@/utils/dateUtils";

// Define an interface for alerts with all necessary properties
interface AlertItem {
  type: "task" | "event" | "payment";
  title: string;
  description: string;
  client: Client;
  date: Date;
}

export function AlertsReminders() {
  const { clients } = useClients();
  const navigate = useNavigate();
  const [showAllModal, setShowAllModal] = useState(false);
  
  const alerts = useMemo(() => {
    const now = new Date();
    const nextWeek = addDays(now, 7);
    const nextMonth = addDays(now, 30);
    
    // Pending tasks (based on nextAction not being "nenhuma")
    const pendingTasks = clients
      .filter(client => client.nextAction !== "nenhuma")
      .map(client => ({
        type: "task" as const,
        title: `Ação pendente: ${client.nextAction}`,
        description: `Cliente: ${client.name}`,
        client,
        date: now // Current date as these are already pending
      }));
    
    // Upcoming events (in the next 7 days)
    const upcomingEvents = clients
      .filter(client => {
        if (!client.weddingDate) return false;
        try {
          const eventDate = stringToDate(client.weddingDate);
          return eventDate && isAfter(eventDate, now) && isBefore(eventDate, nextWeek);
        } catch (error) {
          console.error("Error processing wedding date:", client.weddingDate, error);
          return false;
        }
      })
      .map(client => ({
        type: "event" as const,
        title: `Evento próximo: ${client.eventCategory}`,
        description: `Cliente: ${client.name} - ${client.weddingDate ? formatDateTime(client.weddingDate) : ""}`,
        client,
        date: stringToDate(client.weddingDate) || now
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
          type: "payment" as const,
          title: `Pagamento pendente: R$ ${pendingAmount.toFixed(2)}`,
          description: `Cliente: ${client.name}`,
          client,
          date: now // Current date as these are already pending
        };
      });
    
    // Combine all alerts and sort by date
    return [...pendingTasks, ...upcomingEvents, ...paymentAlerts]
      .sort((a, b) => a.date.getTime() - b.date.getTime());
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

  // Group alerts by type for the modal view
  const taskAlerts = alerts.filter(alert => alert.type === "task");
  const eventAlerts = alerts.filter(alert => alert.type === "event");
  const paymentAlerts = alerts.filter(alert => alert.type === "payment");
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Alertas e Lembretes</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAllModal(true)}
            className="h-8 px-2 lg:px-3"
          >
            <Eye className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Ver todos</span>
          </Button>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Nenhum alerta pendente</p>
          ) : (
            <ScrollArea className="h-[350px] pr-4">
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
            </ScrollArea>
          )}
        </CardContent>
        {alerts.length > 0 && (
          <CardFooter className="pt-0">
            <p className="text-xs text-muted-foreground">
              Total: {alerts.length} {alerts.length === 1 ? 'alerta' : 'alertas'}
            </p>
          </CardFooter>
        )}
      </Card>
      
      {/* Modal to display all alerts in a detailed table view */}
      <DashboardCardModal
        title="Todos os Alertas e Lembretes"
        open={showAllModal}
        onClose={() => setShowAllModal(false)}
        clients={alerts.map(a => a.client)}
        type="pending"
        customData={alerts}
      />
    </>
  );
}
