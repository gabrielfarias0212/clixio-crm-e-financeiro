
import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Client } from "@/utils/types";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { CalendarDays, CalendarIcon, CalendarPlus, Calendar as CalendarWeek } from "lucide-react";
import { useClients } from "@/contexts/ClientsContext";
import { UpcomingEvents } from "@/components/UpcomingEvents";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AddEventDialog } from "@/components/calendar/AddEventDialog";
import { DayView } from "@/components/calendar/DayView";
import { WeekView } from "@/components/calendar/WeekView";
import { MonthView } from "@/components/calendar/MonthView";

export default function CalendarPage() {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("month");
  const [addEventOpen, setAddEventOpen] = useState(false);
  const { clients, loading } = useClients();
  
  // Filter clients with wedding dates
  const clientsWithWeddingDates = useMemo(() => 
    clients.filter(client => client.weddingDate !== null) as (Client & { weddingDate: Date })[],
  [clients]);

  // Utility function to normalize dates to YYYY-MM-DD format without time component
  const normalizeDate = (date: Date | string | null): string => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Group clients by date - use a consistent date format without time component
  const clientsByDate = useMemo(() => {
    const result: Record<string, Client[]> = {};
    
    clientsWithWeddingDates.forEach(client => {
      // Make sure we're working with a Date object with the correct day
      const weddingDate = new Date(client.weddingDate);
      
      // Use the normalize function to create the date key
      const dateKey = normalizeDate(weddingDate);
      
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
    
    // Use the same normalize function for consistency
    const dateKey = normalizeDate(date);
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

  // Convert the date strings to Date objects for the calendar
  const eventDates = useMemo(() => {
    return Object.keys(clientsByDate).map(dateStr => {
      const [year, month, day] = dateStr.split('-').map(Number);
      // Create a date at noon local time to avoid timezone issues
      return new Date(year, month - 1, day, 12, 0, 0);
    });
  }, [clientsByDate]);

  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto px-4 py-8 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Calendário de Eventos</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setAddEventOpen(true)}>
              <CalendarPlus className="mr-2 h-4 w-4" />
              Adicionar Evento
            </Button>
          </div>
        </div>
        
        <Tabs value={view} onValueChange={(v) => setView(v as "day" | "week" | "month")}>
          <TabsList className="mb-6">
            <TabsTrigger value="day" className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Dia
            </TabsTrigger>
            <TabsTrigger value="week" className="flex items-center">
              <CalendarWeek className="mr-2 h-4 w-4" />
              Semana
            </TabsTrigger>
            <TabsTrigger value="month" className="flex items-center">
              <CalendarDays className="mr-2 h-4 w-4" />
              Mês
            </TabsTrigger>
          </TabsList>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="order-2 md:order-1 md:col-span-2">
              <TabsContent value="day" className="mt-0">
                <DayView 
                  date={date || new Date()} 
                  clients={clients}
                  onClientClick={(clientId) => navigate(`/clients/${clientId}`)}
                />
              </TabsContent>
              
              <TabsContent value="week" className="mt-0">
                <WeekView 
                  date={date || new Date()}
                  clients={clients}
                  onClientClick={(clientId) => navigate(`/clients/${clientId}`)}
                />
              </TabsContent>
              
              <TabsContent value="month" className="mt-0">
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
                                    {client.eventCategory || "Evento"}
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
              </TabsContent>
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
                      booked: eventDates
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
        </Tabs>
        
        <AddEventDialog 
          open={addEventOpen} 
          onOpenChange={setAddEventOpen} 
          clients={clients}
        />
      </div>
    </Layout>
  );
}
