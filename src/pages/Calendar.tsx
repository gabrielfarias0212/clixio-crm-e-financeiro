
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { useClients } from "@/contexts/ClientsContext";
import { UpcomingEvents } from "@/components/UpcomingEvents";
import { AddEventDialog } from "@/components/calendar/AddEventDialog";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { DayEventsSidebar } from "@/components/calendar/DayEventsSidebar";
import { useCalendarPage } from "@/hooks/useCalendarPage";
import { CalendarEvent } from "@/utils/types";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { toast } from "@/hooks/use-toast";

export default function CalendarPage() {
  const navigate = useNavigate();
  const { clients, loading } = useClients();
  const { error } = useCalendarEvents();
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  
  const {
    date,
    setDate,
    view,
    setView,
    addEventOpen,
    setAddEventOpen,
    currentMonthYear,
    eventDates,
    selectedDayItems
  } = useCalendarPage(clients);

  useEffect(() => {
    document.title = "Calendário | Wedding CRM";
  }, []);

  // Show error toast if there's an error with calendar events
  useEffect(() => {
    if (error) {
      toast({
        title: "Erro no calendário",
        description: error,
        variant: "destructive"
      });
    }
  }, [error]);
  
  const handleOpenEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setAddEventOpen(true);
  };
  
  const handleCloseDialog = (open: boolean) => {
    setAddEventOpen(open);
    if (!open) {
      setEditingEvent(null);
    }
  };

  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto px-4 py-8 animate-fade-in">
        <CalendarHeader 
          currentMonthYear={currentMonthYear}
          view={view}
          setView={setView}
          setAddEventOpen={setAddEventOpen}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <CalendarGrid 
              date={date}
              setDate={setDate}
              view={view}
              setView={setView}
              currentMonthYear={currentMonthYear}
              eventDates={eventDates}
              clients={clients}
              onClientClick={(clientId) => navigate(`/clients/${clientId}`)}
            />
          </div>
          
          {/* Events Sidebar */}
          <div className="lg:col-span-1">
            <DayEventsSidebar 
              date={date}
              selectedDayItems={selectedDayItems}
              setAddEventOpen={setAddEventOpen}
              openEditEvent={handleOpenEditEvent}
            />
          </div>
        </div>
        
        {/* Upcoming Events Section */}
        <div className="mt-6">
          <UpcomingEvents clients={clients} loading={loading} />
        </div>
        
        <AddEventDialog 
          open={addEventOpen} 
          onOpenChange={handleCloseDialog} 
          clients={clients}
          initialData={editingEvent || undefined}
        />
      </div>
    </Layout>
  );
}
