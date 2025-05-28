
import { useCallback, useEffect, useState, createContext, useContext, ReactNode, useRef } from "react";
import { CalendarEvent } from "@/utils/types";
import { formatDate, stringToDate, dateToString, normalizeDate } from "@/utils/dates";

interface CalendarEventsContextProps {
  events: CalendarEvent[];
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (event: CalendarEvent) => void;
  deleteEvent: (eventId: string) => void;
  getEventById: (eventId: string) => CalendarEvent | undefined;
  getEventsByDate: (date: string) => CalendarEvent[];
}

const CalendarEventsContext = createContext<CalendarEventsContextProps>({
  events: [],
  addEvent: () => {},
  updateEvent: () => {},
  deleteEvent: () => {},
  getEventById: () => undefined,
  getEventsByDate: () => []
});

export function CalendarEventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const lastSaveTime = useRef<number>(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Load events from localStorage on component mount
  useEffect(() => {
    const loadEvents = () => {
      try {
        const storedEvents = localStorage.getItem("calendarEvents");
        if (storedEvents) {
          const parsedEvents = JSON.parse(storedEvents);
          console.log("[CalendarEvents] Carregando eventos do localStorage:", parsedEvents.length);
          
          // Fix legacy events that have Date objects stored as strings
          const formattedEvents = parsedEvents.map((event: any) => {
            // If the date is an object (from older versions), convert to our string format
            if (typeof event.date === 'object') {
              const dateObj = new Date(event.date);
              return {
                ...event,
                date: dateToString(dateObj),
                startTime: event.startTime || event.time || "09:00",
                endTime: event.endTime || (event.time ? 
                  incrementTimeByOneHour(event.time) : "10:00")
              };
            }
            
            // Handle legacy events with ISO date strings
            if (typeof event.date === 'string' && event.date.includes('T')) {
              const dateObj = new Date(event.date);
              return {
                ...event,
                date: dateToString(dateObj),
                startTime: event.startTime || event.time || "09:00",
                endTime: event.endTime || (event.time ? 
                  incrementTimeByOneHour(event.time) : "10:00")
              };
            }
            
            // If date is already properly formatted as DD/MM/YYYY, just ensure time fields
            return {
              ...event,
              startTime: event.startTime || event.time || "09:00",
              endTime: event.endTime || (event.time ? 
                incrementTimeByOneHour(event.time) : "10:00")
            };
          });
          
          setEvents(formattedEvents);
        }
      } catch (error) {
        console.error("[CalendarEvents] Erro ao carregar eventos:", error);
        // Em caso de erro, manter array vazio
        setEvents([]);
      }
    };

    loadEvents();
  }, []);
  
  // Helper to increment time by one hour for legacy events
  const incrementTimeByOneHour = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const newHours = (hours + 1) % 24;
    return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
  
  // Debounced save to localStorage
  const saveToLocalStorage = useCallback((eventsToSave: CalendarEvent[]) => {
    const now = Date.now();
    
    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Debounce saves to avoid too frequent writes
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem("calendarEvents", JSON.stringify(eventsToSave));
        lastSaveTime.current = now;
        console.log("[CalendarEvents] Eventos salvos no localStorage:", eventsToSave.length);
      } catch (error) {
        console.error("[CalendarEvents] Erro ao salvar eventos:", error);
      }
    }, 300);
  }, []);
  
  // Save events to localStorage whenever they change
  useEffect(() => {
    if (events.length >= 0) { // Allow saving even when empty
      saveToLocalStorage(events);
    }
  }, [events, saveToLocalStorage]);
  
  const addEvent = useCallback((event: CalendarEvent) => {
    console.log("[CalendarEvents] Adicionando evento:", event);
    
    // Ensure the date is in the correct string format (DD/MM/YYYY)
    const updatedEvent = { ...event };
    
    // Fix TypeScript error by properly checking the date type
    if (typeof updatedEvent.date === 'object' && updatedEvent.date !== null) {
      updatedEvent.date = dateToString(updatedEvent.date as Date);
    }
    
    setEvents(prev => {
      // Check if event already exists to avoid duplicates
      const existingIndex = prev.findIndex(e => e.id === updatedEvent.id);
      if (existingIndex !== -1) {
        console.log("[CalendarEvents] Evento já existe, atualizando:", updatedEvent.id);
        const newEvents = [...prev];
        newEvents[existingIndex] = updatedEvent;
        return newEvents;
      }
      
      console.log("[CalendarEvents] Novo evento adicionado:", updatedEvent.id);
      return [...prev, updatedEvent];
    });
  }, []);
  
  const updateEvent = useCallback((updatedEvent: CalendarEvent) => {
    console.log("[CalendarEvents] Atualizando evento:", updatedEvent);
    
    setEvents(prev => 
      prev.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
  }, []);
  
  const deleteEvent = useCallback((eventId: string) => {
    console.log("[CalendarEvents] Removendo evento:", eventId);
    
    setEvents(prev => {
      const filtered = prev.filter(event => event.id !== eventId);
      console.log("[CalendarEvents] Eventos restantes após remoção:", filtered.length);
      return filtered;
    });
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
    getEventsByDate
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
