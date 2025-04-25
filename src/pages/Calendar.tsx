
import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Client } from "@/utils/types";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useClients } from "@/contexts/ClientsContext";
import { UpcomingEvents } from "@/components/UpcomingEvents";

export default function CalendarPage() {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { clients, loading } = useClients();
  
  // Filter clients with wedding dates
  const clientsWithWeddingDates = useMemo(() => 
    clients.filter(client => client.weddingDate !== null) as (Client & { weddingDate: Date })[],
  [clients]);

  // Group clients by date
  const clientsByDate = useMemo(() => {
    const result: Record<string, Client[]> = {};
    
    clientsWithWeddingDates.forEach(client => {
      const dateKey = new Date(client.weddingDate).toISOString().split('T')[0];
      if (!result[dateKey]) {
        result[dateKey] = [];
      }
      result[dateKey].push(client);
    });
    
    return result;
  }, [clientsWithWeddingDates]);

  // Get selected day's clients
  const selectedDayClients = useMemo(() => {
    if (!date) return [];
    
    const dateKey = date.toISOString().split('T')[0];
    return clientsByDate[dateKey] || [];
  }, [date, clientsByDate]);

  // Create modifiers styles for days with events
  const eventDayStyle = {
    backgroundColor: "rgb(243, 232, 255)",
    color: "rgb(126, 34, 206)",
    fontWeight: "bold",
    position: "relative",
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: "2px",
      left: "50%",
      transform: "translateX(-50%)",
      width: "4px",
      height: "4px",
      borderRadius: "50%",
      backgroundColor: "rgb(126, 34, 206)",
    },
  } as const;

  useEffect(() => {
    document.title = "Calendário | Wedding CRM";
  }, []);
  
  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto px-4 py-8 animate-fade-in">
        <h1 className="text-2xl font-bold mb-6">Calendário de Eventos</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="order-2 md:order-1 md:col-span-2">
            <UpcomingEvents clients={clients} loading={loading} />
            
            {selectedDayClients.length > 0 && (
              <Card className="mt-6 animate-scale-in">
                <CardContent className="pt-6">
                  <div>
                    <h2 className="text-lg font-medium mb-4 flex items-center">
                      <CalendarIcon className="mr-2 h-5 w-5" />
                      Eventos em {date && format(date, "dd/MM/yyyy")}
                    </h2>
                    <div className="space-y-4">
                      {selectedDayClients.map(client => (
                        <div 
                          key={client.id}
                          className="p-4 rounded-lg border border-gray-100 hover:border-gray-200 cursor-pointer transition-all hover:shadow-sm"
                          onClick={() => navigate(`/clients/${client.id}`)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{client.name}</h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {client.eventCategory || "Casamento"}
                              </p>
                            </div>
                            <StatusBadge status={client.status} />
                          </div>
                          
                          <div className="mt-3 text-sm">
                            <span className="font-medium">Valor: </span>
                            {new Intl.NumberFormat('pt-BR', { 
                              style: 'currency', 
                              currency: 'BRL' 
                            }).format(client.contractValue)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="order-1 md:order-2">
            <Card className="animate-scale-in">
              <CardContent className="pt-6">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="mx-auto pointer-events-auto"
                  modifiers={{
                    booked: Object.keys(clientsByDate).map(date => new Date(date))
                  }}
                  modifiersStyles={{
                    booked: eventDayStyle
                  }}
                />
                <div className="mt-4 text-center text-xs text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 bg-purple-100 rounded-full"></div>
                    <span>Eventos agendados</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
