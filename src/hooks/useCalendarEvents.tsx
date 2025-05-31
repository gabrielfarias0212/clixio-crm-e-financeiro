
import { useCallback, useEffect, useState, createContext, useContext, ReactNode, useRef } from "react";
import { CalendarEvent } from "@/utils/types";
import { normalizeDate } from "@/utils/dates";
import { 
  fetchCalendarEvents, 
  createCalendarEvent, 
  updateCalendarEvent, 
  deleteCalendarEvent 
} from "@/utils/supabase/calendar-events";

interface CalendarEventsContextProps {
  events: CalendarEvent[];
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (event: CalendarEvent) => void;
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
  deleteEvent: () => {},
  getEventById: () => undefined,
  getEventsByDate: () => [],
  loading: false,
  error: null
});

export function CalendarEventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialized = useRef(false);
  
  // Load events from Supabase on component mount
  useEffect(() => {
    const loadEvents = async () => {
      if (isInitialized.current) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Try to load from Supabase first
        const supabaseEvents = await fetchCalendarEvents();
        
        if (supabaseEvents.length > 0) {
          console.log("[CalendarEvents] Carregando eventos do Supabase:", supabaseEvents.length);
          setEvents(supabaseEvents);
        } else {
          // Fallback to localStorage if no events in Supabase
          const storedEvents = localStorage.getItem("calendarEvents");
          if (storedEvents) {
            try {
              const parsedEvents = JSON.parse(storedEvents);
              console.log("[CalendarEvents] Eventos encontrados no localStorage, migrando para Supabase:", parsedEvents.length);
              
              // Migrate localStorage events to Supabase
              const migratedEvents = await migrateLocalStorageEvents(parsedEvents);
              setEvents(migratedEvents);
              
              // Clear localStorage after successful migration
              localStorage.removeItem("calendarEvents");
              console.log("[CalendarEvents] Migração concluída, localStorage limpo");
            } catch (parseError) {
              console.error("[CalendarEvents] Erro ao parsear eventos do localStorage:", parseError);
              setEvents([]);
            }
          } else {
            setEvents([]);
          }
        }
        
        isInitialized.current = true;
      } catch (loadError) {
        console.error("[CalendarEvents] Erro ao carregar eventos:", loadError);
        setError("Erro ao carregar eventos");
        
        // Fallback to localStorage on error
        try {
          const storedEvents = localStorage.getItem("calendarEvents");
          if (storedEvents) {
            const parsedEvents = JSON.parse(storedEvents);
            setEvents(parsedEvents);
          }
        } catch (fallbackError) {
          console.error("[CalendarEvents] Erro no fallback:", fallbackError);
          setEvents([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);
  
  // Migration helper function
  const migrateLocalStorageEvents = async (localEvents: any[]): Promise<CalendarEvent[]> => {
    const migratedEvents: CalendarEvent[] = [];
    
    for (const event of localEvents) {
      try {
        // Format the event data properly
        const formattedEvent: CalendarEvent = {
          ...event,
          startTime: event.startTime || event.time || "09:00",
          endTime: event.endTime || (event.time ? incrementTimeByOneHour(event.time) : "10:00")
        };
        
        const createdEvent = await createCalendarEvent(formattedEvent);
        if (createdEvent) {
          migratedEvents.push(createdEvent);
        }
      } catch (error) {
        console.error("[CalendarEvents] Erro ao migrar evento:", event.id, error);
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
    console.log("[CalendarEvents] Adicionando evento:", event);
    
    try {
      setError(null);
      
      // Try to create in Supabase first
      const createdEvent = await createCalendarEvent(event);
      
      if (createdEvent) {
        setEvents(prev => {
          // Check if event already exists to avoid duplicates
          const existingIndex = prev.findIndex(e => e.id === createdEvent.id);
          if (existingIndex !== -1) {
            console.log("[CalendarEvents] Evento já existe, atualizando:", createdEvent.id);
            const newEvents = [...prev];
            newEvents[existingIndex] = createdEvent;
            return newEvents;
          }
          
          console.log("[CalendarEvents] Novo evento adicionado:", createdEvent.id);
          return [...prev, createdEvent];
        });
      } else {
        throw new Error("Falha ao criar evento no Supabase");
      }
    } catch (createError) {
      console.error("[CalendarEvents] Erro ao adicionar evento:", createError);
      setError("Erro ao salvar evento");
      
      // Fallback to local state only
      setEvents(prev => {
        const existingIndex = prev.findIndex(e => e.id === event.id);
        if (existingIndex !== -1) {
          const newEvents = [...prev];
          newEvents[existingIndex] = event;
          return newEvents;
        }
        return [...prev, event];
      });
    }
  }, []);
  
  const updateEvent = useCallback(async (updatedEvent: CalendarEvent) => {
    console.log("[CalendarEvents] Atualizando evento:", updatedEvent);
    
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
        throw new Error("Falha ao atualizar evento no Supabase");
      }
    } catch (updateError) {
      console.error("[CalendarEvents] Erro ao atualizar evento:", updateError);
      setError("Erro ao atualizar evento");
      
      // Fallback to local state only
      setEvents(prev => 
        prev.map(event => 
          event.id === updatedEvent.id ? updatedEvent : event
        )
      );
    }
  }, []);
  
  const deleteEvent = useCallback(async (eventId: string) => {
    console.log("[CalendarEvents] Removendo evento:", eventId);
    
    try {
      setError(null);
      
      const success = await deleteCalendarEvent(eventId);
      
      if (success) {
        setEvents(prev => {
          const filtered = prev.filter(event => event.id !== eventId);
          console.log("[CalendarEvents] Eventos restantes após remoção:", filtered.length);
          return filtered;
        });
      } else {
        throw new Error("Falha ao deletar evento no Supabase");
      }
    } catch (deleteError) {
      console.error("[CalendarEvents] Erro ao remover evento:", deleteError);
      setError("Erro ao remover evento");
      
      // Fallback to local state only
      setEvents(prev => {
        const filtered = prev.filter(event => event.id !== eventId);
        return filtered;
      });
    }
  }, []);
  
  const getEventById = useCallback(
    (eventId: string) => {
      const event = events.find(event => event.id === eventId);
      console.log("[CalendarEvents] Buscando evento por ID:", eventId, "encontrado:", !!event);
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
      console.log("[CalendarEvents] Eventos para data:", date, "encontrados:", filtered.length);
      return filtered;
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
