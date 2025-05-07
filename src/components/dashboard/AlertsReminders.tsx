import { useClients } from "@/contexts/ClientsContext";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bell, DollarSign } from "lucide-react";
import { useMemo, useState } from "react";
import { Client, Payment, AlertItem } from "@/utils/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DashboardCardModal } from "./DashboardCardModal";
import { formatDateTime, stringToDate } from "@/utils/dateUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { differenceInDays, isBefore } from "date-fns";

export function AlertsReminders() {
  const { clients } = useClients();
  const navigate = useNavigate();
  const [showAllModal, setShowAllModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"tasks" | "payments">("tasks");
  
  const alerts = useMemo(() => {
    const now = new Date();
    
    // Pending tasks (based on nextAction not being "nenhuma")
    const pendingTasks: AlertItem[] = clients
      .filter(client => client.nextAction !== "nenhuma")
      .map(client => ({
        type: "task" as const,
        title: `Ação pendente: ${client.nextAction}`,
        description: `Cliente: ${client.name}`,
        client,
        date: now, // Current date as these are already pending
        urgency: "medium" as const
      }));
    
    // Payment alerts (contracts without full payment)
    const paymentAlerts: AlertItem[] = clients
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
          date: now, // Current date as these are already pending
          urgency: "medium" as const
        };
      });

    // Due payment alerts (payments with due dates)
    const duePaymentAlerts: AlertItem[] = [];
    clients.forEach(client => {
      client.payments.forEach(payment => {
        if (payment.due_date && payment.payment_status === "pendente") {
          const dueDate = stringToDate(payment.due_date);
          if (dueDate) {
            const daysUntilDue = differenceInDays(dueDate, now);
            
            // If due date is in the past or today
            if (daysUntilDue <= 0) {
              duePaymentAlerts.push({
                type: "due_payment",
                title: `Pagamento ATRASADO: R$ ${payment.amount.toFixed(2)}`,
                description: `Cliente: ${client.name} - Venceu em ${payment.due_date}`,
                client,
                date: dueDate,
                payment,
                urgency: "high"
              });
            } 
            // If due date is within the next 7 days
            else if (daysUntilDue <= 7) {
              duePaymentAlerts.push({
                type: "due_payment",
                title: `Pagamento a vencer: R$ ${payment.amount.toFixed(2)}`,
                description: `Cliente: ${client.name} - Vence em ${daysUntilDue} ${daysUntilDue === 1 ? 'dia' : 'dias'} (${payment.due_date})`,
                client,
                date: dueDate,
                payment,
                urgency: "medium"
              });
            }
            // If due date is within the next 15 days
            else if (daysUntilDue <= 15) {
              duePaymentAlerts.push({
                type: "due_payment",
                title: `Pagamento próximo: R$ ${payment.amount.toFixed(2)}`,
                description: `Cliente: ${client.name} - Vence em ${daysUntilDue} dias (${payment.due_date})`,
                client,
                date: dueDate,
                payment,
                urgency: "low"
              });
            }
          }
        }
      });
    });
    
    // Combine and sort all due payment alerts by urgency (high -> medium -> low)
    const sortedDuePaymentAlerts = [...duePaymentAlerts].sort((a, b) => {
      const urgencyOrder = { high: 0, medium: 1, low: 2 };
      return (urgencyOrder[a.urgency || 'medium'] - urgencyOrder[b.urgency || 'medium']) || 
             differenceInDays(a.date, b.date);
    });

    return { 
      tasks: pendingTasks, 
      payments: [...paymentAlerts, ...sortedDuePaymentAlerts] as AlertItem[]
    };
  }, [clients]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "task":
        return <Bell className="h-5 w-5 text-amber-500" />;
      case "payment":
      case "due_payment":
        return <DollarSign className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getAlertClassName = (alert: AlertItem) => {
    if (alert.type === "due_payment") {
      if (alert.urgency === "high") return "cursor-pointer border-l-4 border-l-red-500";
      if (alert.urgency === "medium") return "cursor-pointer border-l-4 border-l-amber-500";
      return "cursor-pointer border-l-4 border-l-blue-500";
    }
    
    if (alert.type === "task") return "cursor-pointer border-l-4 border-l-amber-500";
    return "cursor-pointer border-l-4 border-l-green-500";
  };

  const handleShowAll = (type: "tasks" | "payments") => {
    setActiveTab(type);
    setShowAllModal(true);
  };
  
  const totalAlerts = alerts.tasks.length + alerts.payments.length;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Alertas e Lembretes</CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleShowAll("tasks")}
              className="h-8 px-2 lg:px-3"
            >
              <Bell className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Ver tarefas</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleShowAll("payments")}
              className="h-8 px-2 lg:px-3"
            >
              <DollarSign className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Ver pagamentos</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {totalAlerts === 0 ? (
            <p className="text-muted-foreground text-center py-4">Nenhum alerta pendente</p>
          ) : (
            <Tabs defaultValue="tasks" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="tasks">
                  Ações e Tarefas
                  {alerts.tasks.length > 0 && (
                    <span className="ml-2 rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-xs">
                      {alerts.tasks.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="payments">
                  Pagamentos
                  {alerts.payments.length > 0 && (
                    <span className="ml-2 rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs">
                      {alerts.payments.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="tasks">
                <ScrollArea className="h-[280px] pr-4">
                  <div className="space-y-4">
                    {alerts.tasks.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">Nenhuma ação ou tarefa pendente</p>
                    ) : (
                      alerts.tasks.map((alert, index) => (
                        <Alert 
                          key={index} 
                          className={getAlertClassName(alert)}
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
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="payments">
                <ScrollArea className="h-[280px] pr-4">
                  <div className="space-y-4">
                    {alerts.payments.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">Nenhum pagamento pendente</p>
                    ) : (
                      alerts.payments.map((alert, index) => (
                        <Alert 
                          key={index} 
                          className={getAlertClassName(alert)}
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
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
        {totalAlerts > 0 && (
          <CardFooter className="pt-0">
            <p className="text-xs text-muted-foreground">
              Total: {totalAlerts} {totalAlerts === 1 ? 'alerta' : 'alertas'}
            </p>
          </CardFooter>
        )}
      </Card>
      
      {/* Modal to display all alerts in a detailed table view */}
      <DashboardCardModal
        title={activeTab === "tasks" ? "Todas as Ações e Tarefas" : "Todos os Pagamentos Pendentes"}
        open={showAllModal}
        onClose={() => setShowAllModal(false)}
        clients={activeTab === "tasks" ? alerts.tasks.map(a => a.client) : alerts.payments.map(a => a.client)}
        type="pending"
        customData={activeTab === "tasks" ? alerts.tasks : alerts.payments}
      />
    </>
  );
}
