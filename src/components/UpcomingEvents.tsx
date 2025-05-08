
import { useMemo } from "react";
import { format, addDays, isBefore, isAfter, startOfDay } from "date-fns";
import { Client } from "@/utils/types";
import { StatusBadge } from "./StatusBadge";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { useNavigate } from "react-router-dom";
import { stringToDate } from "@/utils/dates";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";

interface UpcomingEventsProps {
  clients: Client[];
  loading: boolean;
}

export function UpcomingEvents({ clients, loading }: UpcomingEventsProps) {
  const navigate = useNavigate();
  const { events } = useCalendarEvents();

  const upcomingEvents = useMemo(() => {
    const today = startOfDay(new Date());
    const twoWeeksFromNow = addDays(today, 15);
    
    // Filter clients with upcoming wedding dates
    const clientEvents = clients
      .filter(client => {
        if (!client.weddingDate) return false;
        
        const eventDate = stringToDate(client.weddingDate);
        return eventDate && isAfter(eventDate, today) && isBefore(eventDate, twoWeeksFromNow);
      })
      .map(client => ({
        type: "client",
        client,
        title: client.name,
        date: client.weddingDate!,
        location: client.eventLocation || "",
        category: client.eventCategory
      }));
    
    // Filter calendar events for the next two weeks
    const calendarEvents = events
      .filter(event => {
        const eventDate = stringToDate(event.date);
        return eventDate && isAfter(eventDate, today) && isBefore(eventDate, twoWeeksFromNow);
      })
      .map(event => {
        // If the event is linked to a client, find that client
        const linkedClient = event.clientId ? clients.find(c => c.id === event.clientId) : null;
        
        return {
          type: "calendar",
          event,
          client: linkedClient,
          title: event.title,
          date: event.date,
          location: event.description || "",
          time: event.startTime
        };
      });
    
    // Combine and sort all events by date
    return [...clientEvents, ...calendarEvents].sort((a, b) => {
      const dateA = stringToDate(a.date);
      const dateB = stringToDate(b.date);
      
      if (!dateA || !dateB) return 0;
      return dateA.getTime() - dateB.getTime();
    });
  }, [clients, events]);

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p>Carregando eventos...</p>
      </div>
    );
  }

  const handleEventClick = (event: any) => {
    if (event.type === "client" && event.client) {
      navigate(`/clients/${event.client.id}`);
    } else {
      // For calendar events, navigate to calendar page
      navigate('/calendar');
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">Próximos Eventos</h2>
        {upcomingEvents.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhum evento agendado para as próximas duas semanas
          </p>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div
                key={`${event.type}-${index}`}
                className="p-4 rounded-lg border border-gray-100 hover:border-gray-200 cursor-pointer transition-all hover:shadow-sm"
                onClick={() => handleEventClick(event)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{event.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {event.type === "client" ? event.category : "Evento de Calendário"}
                    </p>
                  </div>
                  {event.type === "client" && event.client && (
                    <StatusBadge status={event.client.status} />
                  )}
                  {event.type === "calendar" && (
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      Calendário
                    </span>
                  )}
                </div>
                
                <div className="mt-3 space-y-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {event.date}
                    {event.time && ` às ${event.time}`}
                  </div>
                  {event.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      {event.location}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
