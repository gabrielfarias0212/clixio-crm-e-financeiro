
import { useCallback, useEffect, useState, createContext, useContext, ReactNode } from "react";
import { CalendarEvent } from "@/utils/types";
import { formatDate } from "@/utils/dateUtils";

interface CalendarEventsContextProps {
  events: CalendarEvent[];
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (event: CalendarEvent) => void;
  deleteEvent: (eventId: string) => void;
  getEventById: (eventId: string) => CalendarEvent | undefined;
  getEventsByDate: (date: Date) => CalendarEvent[];
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
  
  // Load events from localStorage on component mount
  useEffect(() => {
    const storedEvents = localStorage.getItem("calendarEvents");
    if (storedEvents) {
      try {
        const parsedEvents = JSON.parse(storedEvents);
        // Fix timezone issue by creating proper date objects
        const eventsWithDates = parsedEvents.map((event: any) => {
          // Create a new Date object with the date components from the stored date string
          const dateObj = new Date(event.date);
          // Create a new date using local year, month, day with noon time to avoid timezone issues
          const localDate = new Date(
            dateObj.getFullYear(),
            dateObj.getMonth(),
            dateObj.getDate(),
            12, 0, 0
          );
          
          return {
            ...event,
            date: localDate
          };
        });
        setEvents(eventsWithDates);
      } catch (error) {
        console.error("Failed to parse calendar events from localStorage", error);
      }
    }
  }, []);
  
  // Save events to localStorage whenever they change
  useEffect(() => {
    if (events.length > 0) {
      // When saving events, let's ensure dates are properly serialized
      const eventsToStore = events.map(event => ({
        ...event,
        // No special handling needed here as JSON.stringify() will handle the serialization
        // The fix is in how we load the dates back
      }));
      localStorage.setItem("calendarEvents", JSON.stringify(eventsToStore));
    }
  }, [events]);
  
  const addEvent = useCallback((event: CalendarEvent) => {
    // Ensure the date is set to noon to avoid timezone issues
    const normalizedDate = new Date(
      event.date.getFullYear(),
      event.date.getMonth(),
      event.date.getDate(),
      12, 0, 0
    );
    
    setEvents(prev => [...prev, {
      ...event,
      date: normalizedDate
    }]);
  }, []);
  
  const updateEvent = useCallback((updatedEvent: CalendarEvent) => {
    // Ensure the date is set to noon to avoid timezone issues
    const normalizedDate = new Date(
      updatedEvent.date.getFullYear(),
      updatedEvent.date.getMonth(),
      updatedEvent.date.getDate(),
      12, 0, 0
    );
    
    setEvents(prev => 
      prev.map(event => 
        event.id === updatedEvent.id ? {
          ...updatedEvent,
          date: normalizedDate
        } : event
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
  
  const getEventsByDate = useCallback(
    (date: Date) => {
      const dateString = date.toISOString().split('T')[0];
      return events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toISOString().split('T')[0] === dateString;
      });
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
