
import { useState, useMemo } from "react";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { normalizeDate, TIMEZONE } from "@/utils/dateUtils";
import { Client } from "@/utils/types";
import { formatTZ } from "date-fns-tz";

export function useCalendarPage(clients: Client[]) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("month");
  const [addEventOpen, setAddEventOpen] = useState(false);
  const { events } = useCalendarEvents();
  
  // Filter clients with wedding dates
  const clientsWithWeddingDates = useMemo(() => 
    clients.filter(client => client.weddingDate !== null) as (Client & { weddingDate: Date })[],
  [clients]);

  // Get current month and year for header display
  const currentMonthYear = useMemo(() => {
    if (!date) return "";
    return formatTZ(date, "MMMM 'de' yyyy", { locale: ptBR, timeZone: TIMEZONE });
  }, [date]);

  // Group clients by date - use a consistent date format without time component
  const clientsByDate = useMemo(() => {
    const result: Record<string, Client[]> = {};
    
    clientsWithWeddingDates.forEach(client => {
      // Make sure we're working with a Date object with the correct day
      const weddingDate = new Date(client.weddingDate);
      
      // Use the normalize function to create the date key
      const dateKey = normalizeDate(weddingDate);
      
      if (!result[dateKey]) {
        result[dateKey] = [];
      }
      result[dateKey].push(client);
    });
    
    return result;
  }, [clientsWithWeddingDates]);

  // Get all event dates (client events + calendar events)
  const eventDates = useMemo(() => {
    const dates: Date[] = [];
    
    // Add client wedding dates
    Object.keys(clientsByDate).forEach(dateStr => {
      const [year, month, day] = dateStr.split('-').map(Number);
      dates.push(new Date(year, month - 1, day, 12, 0, 0));
    });
    
    // Add calendar events
    events.forEach(event => {
      const eventDate = new Date(event.date);
      if (!dates.some(d => isSameDay(d, eventDate))) {
        dates.push(eventDate);
      }
    });
    
    return dates;
  }, [clientsByDate, events]);

  // Get selected day's clients and events
  const selectedDayItems = useMemo(() => {
    if (!date) return { clients: [], events: [] };
    
    // Get clients for this date
    const dateKey = normalizeDate(date);
    const dayClients = clientsByDate[dateKey] || [];
    
    // Get events for this date
    const dayEvents = events.filter(event => 
      normalizeDate(event.date) === dateKey
    );
    
    return { clients: dayClients, events: dayEvents };
  }, [date, clientsByDate, events]);

  return {
    date,
    setDate,
    view,
    setView,
    addEventOpen,
    setAddEventOpen,
    currentMonthYear,
    eventDates,
    selectedDayItems,
    clientsByDate
  };
}
