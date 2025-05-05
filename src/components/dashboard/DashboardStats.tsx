
import { useClients } from "@/contexts/ClientsContext";
import { Card, CardContent } from "@/components/ui/card";
import { BadgeAlert, Calendar, CalendarCheck, FileCheck, Users } from "lucide-react";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

export function DashboardStats() {
  const { clients } = useClients();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Novos leads do mês atual
  const monthlyLeads = clients.filter(
    client => {
      if (!client.createdAt) return false;
      const createdAt = new Date(client.createdAt);
      return isWithinInterval(createdAt, { start: monthStart, end: monthEnd });
    }
  ).length;

  // Contratos fechados no mês atual
  const monthlyClosedContracts = clients.filter(
    client => {
      if (!client.createdAt) return false;
      const createdAt = new Date(client.createdAt);
      return isWithinInterval(createdAt, { start: monthStart, end: monthEnd }) && 
             (client.status === "fechado" || client.status === "em andamento");
    }
  ).length;

  // Total de eventos entregues (status pago)
  const deliveredEvents = clients.filter(
    client => client.status === "pago"
  ).length;

  // Pendências financeiras (valores pendentes em contratos não entregues)
  const pendingPayments = clients.filter(
    client => 
      (client.status === "em andamento" || client.status === "fechado") &&
      client.payments.reduce((sum, payment) => sum + payment.amount, 0) < client.contractValue
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Leads do Mês</p>
              <p className="text-2xl font-bold">{monthlyLeads}</p>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Contratos Fechados no Mês</p>
              <p className="text-2xl font-bold">{monthlyClosedContracts}</p>
            </div>
            <FileCheck className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Eventos Entregues</p>
              <p className="text-2xl font-bold">{deliveredEvents}</p>
            </div>
            <CalendarCheck className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pendências Financeiras</p>
              <p className="text-2xl font-bold">{pendingPayments}</p>
            </div>
            <BadgeAlert className="h-8 w-8 text-red-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
