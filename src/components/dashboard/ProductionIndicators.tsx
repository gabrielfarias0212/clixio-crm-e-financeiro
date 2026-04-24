import { useClients } from "@/contexts/ClientsContext";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Clock, ClipboardCheck, CheckSquare } from "lucide-react";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { useMemo, useState } from "react";
import { DashboardCardModal } from "./DashboardCardModal";
import { Client } from "@/utils/types";
import { stringToDate } from "@/utils/dates";

export function ProductionIndicators() {
  const { clients } = useClients();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState<"leads" | "contracts" | "delivered" | "pending">("delivered");
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);

  const stats = useMemo(() => {
    const eventsThisMonth = clients.filter(client => {
      if (!client.weddingDate) return false;
      const d = stringToDate(client.weddingDate);
      return d && isWithinInterval(d, { start: monthStart, end: monthEnd });
    });

    const editing = clients.filter(c => c.nextAction === "editar").length;
    const delivered = clients.filter(c => c.status === "projeto_finalizado").length;

    let totalDays = 0;
    let count = 0;
    clients.forEach(client => {
      if (client.status === "projeto_finalizado" && client.weddingDate) {
        const d = stringToDate(client.weddingDate);
        if (d) {
          const days = Math.ceil(Math.abs(now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
          if (days > 0 && days < 1000) { totalDays += days; count++; }
        }
      }
    });

    return {
      eventsThisMonth,
      editing,
      delivered,
      averageDeliveryDays: count > 0 ? Math.round(totalDays / count) : 0,
    };
  }, [clients, monthStart, monthEnd]);

  const handleCardClick = (type: string) => {
    const map: Record<string, { title: string; list: Client[]; modal: typeof modalType }> = {
      "events-month": {
        title: "Eventos Agendados no Mês",
        list: stats.eventsThisMonth,
        modal: "contracts",
      },
      editing: {
        title: "Eventos em Edição",
        list: clients.filter(c => c.nextAction === "editar"),
        modal: "contracts",
      },
      delivered: {
        title: "Eventos Entregues",
        list: clients.filter(c => c.status === "projeto_finalizado"),
        modal: "delivered",
      },
    };
    if (!map[type]) return;
    setModalTitle(map[type].title);
    setModalType(map[type].modal);
    setFilteredClients(map[type].list);
    setModalOpen(true);
  };

  const items = [
    {
      key: "events-month",
      label: "Eventos Agendados no Mês",
      value: stats.eventsThisMonth.length,
      icon: CalendarDays,
      clickable: true,
    },
    {
      key: "delivery",
      label: "Prazo Médio de Entrega",
      value: `${stats.averageDeliveryDays} dias`,
      icon: Clock,
      clickable: false,
    },
    {
      key: "editing",
      label: "Eventos em Edição",
      value: stats.editing,
      icon: ClipboardCheck,
      clickable: true,
    },
    {
      key: "delivered",
      label: "Eventos Entregues",
      value: stats.delivered,
      icon: CheckSquare,
      clickable: true,
    },
  ];

  return (
    <>
      <div className="w-full">
        <p className="text-[10px] font-medium tracking-widest uppercase text-stone-400 mb-3">
          Indicadores de Produção
        </p>

        <Card className="rounded-xl border-stone-200 shadow-sm">
          <CardContent className="p-0">
            <div className="grid grid-cols-2 divide-x divide-y divide-stone-100">
              {items.map(({ key, label, value, icon: Icon, clickable }) => (
                <div
                  key={key}
                  onClick={() => clickable && handleCardClick(key)}
                  className={`p-5 flex items-start gap-3 ${
                    clickable ? "cursor-pointer hover:bg-stone-50 transition-colors" : ""
                  }`}
                >
                  <Icon size={14} strokeWidth={1.5} className="text-stone-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] text-stone-400 mb-1">{label}</p>
                    <p className="font-mono text-lg font-medium text-stone-900 leading-none tracking-tight">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
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
