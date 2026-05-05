import { useMemo } from "react";
import { addDays, isAfter, isBefore, startOfDay, differenceInDays } from "date-fns";
import { Client, EventCategory, CalendarEvent } from "@/utils/types";
import { Calendar, MapPin, DollarSign, Clock } from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { useNavigate } from "react-router-dom";
import { stringToDate } from "@/utils/dates";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";

interface UpcomingEventsProps {
  clients: Client[];
  loading: boolean;
}

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(v);

function categoryBadge(cat: string) {
  const c = (cat || "").toLowerCase();
  if (c.includes("casamento"))  return { label: "💍 Casamento",   cls: "bg-rose-50 text-rose-700 border-rose-200" };
  if (c.includes("ensaio"))     return { label: "📸 Ensaio",      cls: "bg-blue-50 text-blue-700 border-blue-200" };
  if (c.includes("pre") || c.includes("pré")) return { label: "🌅 Pré-Wedding", cls: "bg-amber-50 text-amber-700 border-amber-200" };
  if (c.includes("debutante"))  return { label: "🎀 Debutante",   cls: "bg-purple-50 text-purple-700 border-purple-200" };
  if (c.includes("aniversar"))  return { label: "🎂 Aniversário", cls: "bg-green-50 text-green-700 border-green-200" };
  return { label: cat || "Evento", cls: "bg-gray-50 text-gray-700 border-gray-200" };
}

function daysLabel(days: number) {
  if (days === 0) return { text: "Hoje!", cls: "text-red-600 font-bold" };
  if (days === 1) return { text: "Amanhã", cls: "text-orange-600 font-semibold" };
  if (days <= 7)  return { text: `Em ${days} dias`, cls: "text-orange-500" };
  return { text: `Em ${days} dias`, cls: "text-gray-500" };
}

export function UpcomingEvents({ clients, loading }: UpcomingEventsProps) {
  const navigate = useNavigate();
  const { events } = useCalendarEvents();

  const upcomingEvents = useMemo(() => {
    const today = startOfDay(new Date());
    const window = addDays(today, 60);

    type Item = {
      key: string;
      title: string;
      dateObj: Date;
      dateStr: string;
      category: string;
      location: string;
      contractValue?: number;
      time?: string;
      clientId?: string;
      isPreWedding?: boolean;
      isCalendar?: boolean;
    };

    const items: Item[] = [];

    clients.forEach(client => {
      if (!client.weddingDate) return;
      const d = stringToDate(client.weddingDate);
      if (d && isAfter(d, today) && isBefore(d, window)) {
        items.push({
          key: `client-${client.id}`,
          title: client.name,
          dateObj: d,
          dateStr: client.weddingDate,
          category: client.eventCategory,
          location: client.eventLocation || "",
          contractValue: client.contractValue,
          time: client.weddingStartTime,
          clientId: client.id,
        });
      }
      // pre-wedding
      if (client.hasPreWedding && client.preWeddingDate) {
        const dp = stringToDate(client.preWeddingDate);
        if (dp && isAfter(dp, today) && isBefore(dp, window)) {
          items.push({
            key: `prewed-${client.id}`,
            title: client.name,
            dateObj: dp,
            dateStr: client.preWeddingDate,
            category: "Pré-Wedding",
            location: client.eventLocation || "",
            contractValue: client.contractValue,
            time: client.preWeddingStartTime,
            clientId: client.id,
            isPreWedding: true,
          });
        }
      }
    });

    events.forEach(event => {
      const d = stringToDate(event.date);
      if (d && isAfter(d, today) && isBefore(d, window)) {
        items.push({
          key: `cal-${event.id}`,
          title: event.title,
          dateObj: d,
          dateStr: event.date,
          category: "Calendário",
          location: event.description || "",
          time: event.startTime,
          isCalendar: true,
        });
      }
    });

    return items.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  }, [clients, events]);

  return (
    <Card className="rounded-xl border-stone-200 shadow-sm overflow-hidden">
      <CardHeader className="px-5 py-4 border-b border-stone-100 flex flex-row items-center justify-between">
        <p className="text-[10px] font-medium tracking-widest uppercase text-stone-400">
          Próximos Eventos — 60 dias
        </p>
        <span className="text-xs text-stone-400 font-medium">{upcomingEvents.length} evento{upcomingEvents.length !== 1 ? "s" : ""}</span>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="px-5 py-8 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-stone-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Calendar size={24} strokeWidth={1} className="text-stone-300 mx-auto mb-2" />
            <p className="text-[11px] text-stone-400">Nenhum evento nos próximos 60 dias</p>
          </div>
        ) : (
          <ul className="divide-y divide-stone-100">
            {upcomingEvents.map(event => {
              const days = differenceInDays(event.dateObj, startOfDay(new Date()));
              const dLabel = daysLabel(days);
              const badge = categoryBadge(event.category);
              return (
                <li
                  key={event.key}
                  onClick={() => event.clientId ? navigate(`/clients/${event.clientId}`) : navigate("/calendar")}
                  className="px-5 py-3.5 hover:bg-stone-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[13px] font-semibold text-stone-800 truncate">{event.title}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium shrink-0 ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                        <span className="flex items-center gap-1 text-[11px] text-stone-400">
                          <Calendar size={10} strokeWidth={1.5} />
                          {event.dateStr}
                          {event.time && <><Clock size={10} className="ml-1" />{event.time}</>}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1 text-[11px] text-stone-400">
                            <MapPin size={10} strokeWidth={1.5} />
                            {event.location}
                          </span>
                        )}
                        {event.contractValue != null && event.contractValue > 0 && (
                          <span className="flex items-center gap-1 text-[11px] text-green-600 font-medium">
                            <DollarSign size={10} strokeWidth={1.5} />
                            {fmt(event.contractValue)}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`text-[11px] shrink-0 ${dLabel.cls}`}>{dLabel.text}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
