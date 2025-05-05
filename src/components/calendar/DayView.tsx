
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "@/utils/types";
import { format, addHours, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import { normalizeDate } from "@/utils/dateUtils";
import { CalendarEvent } from "@/utils/types";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";

interface DayViewProps {
  date: Date;
  clients: Client[];
  onClientClick: (clientId: string) => void;
}

export function DayView({ date, clients, onClientClick }: DayViewProps) {
  const { events } = useCalendarEvents();
  const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6am to 10pm
  
  const dayStart = startOfDay(date);
  const formattedDate = format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });

  // Get events and clients for this day
  const dayEvents = useMemo(() => {
    const dateKey = normalizeDate(date);
    
    // Get custom events for this day
    const customEvents = events.filter(event => 
      normalizeDate(event.date) === dateKey
    );
    
    // Get client events (weddings, etc)
    const clientEvents = clients
      .filter(client => client.weddingDate && normalizeDate(client.weddingDate) === dateKey)
      .map(client => ({
        id: `client-${client.id}`,
        title: `${client.eventCategory}: ${client.name}`,
        date: client.weddingDate as Date,
        time: "10:00", // Default if not specified
        type: "client",
        clientId: client.id,
        description: `${client.eventCategory} de ${client.name}`,
        color: "purple"
      }));
    
    return [...customEvents, ...clientEvents];
  }, [date, events, clients]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize">{formattedDate}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {hours.map(hour => {
            const timeSlot = addHours(dayStart, hour);
            const hourStr = format(timeSlot, "HH:00");
            
            // Find events for this hour
            const hourEvents = dayEvents.filter(event => {
              const eventHour = event.time.split(':')[0];
              return eventHour === format(timeSlot, "HH");
            });
            
            return (
              <div key={hour} className="grid grid-cols-12 min-h-[60px] border-t">
                <div className="col-span-1 py-2 text-xs text-gray-500">
                  {hourStr}
                </div>
                <div className="col-span-11 py-1">
                  {hourEvents.length > 0 ? (
                    <div className="space-y-1">
                      {hourEvents.map(event => (
                        <div 
                          key={event.id} 
                          className={`p-2 rounded-md text-sm ${
                            event.type === 'client' 
                              ? 'bg-purple-100 hover:bg-purple-200 cursor-pointer' 
                              : event.color === 'blue' 
                                ? 'bg-blue-100' 
                                : event.color === 'green' 
                                  ? 'bg-green-100' 
                                  : event.color === 'red' 
                                    ? 'bg-red-100' 
                                    : 'bg-gray-100'
                          }`}
                          onClick={() => event.clientId && onClientClick(event.clientId)}
                        >
                          <div className="font-medium">{event.title}</div>
                          <div className="text-xs text-gray-500">{event.time} - {event.description}</div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
