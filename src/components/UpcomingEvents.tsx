import { useMemo } from "react";
import { format, addDays, isBefore, isAfter, startOfDay } from "date-fns";
import { Client } from "@/utils/types";
import { StatusBadge } from "./StatusBadge";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { useNavigate } from "react-router-dom";
import { stringToDate } from "@/utils/dates";

interface UpcomingEventsProps {
  clients: Client[];
  loading: boolean;
}

export function UpcomingEvents({ clients, loading }: UpcomingEventsProps) {
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
      .sort((a, b) => {
        const dateA = stringToDate(a.weddingDate!);
        const dateB = stringToDate(b.weddingDate!);
        
        if (!dateA || !dateB) return 0;
        return dateA.getTime() - dateB.getTime();
      });
  }, [clients]);

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p>Carregando eventos...</p>
      </div>
    );
  }

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
            {upcomingEvents.map((client) => (
              <div
                key={client.id}
                className="p-4 rounded-lg border border-gray-100 hover:border-gray-200 cursor-pointer transition-all hover:shadow-sm"
                onClick={() => navigate(`/clients/${client.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{client.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {client.eventCategory}
                    </p>
                  </div>
                  <StatusBadge status={client.status} />
                </div>
                
                <div className="mt-3 space-y-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {client.weddingDate}
                  </div>
                  {client.eventLocation && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      {client.eventLocation}
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
