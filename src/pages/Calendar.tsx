
import Layout from "@/components/Layout";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { MonthView } from "@/components/calendar/MonthView";
import { WeekView } from "@/components/calendar/WeekView";
import { DayView } from "@/components/calendar/DayView";
import { DayEventsSidebar } from "@/components/calendar/DayEventsSidebar";
import { useCalendarPage } from "@/hooks/useCalendarPage";
import { useState, useEffect } from "react";
import { AddEventDialog } from "@/components/calendar/AddEventDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useClients } from "@/contexts/ClientsContext";
import { toast } from "sonner";

export default function Calendar() {
  const {
    view,
    currentDate,
    selectedDate,
    events,
    loading,
    setView,
    goToToday,
    goToPrevious,
    goToNext,
    handleDateSelect,
    selectedEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    refreshEvents
  } = useCalendarPage();

  const [addEventOpen, setAddEventOpen] = useState(false);
  const [editEventData, setEditEventData] = useState<any>(null);
  const { clients } = useClients();
  
  const currentMonthYear = format(currentDate, "MMMM yyyy", { locale: ptBR });
  
  // Refresh events when the page loads
  useEffect(() => {
    refreshEvents().catch(error => {
      console.error("Error refreshing events:", error);
      toast.error("Erro ao carregar eventos");
    });
  }, [refreshEvents]);
  
  const openEditEvent = (event: any) => {
    setEditEventData(event);
    setAddEventOpen(true);
  };
  
  const handleEventSave = async (eventData: any) => {
    try {
      if (eventData.id) {
        await updateEvent(eventData);
        toast.success("Evento atualizado com sucesso");
      } else {
        await addEvent(eventData);
        toast.success("Evento adicionado com sucesso");
      }
      setAddEventOpen(false);
      setEditEventData(null);
      refreshEvents();
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("Erro ao salvar evento");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <CalendarHeader 
          currentMonthYear={currentMonthYear}
          view={view}
          setView={setView}
          setAddEventOpen={setAddEventOpen}
        />
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-2">
            <button 
              onClick={goToPrevious}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              &lt; Anterior
            </button>
            <button
              onClick={goToToday}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              Hoje
            </button>
            <button
              onClick={goToNext}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              Próximo &gt;
            </button>
          </div>
          <h2 className="text-xl font-semibold capitalize">{currentMonthYear}</h2>
        </div>
        
        <div className="mt-6 flex">
          <div className="flex-1 border rounded-lg bg-card shadow-sm overflow-hidden">
            {view === 'month' && (
              <MonthView 
                date={currentDate}
                events={events}
                onDateClick={handleDateSelect}
                selectedDate={selectedDate}
                loading={loading}
              />
            )}
            {view === 'week' && (
              <WeekView 
                date={currentDate}
                clients={clients}
                onClientClick={(clientId) => console.log("Client clicked:", clientId)}
              />
            )}
            {view === 'day' && (
              <DayView 
                date={selectedDate || currentDate}
                clients={clients}
                onClientClick={(clientId) => console.log("Client clicked:", clientId)}
              />
            )}
          </div>
          
          {selectedDate && (
            <DayEventsSidebar 
              date={selectedDate}
              selectedDayItems={{
                clients: clients.filter(client => {
                  if (!client.weddingDate) return false;
                  // Format date properly for comparison
                  const clientDate = client.weddingDate.includes('/')
                    ? client.weddingDate.split('/').reverse().join('-') // Convert DD/MM/YYYY to YYYY-MM-DD
                    : client.weddingDate;
                  return clientDate === format(selectedDate, 'yyyy-MM-dd');
                }),
                events: selectedEvents
              }}
              setAddEventOpen={setAddEventOpen}
              openEditEvent={openEditEvent}
            />
          )}
        </div>
        
        <AddEventDialog 
          open={addEventOpen}
          onOpenChange={setAddEventOpen}
          clients={clients}
          initialData={editEventData}
          onSave={handleEventSave}
        />
      </div>
    </Layout>
  );
}
