
import { useClients } from "@/contexts/ClientsContext";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bell, Calendar, DollarSign } from "lucide-react";
import { useState } from "react";
import { DashboardCardModal } from "./DashboardCardModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAlerts } from "@/hooks/useAlerts";
import { AlertsTabContent } from "./AlertsTabContent";

export function AlertsReminders() {
  const { clients } = useClients();
  const navigate = useNavigate();
  const [showAllModal, setShowAllModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"tasks" | "payments" | "events">("tasks");
  
  const alerts = useAlerts(clients);
  
  const handleShowAll = (type: "tasks" | "payments" | "events") => {
    setActiveTab(type);
    setShowAllModal(true);
  };
  
  const totalAlerts = alerts.tasks.length + alerts.payments.length + alerts.events.length;

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
              <TabsList className="grid grid-cols-3 mb-4">
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
                <TabsTrigger value="events">
                  Eventos
                  {alerts.events.length > 0 && (
                    <span className="ml-2 rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-xs">
                      {alerts.events.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="tasks">
                <AlertsTabContent 
                  alerts={alerts.tasks}
                  emptyMessage="Nenhuma ação ou tarefa pendente"
                />
              </TabsContent>
              
              <TabsContent value="payments">
                <AlertsTabContent 
                  alerts={alerts.payments}
                  emptyMessage="Nenhum pagamento pendente"
                />
              </TabsContent>
              
              <TabsContent value="events">
                <AlertsTabContent 
                  alerts={alerts.events}
                  emptyMessage="Nenhum evento próximo"
                />
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
        title={
          activeTab === "tasks" ? "Todas as Ações e Tarefas" : 
          activeTab === "payments" ? "Todos os Pagamentos Pendentes" :
          "Todos os Eventos Próximos"
        }
        open={showAllModal}
        onClose={() => setShowAllModal(false)}
        clients={
          activeTab === "tasks" ? alerts.tasks.map(a => a.client) : 
          activeTab === "payments" ? alerts.payments.map(a => a.client) :
          alerts.events.map(a => a.client)
        }
        type="pending"
        customData={
          activeTab === "tasks" ? alerts.tasks : 
          activeTab === "payments" ? alerts.payments : 
          alerts.events
        }
      />
    </>
  );
}
