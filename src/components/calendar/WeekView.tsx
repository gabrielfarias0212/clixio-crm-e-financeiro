
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "@/utils/types";
import { 
  format, 
  addDays,
  startOfWeek,
  endOfWeek, 
  isWithinInterval,
  startOfDay,
  endOfDay,
  addHours
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMemo } from "react";
import { normalizeDate } from "@/utils/dateUtils";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";

interface WeekViewProps {
  date: Date;
  clients: Client[];
  onClientClick: (clientId: string) => void;
}

export function WeekView({ date, clients, onClientClick }: WeekViewProps) {
  const { events } = useCalendarEvents();
  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8am to 8pm
  
  // Calculate start and end of the week
  const weekStart = startOfWeek(date, { weekStartsOn: 0 }); // 0 = Sunday
  const weekEnd = endOfWeek(date, { weekStartsOn: 0 });
  
  // Generate array of days for this week
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  // Get all events for this week
  const weekEvents = useMemo(() => {
    // Get custom events for this week
    const customEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return isWithinInterval(eventDate, {
        start: startOfDay(weekStart),
        end: endOfDay(weekEnd)
      });
    });
    
    // Get client events (weddings, etc)
    const clientEvents = clients
      .filter(client => {
        if (!client.weddingDate) return false;
        const weddingDate = new Date(client.weddingDate);
        return isWithinInterval(weddingDate, {
          start: startOfDay(weekStart),
          end: endOfDay(weekEnd)
        });
      })
      .map(client => ({
        id: `client-${client.id}`,
        title: client.name,
        date: client.weddingDate as Date,
        time: "10:00", // Default if not specified
        type: "client",
        clientId: client.id,
        description: client.eventCategory || "Evento",
        color: "purple"
      }));
    
    return [...customEvents, ...clientEvents];
  }, [weekStart, weekEnd, events, clients]);

  const getEventsForDateAndHour = (day: Date, hour: number) => {
    const dayDate = normalizeDate(day);
    const hourStr = hour.toString().padStart(2, '0');
    
    return weekEvents.filter(event => {
      const eventDate = normalizeDate(event.date);
      const eventHour = event.time.split(':')[0];
      return eventDate === dayDate && eventHour === hourStr;
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {format(weekStart, "dd/MM", { locale: ptBR })} - {format(weekEnd, "dd/MM/yyyy", { locale: ptBR })}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header with days */}
          <div className="grid grid-cols-8 bg-muted/10">
            <div className="p-2 border-b border-r text-center"></div>
            {weekDays.map((day, i) => (
              <div 
                key={i} 
                className="p-2 border-b text-center font-medium"
              >
                <div className="capitalize">{format(day, "EEE", { locale: ptBR })}</div>
                <div className="text-sm">{format(day, "dd/MM")}</div>
              </div>
            ))}
          </div>
          
          {/* Time slots and events */}
          {hours.map(hour => {
            const hourLabel = `${hour}:00`;
            
            return (
              <div key={hour} className="grid grid-cols-8 min-h-[60px]">
                <div className="border-r p-1 text-xs text-gray-500 text-center">
                  {hourLabel}
                </div>
                
                {weekDays.map((day, i) => {
                  const dayEvents = getEventsForDateAndHour(day, hour);
                  
                  return (
                    <div key={i} className={`border border-gray-100 p-1 ${
                      format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                        ? 'bg-blue-50/20'
                        : ''
                    }`}>
                      {dayEvents.length > 0 ? (
                        <div className="space-y-1">
                          {dayEvents.map(event => (
                            <div 
                              key={event.id} 
                              className={`p-1 rounded-md text-xs ${
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
                              <div className="font-medium truncate">{event.title}</div>
                              <div className="text-[10px] text-gray-500 truncate">{event.description}</div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
