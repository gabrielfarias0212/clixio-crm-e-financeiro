import { useCallback, useEffect, useState, createContext, useContext, ReactNode } from "react";
import { CalendarEvent } from "@/utils/types";
import { toast } from "@/hooks/use-toast";
import { 
  fetchCalendarEvents, 
  createCalendarEvent, 
  updateCalendarEvent, 
  deleteCalendarEvent 
} from "@/utils/supabase/calendar-events";
import { migrateLocalEventsToDatabase } from "@/utils/migrateLocalEvents";

interface CalendarEventsContextProps {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, "id">) => Promise<void>;
  updateEvent: (event: CalendarEvent) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  getEventById: (eventId: string) => CalendarEvent | undefined;
  getEventsByDate: (date: string) => CalendarEvent[];
  loading: boolean;
  refreshEvents: () => Promise<void>;
}

const CalendarEventsContext = createContext<CalendarEventsContextProps>({
  events: [],
  addEvent: async () => {},
  updateEvent: async () => {},
  deleteEvent: async () => {},
  getEventById: () => undefined,
  getEventsByDate: () => [],
  loading: true,
  refreshEvents: async () => {}
});

export function CalendarEventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Migrate local events to database when component mounts
  useEffect(() => {
    const doMigration = async () => {
      try {
        await migrateLocalEventsToDatabase();
      } catch (error) {
        console.error("Error migrating local events to database", error);
      }
    };
    
    doMigration();
  }, []);
  
  // Load events from Supabase on component mount
  const loadEvents = useCallback(async () => {
    setLoading(true);
    
    try {
      // Set a timeout to ensure loading state doesn't stay indefinitely
      const timeoutId = setTimeout(() => {
        setLoading(false);
      }, 5000); // 5 seconds timeout as a fallback
      
      const fetchedEvents = await fetchCalendarEvents();
      
      // Clear timeout if fetch completes successfully
      clearTimeout(timeoutId);
      
      setEvents(fetchedEvents);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch calendar events from Supabase", error);
      toast({
        title: "Erro ao carregar eventos",
        description: "Não foi possível carregar os eventos do calendário.",
        variant: "destructive"
      });
      setLoading(false); // Ensure loading is set to false even on error
    }
  }, []);
  
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);
  
  const addEvent = useCallback(async (event: Omit<CalendarEvent, "id">) => {
    try {
      // Create event in Supabase
      const createdEvent = await createCalendarEvent(event);
      
      if (createdEvent) {
        // Update local state
        setEvents(prev => [...prev, createdEvent]);
        return;
      }
      
      throw new Error("Failed to create event");
    } catch (error) {
      console.error("Error adding event:", error);
      toast({
        title: "Erro ao adicionar evento",
        description: "Não foi possível adicionar o evento ao calendário.",
        variant: "destructive"
      });
    }
  }, []);
  
  const updateEvent = useCallback(async (updatedEvent: CalendarEvent) => {
    try {
      // Update event in Supabase
      const result = await updateCalendarEvent(updatedEvent.id, updatedEvent);
      
      if (result) {
        // Update local state
        setEvents(prev => 
          prev.map(event => 
            event.id === updatedEvent.id ? updatedEvent : event
          )
        );
        return;
      }
      
      throw new Error("Failed to update event");
    } catch (error) {
      console.error("Error updating event:", error);
      toast({
        title: "Erro ao atualizar evento",
        description: "Não foi possível atualizar o evento no calendário.",
        variant: "destructive"
      });
    }
  }, []);
  
  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      // Delete event from Supabase
      const success = await deleteCalendarEvent(eventId);
      
      if (success) {
        // Update local state
        setEvents(prev => prev.filter(event => event.id !== eventId));
        return;
      }
      
      throw new Error("Failed to delete event");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Erro ao excluir evento",
        description: "Não foi possível excluir o evento do calendário.",
        variant: "destructive"
      });
    }
  }, []);
  
  const getEventById = useCallback(
    (eventId: string) => events.find(event => event.id === eventId),
    [events]
  );
  
  const getEventsByDate = useCallback(
    (date: string) => {
      return events.filter(event => event.date === date);
    },
    [events]
  );
  
  const value = {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventById,
    getEventsByDate,
    loading,
    refreshEvents: loadEvents
  };
  
  return (
    <CalendarEventsContext.Provider value={value}>
      {children}
    </CalendarEventsContext.Provider>
  );
}

export function useCalendarEvents() {
  const context = useContext(CalendarEventsContext);
  if (context === undefined) {
    throw new Error("useCalendarEvents must be used within a CalendarEventsProvider");
  }
  return context;
}
