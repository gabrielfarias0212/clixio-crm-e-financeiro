
import { useClients } from "@/contexts/ClientsContext";
import { Card, CardContent } from "@/components/ui/card";
import { BadgeAlert, Calendar, CalendarCheck, Users } from "lucide-react";
import { startOfMonth, endOfMonth } from "date-fns";

export function DashboardStats() {
  const { clients } = useClients();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const monthlyLeads = clients.filter(
    client => {
      const createdAt = new Date(client.createdAt);
      return createdAt >= monthStart && createdAt <= monthEnd;
    }
  ).length;

  const deliveredEvents = clients.filter(
    client => client.status === "pago"
  ).length;

  const pendingPayments = clients.filter(
    client => 
      (client.status === "em andamento" || client.status === "fechado") &&
      client.payments.reduce((sum, payment) => sum + payment.amount, 0) < client.contractValue
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
