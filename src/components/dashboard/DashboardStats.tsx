import { useClients } from "@/contexts/ClientsContext";
import { Card, CardContent } from "@/components/ui/card";
import { BadgeAlert, Calendar, CalendarCheck, FileCheck, Users } from "lucide-react";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { useState, useMemo } from "react";
import { DashboardCardModal } from "./DashboardCardModal";
import { MonthlyEventsModal } from "./MonthlyEventsModal";
import { Client } from "@/utils/types";
import { stringToDate } from "@/utils/dates";
export function DashboardStats() {
  const {
    clients
  } = useClients();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState<"leads" | "contracts" | "delivered" | "pending" | "monthly-events">("leads");
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [monthlyEventsModalOpen, setMonthlyEventsModalOpen] = useState(false);

  // Monthly leads
  const monthlyLeadsClients = useMemo(() => {
    return clients.filter(client => {
      if (!client.createdAt) return false;
      const createdAt = stringToDate(client.createdAt);
      return createdAt && isWithinInterval(createdAt, {
        start: monthStart,
        end: monthEnd
      });
    });
  }, [clients, monthStart, monthEnd]);
  const monthlyLeads = monthlyLeadsClients.length;

  // Monthly closed contracts - using "fechado" status
  const monthlyClosedContractsClients = useMemo(() => {
    return clients.filter(client => {
      if (!client.createdAt) return false;
      const createdAt = stringToDate(client.createdAt);
      return createdAt && isWithinInterval(createdAt, {
        start: monthStart,
        end: monthEnd
      }) && client.status === "fechado";
    });
  }, [clients, monthStart, monthEnd]);
  const monthlyClosedContracts = monthlyClosedContractsClients.length;

  // Delivered events - using "projeto_finalizado" status
  const deliveredEventsClients = useMemo(() => {
    return clients.filter(client => client.status === "projeto_finalizado");
  }, [clients]);
  const deliveredEvents = deliveredEventsClients.length;

  // Pending payments - clients with "fechado" status and incomplete payments
  const pendingPaymentsClients = useMemo(() => {
    return clients.filter(client => client.status === "fechado" && client.payments.reduce((sum, payment) => sum + payment.amount, 0) < client.contractValue);
  }, [clients]);
  const pendingPayments = pendingPaymentsClients.length;

  // Monthly events - events happening this month (wedding or pre-wedding dates)
  const monthlyEvents = useMemo(() => {
    let eventsCount = 0;
    clients.forEach(client => {
      // Check wedding date
      if (client.weddingDate) {
        const weddingDate = stringToDate(client.weddingDate);
        if (weddingDate && isWithinInterval(weddingDate, {
          start: monthStart,
          end: monthEnd
        })) {
          eventsCount++;
        }
      }

      // Check pre-wedding date
      if (client.preWeddingDate) {
        const preWeddingDate = stringToDate(client.preWeddingDate);
        if (preWeddingDate && isWithinInterval(preWeddingDate, {
          start: monthStart,
          end: monthEnd
        })) {
          eventsCount++;
        }
      }
    });
    return eventsCount;
  }, [clients, monthStart, monthEnd]);

  // Handle card clicks
  const handleCardClick = (type: "leads" | "contracts" | "delivered" | "pending" | "monthly-events") => {
    if (type === "monthly-events") {
      setMonthlyEventsModalOpen(true);
      return;
    }
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
  return <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                <p className="text-sm font-medium text-muted-foreground">Contratos Fechados</p>
                <p className="text-2xl font-bold">{monthlyClosedContracts}</p>
              </div>
              <FileCheck className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCardClick("monthly-events")}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Eventos do Mês</p>
                <p className="text-2xl font-bold">{monthlyEvents}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
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
              <CalendarCheck className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        
      </div>

      <DashboardCardModal title={modalTitle} open={modalOpen} onClose={() => setModalOpen(false)} clients={filteredClients} type={modalType} />

      <MonthlyEventsModal open={monthlyEventsModalOpen} onClose={() => setMonthlyEventsModalOpen(false)} clients={clients} />
    </>;
}