
import { useCallback, useEffect, useState, createContext, useContext, ReactNode } from "react";
import { CalendarEvent } from "@/utils/types";

interface CalendarEventsContextProps {
  events: CalendarEvent[];
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (event: CalendarEvent) => void;
  deleteEvent: (eventId: string) => void;
  getEventById: (eventId: string) => CalendarEvent | undefined;
}

const CalendarEventsContext = createContext<CalendarEventsContextProps>({
  events: [],
  addEvent: () => {},
  updateEvent: () => {},
  deleteEvent: () => {},
  getEventById: () => undefined
});

export function CalendarEventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  
  // Load events from localStorage on component mount
  useEffect(() => {
    const storedEvents = localStorage.getItem("calendarEvents");
    if (storedEvents) {
      try {
        const parsedEvents = JSON.parse(storedEvents);
        // Convert date strings back to Date objects
        const eventsWithDates = parsedEvents.map((event: any) => ({
          ...event,
          date: new Date(event.date)
        }));
        setEvents(eventsWithDates);
      } catch (error) {
        console.error("Failed to parse calendar events from localStorage", error);
      }
    }
  }, []);
  
  // Save events to localStorage whenever they change
  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem("calendarEvents", JSON.stringify(events));
    }
  }, [events]);
  
  const addEvent = useCallback((event: CalendarEvent) => {
    setEvents(prev => [...prev, event]);
  }, []);
  
  const updateEvent = useCallback((updatedEvent: CalendarEvent) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
  }, []);
  
  const deleteEvent = useCallback((eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  }, []);
  
  const getEventById = useCallback(
    (eventId: string) => events.find(event => event.id === eventId),
    [events]
  );
  
  const value = {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventById
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
