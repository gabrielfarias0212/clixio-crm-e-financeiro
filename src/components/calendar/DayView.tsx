
import { Client } from "@/utils/types";
import { format, addHours, startOfDay, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMemo } from "react";
import { normalizeDate } from "@/utils/dateUtils";
import { CalendarEvent } from "@/utils/types";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { cn } from "@/lib/utils";

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
  const today = new Date();
  const isToday = isSameDay(date, today);

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
    <div className="p-4">
      <h2 className={cn(
        "text-lg font-medium mb-4 capitalize",
        isToday && "text-orange-500"
      )}>
        {formattedDate}
      </h2>
      
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
            <div key={hour} className="grid grid-cols-12 min-h-[70px] border-t border-gray-100">
              <div className="col-span-1 py-2 text-xs text-gray-500 text-right pr-3">
                {hourStr}
              </div>
              <div className="col-span-11 py-1 pl-3 border-l border-gray-100">
                {hourEvents.length > 0 ? (
                  <div className="space-y-1">
                    {hourEvents.map(event => (
                      <div 
                        key={event.id} 
                        className={cn(
                          "p-2 rounded-md text-sm",
                          event.type === 'client' 
                            ? 'bg-purple-100 hover:bg-purple-200 cursor-pointer' 
                            : event.color === 'blue' 
                              ? 'bg-blue-100 hover:bg-blue-200 cursor-pointer' 
                              : event.color === 'green' 
                                ? 'bg-green-100 hover:bg-green-200 cursor-pointer' 
                                : event.color === 'red' 
                                  ? 'bg-red-100 hover:bg-red-200 cursor-pointer' 
                                  : 'bg-gray-100 hover:bg-gray-200 cursor-pointer'
                        )}
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
    </div>
  );
}
