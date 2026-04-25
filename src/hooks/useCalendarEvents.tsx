import { useCallback, useEffect, useState, createContext, useContext, ReactNode } from "react";
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

  // Recarrega sempre que o usuário mudar — sem isInitialized
  useEffect(() => {
    if (!user) return;

    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("[CalendarEvents] Loading events for user:", user.id);
        const data = await fetchCalendarEvents();
        console.log("[CalendarEvents] Loaded:", data.length, "events");
        setEvents(data);
      } catch (err) {
        console.error("[CalendarEvents] Error loading events:", err);
        setError("Erro ao carregar eventos");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [user]);

  const addEvent = useCallback(async (event: CalendarEvent) => {
    if (!user) return;
    try {
      setError(null);
      const created = await createCalendarEvent(event);
      if (created) {
        setEvents(prev => {
          const idx = prev.findIndex(e => e.id === created.id);
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = created;
            return next;
          }
          return [...prev, created];
        });
      }
    } catch (err) {
      console.error("[CalendarEvents] Error adding event:", err);
      setError("Erro ao salvar evento");
    }
  }, [user]);

  const updateEvent = useCallback(async (updatedEvent: CalendarEvent) => {
    if (!user) return;
    try {
      setError(null);
      const result = await updateCalendarEvent(updatedEvent);
      if (result) {
        setEvents(prev => prev.map(e => e.id === updatedEvent.id ? result : e));
      }
    } catch (err) {
      console.error("[CalendarEvents] Error updating event:", err);
      setError("Erro ao atualizar evento");
    }
  }, [user]);

  const updateEventStatus = useCallback(async (eventId: string, updates: { isEdited?: boolean; isDelivered?: boolean }) => {
    if (!user) return;
    try {
      setError(null);
      const result = await updateCalendarEventStatus(eventId, updates);
      if (result) {
        setEvents(prev => prev.map(e => e.id === eventId ? result : e));
      }
    } catch (err) {
      console.error("[CalendarEvents] Error updating event status:", err);
      setError("Erro ao atualizar status do evento");
    }
  }, [user]);

  const deleteEvent = useCallback(async (eventId: string) => {
    if (!user) return;
    try {
      setError(null);
      const success = await deleteCalendarEvent(eventId);
      if (success) {
        setEvents(prev => prev.filter(e => e.id !== eventId));
      }
    } catch (err) {
      console.error("[CalendarEvents] Error removing event:", err);
      setError("Erro ao remover evento");
    }
  }, [user]);

  const getEventById = useCallback(
    (eventId: string) => events.find(e => e.id === eventId),
    [events]
  );

  const getEventsByDate = useCallback(
    (date: string) => {
      const dateKey = normalizeDate(date);
      return events.filter(event => normalizeDate(event.date) === dateKey);
    },
    [events]
  );

  return (
    <CalendarEventsContext.Provider value={{
      events, addEvent, updateEvent, updateEventStatus,
      deleteEvent, getEventById, getEventsByDate, loading, error
    }}>
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
