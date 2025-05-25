
import { useCallback, useEffect, useState, createContext, useContext, ReactNode } from "react";
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
  
  // Load events from localStorage on component mount
  useEffect(() => {
    const storedEvents = localStorage.getItem("calendarEvents");
    if (storedEvents) {
      try {
        const parsedEvents = JSON.parse(storedEvents);
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
        
        console.log('Loaded events from localStorage:', formattedEvents);
        setEvents(formattedEvents);
      } catch (error) {
        console.error("Failed to parse calendar events from localStorage", error);
      }
    }
  }, []);
  
  // Helper to increment time by one hour for legacy events
  const incrementTimeByOneHour = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const newHours = (hours + 1) % 24;
    return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
  
  // Save events to localStorage whenever they change
  useEffect(() => {
    console.log('Saving events to localStorage:', events);
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  }, [events]);
  
  const addEvent = useCallback((event: CalendarEvent) => {
    console.log('Adding event:', event);
    // Ensure the date is in the correct string format (DD/MM/YYYY)
    const updatedEvent = { ...event };
    
    // Fix TypeScript error by properly checking the date type
    if (typeof updatedEvent.date === 'object' && updatedEvent.date !== null) {
      // Here we're avoiding the instanceof check that was causing problems
      updatedEvent.date = dateToString(updatedEvent.date as Date);
    }
    
    setEvents(prev => {
      const newEvents = [...prev, updatedEvent];
      console.log('Events after adding:', newEvents);
      return newEvents;
    });
  }, []);
  
  const updateEvent = useCallback((updatedEvent: CalendarEvent) => {
    console.log('Updating event:', updatedEvent);
    setEvents(prev => {
      const newEvents = prev.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      );
      console.log('Events after updating:', newEvents);
      return newEvents;
    });
  }, []);
  
  const deleteEvent = useCallback((eventId: string) => {
    console.log('Deleting event:', eventId);
    setEvents(prev => {
      const newEvents = prev.filter(event => event.id !== eventId);
      console.log('Events after deleting:', newEvents);
      return newEvents;
    });
  }, []);
  
  const getEventById = useCallback(
    (eventId: string) => events.find(event => event.id === eventId),
    [events]
  );
  
  const getEventsByDate = useCallback(
    (date: string) => {
      // Normalize the date to YYYY-MM-DD format for comparison
      const dateKey = normalizeDate(date);
      return events.filter(event => {
        const eventDateKey = normalizeDate(event.date);
        return eventDateKey === dateKey;
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
