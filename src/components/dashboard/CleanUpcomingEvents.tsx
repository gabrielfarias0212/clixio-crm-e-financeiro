
import { useMemo } from "react";
import { format, addDays, isBefore, isAfter, startOfDay } from "date-fns";
import { Client } from "@/utils/types";
import { CalendarIcon, MapPinIcon, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { stringToDate } from "@/utils/dates";
import { Badge } from "@/components/ui/badge";

interface CleanUpcomingEventsProps {
  clients: Client[];
  loading: boolean;
}

export function CleanUpcomingEvents({ clients, loading }: CleanUpcomingEventsProps) {
  const navigate = useNavigate();

  const upcomingEvents = useMemo(() => {
    const today = startOfDay(new Date());
    const twoWeeksFromNow = addDays(today, 15);
    
    return clients
      .filter(client => {
        if (!client.weddingDate) return false;
        const eventDate = stringToDate(client.weddingDate);
        return eventDate && isAfter(eventDate, today) && isBefore(eventDate, twoWeeksFromNow);
      })
      .map(client => ({
        client,
        title: client.name,
        date: client.weddingDate!,
        location: client.eventLocation || "",
        category: client.eventCategory
      }))
      .sort((a, b) => {
        const dateA = stringToDate(a.date);
        const dateB = stringToDate(b.date);
        if (!dateA || !dateB) return 0;
        return dateA.getTime() - dateB.getTime();
      });
  }, [clients]);

  const handleEventClick = (client: Client) => {
    navigate(`/clients/${client.id}`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-full">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Próximos Eventos</h2>
            <p className="text-sm text-gray-500">Próximas 2 semanas</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-8">
            <div className="flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mx-auto mb-4">
              <CalendarIcon className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500">Nenhum evento próximo</p>
            <p className="text-sm text-gray-400 mt-1">Sem eventos nas próximas 2 semanas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div
                key={index}
                onClick={() => handleEventClick(event.client)}
                className="flex items-start space-x-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-full flex-shrink-0">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 truncate">{event.title}</h3>
                    <Badge variant="outline" className="text-xs">
                      {event.category}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarIcon className="h-3 w-3 mr-2 flex-shrink-0" />
                      <span className="truncate">{event.date}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPinIcon className="h-3 w-3 mr-2 flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
