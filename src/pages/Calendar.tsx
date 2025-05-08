
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
import { Loader2 } from "lucide-react";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";

export default function CalendarPage() {
  const navigate = useNavigate();
  const { clients, loading: clientsLoading } = useClients();
  const { loading: eventsLoading, refreshEvents, events } = useCalendarEvents();
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState<boolean>(false);
  
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

  // Set a timeout to prevent showing loading indefinitely
  useEffect(() => {
    document.title = "Calendário | Wedding CRM";
    // Refresh events when page loads to ensure we have the latest data
    refreshEvents();
    
    // Add a timeout of 8 seconds to force hide the loading state
    // This ensures users won't see a loading indicator forever if something goes wrong
    const timer = setTimeout(() => {
      setLoadingTimeout(true);
    }, 8000);
    
    return () => clearTimeout(timer);
  }, [refreshEvents]);
  
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

  // Consider loading to be done if:
  // 1. Both clients and events are loaded, or
  // 2. The loading timeout has been reached
  const loading = (clientsLoading || eventsLoading) && !loadingTimeout;

  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto px-4 py-8 animate-fade-in">
        <CalendarHeader 
          currentMonthYear={currentMonthYear}
          view={view}
          setView={setView}
          setAddEventOpen={setAddEventOpen}
        />
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <span className="ml-2 text-lg text-gray-600">Carregando calendário...</span>
          </div>
        ) : (
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
        )}
        
        {/* Upcoming Events Section - Only show if we have data */}
        {!loading && (
          <div className="mt-6">
            <UpcomingEvents clients={clients} loading={loading} />
          </div>
        )}
        
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
