
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
import { Skeleton } from "@/components/ui/skeleton";

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
    
    // Add a timeout of 3 seconds to force hide the loading state
    const timer = setTimeout(() => {
      setLoadingTimeout(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <Skeleton className="h-10 w-3/4 mb-4" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
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
            )}
          </div>
          
          {/* Events Sidebar */}
          <div className="lg:col-span-1">
            {loading ? (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <Skeleton className="h-8 w-1/2 mb-4" />
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <DayEventsSidebar 
                date={date}
                selectedDayItems={selectedDayItems}
                setAddEventOpen={setAddEventOpen}
                openEditEvent={handleOpenEditEvent}
              />
            )}
          </div>
        </div>
        
        {/* Upcoming Events Section - Show skeleton while loading */}
        <div className="mt-6">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <Skeleton className="h-8 w-1/3 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          ) : (
            <UpcomingEvents clients={clients} loading={false} />
          )}
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
