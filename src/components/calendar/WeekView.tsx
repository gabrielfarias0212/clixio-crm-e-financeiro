
import { Client } from "@/utils/types";
import { 
  format, 
  addDays,
  startOfWeek,
  endOfWeek, 
  isWithinInterval,
  startOfDay,
  endOfDay,
  isSameDay
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMemo } from "react";
import { normalizeDate, stringToDate } from "@/utils/dateUtils";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { cn } from "@/lib/utils";

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
      const eventDate = stringToDate(event.date);
      return eventDate && isWithinInterval(eventDate, {
        start: startOfDay(weekStart),
        end: endOfDay(weekEnd)
      });
    });
    
    // Get client events (weddings, etc)
    const clientEvents = clients
      .filter(client => {
        if (!client.weddingDate) return false;
        const weddingDate = stringToDate(client.weddingDate);
        return weddingDate && isWithinInterval(weddingDate, {
          start: startOfDay(weekStart),
          end: endOfDay(weekEnd)
        });
      })
      .map(client => ({
        id: `client-${client.id}`,
        title: client.name,
        date: client.weddingDate as string,
        startTime: client.weddingStartTime || "10:00",
        endTime: client.weddingEndTime || "18:00",
        type: "client" as const,
        clientId: client.id,
        description: client.eventCategory || "Evento",
        color: "purple" as const
      }));
    
    return [...customEvents, ...clientEvents];
  }, [weekStart, weekEnd, events, clients]);

  // Converter horário string para número de hora
  const getHourFromTimeString = (timeString: string): number => {
    const [hours] = timeString.split(':').map(Number);
    return hours;
  };

  const getEventsForDateAndHour = (day: Date, hour: number) => {
    const dayDate = normalizeDate(day);
    const hourStr = hour.toString().padStart(2, '0');
    
    return weekEvents.filter(event => {
      // Convert string date to normalized date for comparison
      const eventDate = normalizeDate(stringToDate(event.date) || new Date());
      const startHour = getHourFromTimeString(event.startTime);
      const endHour = getHourFromTimeString(event.endTime);
      
      return eventDate === dayDate && (hour === startHour || (hour > startHour && hour < endHour));
    });
  };
  
  const today = new Date();
  
  return (
    <div className="p-0 overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header with days */}
        <div className="grid grid-cols-8 bg-gray-50">
          <div className="p-2 border-b border-r text-center"></div>
          {weekDays.map((day, i) => {
            const isToday = isSameDay(day, today);
            const dayName = format(day, "E", { locale: ptBR });
            const dayNumber = format(day, "d");
            
            return (
              <div 
                key={i} 
                className={cn(
                  "p-2 border-b text-center font-normal",
                  isToday && "bg-orange-50 text-orange-600"
                )}
              >
                <div className="capitalize text-sm font-medium">{dayName}.</div>
                <div className="text-xl">{dayNumber}</div>
              </div>
            );
          })}
        </div>
        
        {/* Time slots and events */}
        {hours.map(hour => {
          const hourLabel = `${hour}:00`;
          
          return (
            <div key={hour} className="grid grid-cols-8 min-h-[70px]">
              <div className="border-r p-2 text-xs text-gray-500 text-right pr-3">
                {hourLabel}
              </div>
              
              {weekDays.map((day, i) => {
                const isToday = isSameDay(day, today);
                const dayEvents = getEventsForDateAndHour(day, hour);
                
                return (
                  <div key={i} className={cn(
                    "border border-gray-100 p-1",
                    isToday && "bg-orange-50/20"
                  )}>
                    {dayEvents.length > 0 ? (
                      <div className="space-y-1">
                        {dayEvents.map(event => {
                          const eventStartHour = getHourFromTimeString(event.startTime);
                          const isStartingNow = eventStartHour === hour;
                          
                          return (
                            <div 
                              key={event.id} 
                              className={cn(
                                "p-1 rounded-md text-xs cursor-pointer",
                                isStartingNow ? "border-l-2" : "",
                                event.type === 'client' ? 'bg-purple-100 hover:bg-purple-200 border-purple-500' :
                                event.color === 'blue' ? 'bg-blue-100 hover:bg-blue-200 border-blue-500' :
                                event.color === 'green' ? 'bg-green-100 hover:bg-green-200 border-green-500' :
                                event.color === 'red' ? 'bg-red-100 hover:bg-red-200 border-red-500' :
                                'bg-gray-100 hover:bg-gray-200 border-gray-500'
                              )}
                              onClick={() => event.clientId && onClientClick(event.clientId)}
                            >
                              <div className="font-medium truncate">{event.title}</div>
                              <div className="text-[10px] text-gray-500 truncate">
                                {event.startTime}-{event.endTime}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
