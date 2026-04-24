import { useClients } from "@/contexts/ClientsContext";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, CalendarCheck, FileCheck, Users } from "lucide-react";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { useState, useMemo } from "react";
import { DashboardCardModal } from "./DashboardCardModal";
import { MonthlyEventsModal } from "./MonthlyEventsModal";
import { Client } from "@/utils/types";
import { stringToDate } from "@/utils/dates";

export function DashboardStats() {
  const { clients } = useClients();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState<"leads" | "contracts" | "delivered" | "pending" | "monthly-events">("leads");
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [monthlyEventsModalOpen, setMonthlyEventsModalOpen] = useState(false);

  const monthlyLeadsClients = useMemo(() => clients.filter(client => {
    if (!client.createdAt || client.leadSource === "Projeto Direto") return false;
    const createdAt = stringToDate(client.createdAt);
    return createdAt && isWithinInterval(createdAt, { start: monthStart, end: monthEnd });
  }), [clients, monthStart, monthEnd]);

  const monthlyClosedContractsClients = useMemo(() => clients.filter(client => {
    if (!client.createdAt || client.leadSource === "Projeto Direto") return false;
    const createdAt = stringToDate(client.createdAt);
    return createdAt && isWithinInterval(createdAt, { start: monthStart, end: monthEnd }) && client.status === "fechado";
  }), [clients, monthStart, monthEnd]);

  const deliveredEventsClients = useMemo(() =>
    clients.filter(client => client.status === "projeto_finalizado"),
  [clients]);

  const pendingPaymentsClients = useMemo(() =>
    clients.filter(client =>
      client.status === "fechado" &&
      client.payments.reduce((sum, p) => sum + p.amount, 0) < client.contractValue
    ),
  [clients]);

  const monthlyEvents = useMemo(() => {
    let count = 0;
    clients.forEach(client => {
      if (client.weddingDate) {
        const d = stringToDate(client.weddingDate);
        if (d && isWithinInterval(d, { start: monthStart, end: monthEnd })) count++;
      }
      if (client.preWeddingDate) {
        const d = stringToDate(client.preWeddingDate);
        if (d && isWithinInterval(d, { start: monthStart, end: monthEnd })) count++;
      }
    });
    return count;
  }, [clients, monthStart, monthEnd]);

  const handleCardClick = (type: "leads" | "contracts" | "delivered" | "pending" | "monthly-events") => {
    if (type === "monthly-events") {
      setMonthlyEventsModalOpen(true);
      return;
    }
    const map = {
      leads:     { title: "Leads do Mês",               list: monthlyLeadsClients },
      contracts: { title: "Contratos Fechados no Mês",   list: monthlyClosedContractsClients },
      delivered: { title: "Eventos Entregues",           list: deliveredEventsClients },
      pending:   { title: "Pendências Financeiras",      list: pendingPaymentsClients },
    };
    const { title, list } = map[type];
    setModalTitle(title);
    setModalType(type);
    setFilteredClients(list);
    setModalOpen(true);
  };

  const stats = [
    {
      label: "Leads do Mês",
      value: monthlyLeadsClients.length,
      icon: Users,
      type: "leads" as const,
      color: "text-stone-400",
    },
    {
      label: "Contratos Fechados",
      value: monthlyClosedContractsClients.length,
      icon: FileCheck,
      type: "contracts" as const,
      color: "text-stone-400",
    },
    {
      label: "Eventos do Mês",
      value: monthlyEvents,
      icon: Calendar,
      type: "monthly-events" as const,
      color: "text-stone-400",
    },
    {
      label: "Eventos Entregues",
      value: deliveredEventsClients.length,
      icon: CalendarCheck,
      type: "delivered" as const,
      color: "text-stone-400",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, type, color }) => (
          <Card
            key={type}
            className="cursor-pointer rounded-xl border-stone-200 shadow-sm hover:shadow-md hover:border-stone-300 transition-all"
            onClick={() => handleCardClick(type)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] text-stone-400 mb-2">{label}</p>
                  <p className="font-mono text-2xl font-medium text-stone-900 leading-none tracking-tight">
                    {value}
                  </p>
                </div>
                <Icon size={16} strokeWidth={1.5} className={color} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DashboardCardModal
        title={modalTitle}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        clients={filteredClients}
        type={modalType}
      />

      <MonthlyEventsModal
        open={monthlyEventsModalOpen}
        onClose={() => setMonthlyEventsModalOpen(false)}
        clients={clients}
      />
    </>
  );
}
