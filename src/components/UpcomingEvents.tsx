import { useMemo } from "react";
import { addDays, isBefore, isAfter, startOfDay } from "date-fns";
import { Client, EventCategory, CalendarEvent } from "@/utils/types";
import { StatusBadge } from "./StatusBadge";
import { Calendar, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { useNavigate } from "react-router-dom";
import { stringToDate } from "@/utils/dates";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";

interface UpcomingEventsProps {
  clients: Client[];
  loading: boolean;
}

type ClientEventItem = {
  type: "client";
  client: Client;
  title: string;
  date: string;
  location: string;
  category: EventCategory;
};

type CalendarEventItem = {
  type: "calendar";
  event: CalendarEvent;
  client: Client | null;
  title: string;
  date: string;
  location: string;
  time: string;
};

type CombinedEventItem = ClientEventItem | CalendarEventItem;

export function UpcomingEvents({ clients, loading }: UpcomingEventsProps) {
  const navigate = useNavigate();
  const { events } = useCalendarEvents();

  const upcomingEvents = useMemo(() => {
    const today = startOfDay(new Date());
    const twoWeeksFromNow = addDays(today, 15);

    const clientEvents: ClientEventItem[] = clients
      .filter(client => {
        if (!client.weddingDate) return false;
        const d = stringToDate(client.weddingDate);
        return d && isAfter(d, today) && isBefore(d, twoWeeksFromNow);
      })
      .map(client => ({
        type: "client",
        client,
        title: client.name,
        date: client.weddingDate!,
        location: client.eventLocation || "",
        category: client.eventCategory,
      }));

    const calendarEvents: CalendarEventItem[] = events
      .filter(event => {
        const d = stringToDate(event.date);
        return d && isAfter(d, today) && isBefore(d, twoWeeksFromNow);
      })
      .map(event => ({
        type: "calendar",
        event,
        client: event.clientId ? clients.find(c => c.id === event.clientId) ?? null : null,
        title: event.title,
        date: event.date,
        location: event.description || "",
        time: event.startTime,
      }));

    return [...clientEvents, ...calendarEvents].sort((a, b) => {
      const dA = stringToDate(a.date);
      const dB = stringToDate(b.date);
      if (!dA || !dB) return 0;
      return dA.getTime() - dB.getTime();
    });
  }, [clients, events]);

  const handleEventClick = (event: CombinedEventItem) => {
    if (event.type === "client" && event.client) {
      navigate(`/clients/${event.client.id}`);
    } else {
      navigate("/calendar");
    }
  };

  return (
    <Card className="rounded-xl border-stone-200 shadow-sm overflow-hidden">
      <CardHeader className="px-5 py-4 border-b border-stone-100">
        <p className="text-[10px] font-medium tracking-widest uppercase text-stone-400">
          Próximos Eventos
        </p>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="px-5 py-8 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-stone-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Calendar size={24} strokeWidth={1} className="text-stone-300 mx-auto mb-2" />
            <p className="text-[11px] text-stone-400">
              Nenhum evento nas próximas duas semanas
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-stone-100">
            {upcomingEvents.map((event, index) => (
              <li
                key={`${event.type}-${index}`}
                onClick={() => handleEventClick(event)}
                className="px-5 py-4 hover:bg-stone-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-stone-800 truncate">
                      {event.title}
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      {event.type === "client" ? event.category : "Evento de Calendário"}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {event.type === "client" && event.client ? (
                      <StatusBadge status={event.client.status} />
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 font-medium">
                        Calendário
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  <span className="flex items-center gap-1 text-[11px] text-stone-400">
                    <Calendar size={11} strokeWidth={1.5} />
                    {event.date}
                    {event.type === "calendar" && event.time && ` às ${event.time}`}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1 text-[11px] text-stone-400">
                      <MapPin size={11} strokeWidth={1.5} />
                      {event.location}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
