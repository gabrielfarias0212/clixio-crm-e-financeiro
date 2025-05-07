
import { useClients } from "@/contexts/ClientsContext";
import { Card, CardContent } from "@/components/ui/card";
import { BadgeAlert, Calendar, CalendarCheck, FileCheck, Users } from "lucide-react";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { useState } from "react";
import { DashboardCardModal } from "./DashboardCardModal";
import { Client } from "@/utils/types";

export function DashboardStats() {
  const { clients } = useClients();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState<"leads" | "contracts" | "delivered" | "pending">("leads");
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);

  // Monthly leads
  const monthlyLeadsClients = clients.filter(
    client => {
      if (!client.createdAt) return false;
      const createdAt = new Date(client.createdAt);
      return isWithinInterval(createdAt, { start: monthStart, end: monthEnd });
    }
  );
  const monthlyLeads = monthlyLeadsClients.length;

  // Monthly closed contracts
  const monthlyClosedContractsClients = clients.filter(
    client => {
      if (!client.createdAt) return false;
      const createdAt = new Date(client.createdAt);
      return isWithinInterval(createdAt, { start: monthStart, end: monthEnd }) && 
             (client.status === "fechado" || client.status === "em andamento");
    }
  );
  const monthlyClosedContracts = monthlyClosedContractsClients.length;

  // Delivered events (status pago)
  const deliveredEventsClients = clients.filter(
    client => client.status === "pago"
  );
  const deliveredEvents = deliveredEventsClients.length;

  // Pending payments
  const pendingPaymentsClients = clients.filter(
    client => 
      (client.status === "em andamento" || client.status === "fechado") &&
      client.payments.reduce((sum, payment) => sum + payment.amount, 0) < client.contractValue
  );
  const pendingPayments = pendingPaymentsClients.length;

  // Handle card clicks
  const handleCardClick = (type: "leads" | "contracts" | "delivered" | "pending") => {
    let title = "";
    let clientsToShow: Client[] = [];

    switch (type) {
      case "leads":
        title = "Leads do Mês";
        clientsToShow = monthlyLeadsClients;
        break;
      case "contracts":
        title = "Contratos Fechados no Mês";
        clientsToShow = monthlyClosedContractsClients;
        break;
      case "delivered":
        title = "Eventos Entregues";
        clientsToShow = deliveredEventsClients;
        break;
      case "pending":
        title = "Pendências Financeiras";
        clientsToShow = pendingPaymentsClients;
        break;
    }

    setModalTitle(title);
    setModalType(type);
    setFilteredClients(clientsToShow);
    setModalOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCardClick("leads")}>
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

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCardClick("contracts")}>
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

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCardClick("delivered")}>
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

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCardClick("pending")}>
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

      <DashboardCardModal
        title={modalTitle}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        clients={filteredClients}
        type={modalType}
      />
    </>
  );
}
