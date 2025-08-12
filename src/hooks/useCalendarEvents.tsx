import { useCallback, useEffect, useState, createContext, useContext, ReactNode, useRef } from "react";
import { CalendarEvent } from "@/utils/types";
import { normalizeDate } from "@/utils/dates";
import { 
  fetchCalendarEvents, 
  createCalendarEvent, 
  updateCalendarEvent, 
  updateCalendarEventStatus,
  deleteCalendarEvent 
} from "@/utils/supabase/calendar-events";
import { useAuth } from "@/contexts/AuthContext";

interface CalendarEventsContextProps {
  events: CalendarEvent[];
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (event: CalendarEvent) => void;
  updateEventStatus: (eventId: string, updates: { isEdited?: boolean; isDelivered?: boolean }) => void;
  deleteEvent: (eventId: string) => void;
  getEventById: (eventId: string) => CalendarEvent | undefined;
  getEventsByDate: (date: string) => CalendarEvent[];
  loading: boolean;
  error: string | null;
}

const CalendarEventsContext = createContext<CalendarEventsContextProps>({
  events: [],
  addEvent: () => {},
  updateEvent: () => {},
  updateEventStatus: () => {},
  deleteEvent: () => {},
  getEventById: () => undefined,
  getEventsByDate: () => [],
  loading: false,
  error: null
});

export function CalendarEventsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialized = useRef(false);
  
  // Load events from Supabase on component mount
  useEffect(() => {
    const loadEvents = async () => {
      if (isInitialized.current || !user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        console.log("[CalendarEvents] Loading events from Supabase for user:", user.id);
        const supabaseEvents = await fetchCalendarEvents();
        
        if (supabaseEvents.length > 0) {
          console.log("[CalendarEvents] Loaded events from Supabase:", supabaseEvents.length);
          setEvents(supabaseEvents);
        } else {
          // Try to migrate localStorage events if no events in database
          const storedEvents = localStorage.getItem("calendarEvents");
          if (storedEvents) {
            try {
              const parsedEvents = JSON.parse(storedEvents);
              console.log("[CalendarEvents] Found localStorage events, migrating:", parsedEvents.length);
              
              // Migrate localStorage events to Supabase
              const migratedEvents = await migrateLocalStorageEvents(parsedEvents);
              setEvents(migratedEvents);
              
              // Clear localStorage after successful migration
              localStorage.removeItem("calendarEvents");
              console.log("[CalendarEvents] Migration completed, localStorage cleared");
            } catch (parseError) {
              console.error("[CalendarEvents] Error parsing localStorage events:", parseError);
              setEvents([]);
            }
          } else {
            setEvents([]);
          }
        }
        
        isInitialized.current = true;
      } catch (loadError) {
        console.error("[CalendarEvents] Error loading events:", loadError);
        setError("Erro ao carregar eventos");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [user]);
  
  // Migration helper function
  const migrateLocalStorageEvents = async (localEvents: any[]): Promise<CalendarEvent[]> => {
    const migratedEvents: CalendarEvent[] = [];
    
    for (const event of localEvents) {
      try {
        // Format the event data properly
        const formattedEvent: CalendarEvent = {
          ...event,
          startTime: event.startTime || event.time || "09:00",
          endTime: event.endTime || (event.time ? incrementTimeByOneHour(event.time) : "10:00"),
          isEdited: false,
          isDelivered: false
        };
        
        const createdEvent = await createCalendarEvent(formattedEvent);
        if (createdEvent) {
          migratedEvents.push(createdEvent);
        }
      } catch (error) {
        console.error("[CalendarEvents] Error migrating event:", event.id, error);
      }
    }
    
    return migratedEvents;
  };
  
  // Helper to increment time by one hour for legacy events
  const incrementTimeByOneHour = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const newHours = (hours + 1) % 24;
    return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
  
  const addEvent = useCallback(async (event: CalendarEvent) => {
    if (!user) {
      setError("Usuário não autenticado");
      return;
    }

    console.log("[CalendarEvents] Adding event:", event);
    
    try {
      setError(null);
      
      const createdEvent = await createCalendarEvent(event);
      
      if (createdEvent) {
        setEvents(prev => {
          // Check if event already exists to avoid duplicates
          const existingIndex = prev.findIndex(e => e.id === createdEvent.id);
          if (existingIndex !== -1) {
            console.log("[CalendarEvents] Event already exists, updating:", createdEvent.id);
            const newEvents = [...prev];
            newEvents[existingIndex] = createdEvent;
            return newEvents;
          }
          
          console.log("[CalendarEvents] New event added:", createdEvent.id);
          return [...prev, createdEvent];
        });
      } else {
        throw new Error("Failed to create event in Supabase");
      }
    } catch (createError) {
      console.error("[CalendarEvents] Error adding event:", createError);
      setError("Erro ao salvar evento");
    }
  }, [user]);
  
  const updateEvent = useCallback(async (updatedEvent: CalendarEvent) => {
    if (!user) {
      setError("Usuário não autenticado");
      return;
    }

    console.log("[CalendarEvents] Updating event:", updatedEvent);
    
    try {
      setError(null);
      
      const result = await updateCalendarEvent(updatedEvent);
      
      if (result) {
        setEvents(prev => 
          prev.map(event => 
            event.id === updatedEvent.id ? result : event
          )
        );
      } else {
        throw new Error("Failed to update event in Supabase");
      }
    } catch (updateError) {
      console.error("[CalendarEvents] Error updating event:", updateError);
      setError("Erro ao atualizar evento");
    }
  }, [user]);

  const updateEventStatus = useCallback(async (eventId: string, updates: { isEdited?: boolean; isDelivered?: boolean }) => {
    if (!user) {
      setError("Usuário não autenticado");
      return;
    }

    console.log("[CalendarEvents] Updating event status:", eventId, updates);
    
    try {
      setError(null);
      
      const result = await updateCalendarEventStatus(eventId, updates);
      
      if (result) {
        setEvents(prev => 
          prev.map(event => 
            event.id === eventId ? result : event
          )
        );
      } else {
        throw new Error("Failed to update event status in Supabase");
      }
    } catch (updateError) {
      console.error("[CalendarEvents] Error updating event status:", updateError);
      setError("Erro ao atualizar status do evento");
    }
  }, [user]);
  
  const deleteEvent = useCallback(async (eventId: string) => {
    if (!user) {
      setError("Usuário não autenticado");
      return;
    }

    console.log("[CalendarEvents] Removing event:", eventId);
    
    try {
      setError(null);
      
      const success = await deleteCalendarEvent(eventId);
      
      if (success) {
        setEvents(prev => {
          const filtered = prev.filter(event => event.id !== eventId);
          console.log("[CalendarEvents] Events remaining after removal:", filtered.length);
          return filtered;
        });
      } else {
        throw new Error("Failed to delete event in Supabase");
      }
    } catch (deleteError) {
      console.error("[CalendarEvents] Error removing event:", deleteError);
      setError("Erro ao remover evento");
    }
  }, [user]);
  
  const getEventById = useCallback(
    (eventId: string) => {
      const event = events.find(event => event.id === eventId);
      console.log("[CalendarEvents] Searching event by ID:", eventId, "found:", !!event);
      return event;
    },
    [events]
  );
  
  const getEventsByDate = useCallback(
    (date: string) => {
      // Normalize the date to YYYY-MM-DD format for comparison
      const dateKey = normalizeDate(date);
      const filtered = events.filter(event => {
        const eventDateKey = normalizeDate(event.date);
        return eventDateKey === dateKey;
      });
      console.log("[CalendarEvents] Events for date:", date, "found:", filtered.length);
      return filtered;
    },
    [events]
  );
  
  const value = {
    events,
    addEvent,
    updateEvent,
    updateEventStatus,
    deleteEvent,
    getEventById,
    getEventsByDate,
    loading,
    error
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
