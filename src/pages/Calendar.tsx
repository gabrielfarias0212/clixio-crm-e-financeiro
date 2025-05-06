import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Client } from "@/utils/types";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/components/StatusBadge";
import { format, getMonth, getYear, isSameDay, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, CalendarIcon, CalendarPlus } from "lucide-react";
import { useClients } from "@/contexts/ClientsContext";
import { UpcomingEvents } from "@/components/UpcomingEvents";
import { Button } from "@/components/ui/button";
import { AddEventDialog } from "@/components/calendar/AddEventDialog";
import { DayView } from "@/components/calendar/DayView";
import { WeekView } from "@/components/calendar/WeekView";
import { MonthView } from "@/components/calendar/MonthView";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { normalizeDate } from "@/utils/dateUtils";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("month");
  const [addEventOpen, setAddEventOpen] = useState(false);
  const { clients, loading } = useClients();
  const { events } = useCalendarEvents();
  
  // Filter clients with wedding dates
  const clientsWithWeddingDates = useMemo(() => 
    clients.filter(client => client.weddingDate !== null) as (Client & { weddingDate: Date })[],
  [clients]);

  // Get current month and year for header display
  const currentMonthYear = useMemo(() => {
    if (!date) return "";
    return format(date, "MMMM 'de' yyyy", { locale: ptBR });
  }, [date]);

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

  // Get all event dates (client events + calendar events)
  const eventDates = useMemo(() => {
    const dates: Date[] = [];
    
    // Add client wedding dates
    Object.keys(clientsByDate).forEach(dateStr => {
      const [year, month, day] = dateStr.split('-').map(Number);
      dates.push(new Date(year, month - 1, day, 12, 0, 0));
    });
    
    // Add calendar events
    events.forEach(event => {
      const eventDate = new Date(event.date);
      if (!dates.some(d => isSameDay(d, eventDate))) {
        dates.push(eventDate);
      }
    });
    
    return dates;
  }, [clientsByDate, events]);

  // Get selected day's clients and events
  const selectedDayItems = useMemo(() => {
    if (!date) return { clients: [], events: [] };
    
    // Get clients for this date
    const dateKey = normalizeDate(date);
    const dayClients = clientsByDate[dateKey] || [];
    
    // Get events for this date
    const dayEvents = events.filter(event => 
      normalizeDate(event.date) === dateKey
    );
    
    return { clients: dayClients, events: dayEvents };
  }, [date, clientsByDate, events]);

  // Create modifiers styles for days with events
  const eventDayStyle = {
    backgroundColor: "rgb(254, 240, 229)",  // Lighter orange background
    color: "rgb(234, 88, 12)",              // Darker orange text
    fontWeight: "bold"
  } as const;

  useEffect(() => {
    document.title = "Calendário | Wedding CRM";
  }, []);

  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto px-4 py-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Calendário de Eventos</h1>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="bg-white border-gray-200 hover:bg-gray-50"
              onClick={() => setAddEventOpen(true)}
            >
              <CalendarPlus className="mr-2 h-4 w-4 text-orange-500" />
              Cadastrar Evento
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Card */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-sm bg-white">
              <CardContent className="p-0 rounded-md">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="text-xl font-medium text-orange-500">
                    {currentMonthYear}
                  </div>
                  
                  <div className="flex rounded-md overflow-hidden border divide-x">
                    <Button 
                      variant={view === "month" ? "default" : "outline"} 
                      className={cn(
                        "rounded-none px-4 py-2 text-sm h-auto", 
                        view === "month" ? "bg-slate-800 hover:bg-slate-700" : "bg-white hover:bg-gray-50"
                      )}
                      onClick={() => setView("month")}
                    >
                      Mês
                    </Button>
                    <Button 
                      variant={view === "week" ? "default" : "outline"} 
                      className={cn(
                        "rounded-none px-4 py-2 text-sm h-auto", 
                        view === "week" ? "bg-slate-800 hover:bg-slate-700" : "bg-white hover:bg-gray-50"
                      )}
                      onClick={() => setView("week")}
                    >
                      Semana
                    </Button>
                    <Button 
                      variant={view === "day" ? "default" : "outline"} 
                      className={cn(
                        "rounded-none px-4 py-2 text-sm h-auto", 
                        view === "day" ? "bg-slate-800 hover:bg-slate-700" : "bg-white hover:bg-gray-50"
                      )}
                      onClick={() => setView("day")}
                    >
                      Dia
                    </Button>
                  </div>
                </div>
                
                {view === "month" && (
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="mx-auto w-full pointer-events-auto"
                    modifiers={{
                      booked: eventDates
                    }}
                    modifiersStyles={{
                      booked: eventDayStyle
                    }}
                  />
                )}
                
                {view === "week" && (
                  <WeekView 
                    date={date || new Date()}
                    clients={clients}
                    onClientClick={(clientId) => navigate(`/clients/${clientId}`)}
                  />
                )}
                
                {view === "day" && (
                  <DayView 
                    date={date || new Date()} 
                    clients={clients}
                    onClientClick={(clientId) => navigate(`/clients/${clientId}`)}
                  />
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Events List Card */}
          <div className="lg:col-span-1">
            <Card className="border-none shadow-sm bg-white h-full">
              <CardContent className="p-4">
                <h2 className="text-lg font-medium mb-4 flex items-center">
                  <CalendarIcon className="mr-2 h-5 w-5 text-orange-500" />
                  {date && format(date, "dd 'de' MMMM", { locale: ptBR })}
                </h2>
                
                {selectedDayItems.clients.length > 0 || selectedDayItems.events.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDayItems.clients.map(client => (
                      <div 
                        key={client.id}
                        className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 cursor-pointer transition-all hover:shadow-sm"
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
                        
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Valor: </span>
                          {new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          }).format(client.contractValue)}
                        </div>
                      </div>
                    ))}
                    
                    {selectedDayItems.events.map(event => (
                      <div 
                        key={event.id}
                        className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all hover:shadow-sm"
                      >
                        <div>
                          <h3 className="font-medium">{event.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {event.time} - {event.description}
                          </p>
                        </div>
                        
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            event.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                            event.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                            event.color === 'green' ? 'bg-green-100 text-green-800' :
                            event.color === 'red' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {event.type || "Evento"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarDays className="mx-auto h-10 w-10 mb-2 text-gray-300" />
                    <p>Nenhum evento agendado para este dia.</p>
                    <Button 
                      variant="link" 
                      className="mt-2 text-orange-500"
                      onClick={() => setAddEventOpen(true)}
                    >
                      + Adicionar evento
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Upcoming Events Section */}
        <div className="mt-6">
          <UpcomingEvents clients={clients} loading={loading} />
        </div>
        
        <AddEventDialog 
          open={addEventOpen} 
          onOpenChange={setAddEventOpen} 
          clients={clients}
        />
      </div>
    </Layout>
  );
}
