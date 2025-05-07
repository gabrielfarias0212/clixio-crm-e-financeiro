
import { useState, useMemo } from "react";
import { format, parse, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { normalizeDate, TIMEZONE, stringToDate, dateToString } from "@/utils/dates";
import { Client } from "@/utils/types";
import { formatInTimeZone } from "date-fns-tz";

export function useCalendarPage(clients: Client[]) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("month");
  const [addEventOpen, setAddEventOpen] = useState(false);
  const { events } = useCalendarEvents();
  
  // Filter clients with wedding dates
  const clientsWithWeddingDates = useMemo(() => 
    clients.filter(client => client.weddingDate !== null) as (Client & { weddingDate: string })[],
  [clients]);

  // Get current month and year for header display
  const currentMonthYear = useMemo(() => {
    if (!date) return "";
    
    try {
      // Format the current date for display
      return formatInTimeZone(date, TIMEZONE, "MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      console.error("Error formatting date:", error);
      return format(date, "MMMM 'de' yyyy", { locale: ptBR });
    }
  }, [date]);

  // Group clients by date
  const clientsByDate = useMemo(() => {
    const result: Record<string, Client[]> = {};
    
    clientsWithWeddingDates.forEach(client => {
      if (!client.weddingDate) return;
      
      // Convert to YYYY-MM-DD for consistent key format
      const dateObj = stringToDate(client.weddingDate);
      if (!dateObj) return;
      
      const dateKey = normalizeDate(dateObj);
      
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
      try {
        // Convert YYYY-MM-DD to Date object
        if (dateStr && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = dateStr.split('-').map(Number);
          const eventDate = new Date(year, month - 1, day);
          
          // Make sure it's valid before adding
          if (!isNaN(eventDate.getTime())) {
            dates.push(eventDate);
          }
        }
      } catch (error) {
        console.error("Error parsing date:", dateStr, error);
      }
    });
    
    // Add calendar events
    events.forEach(event => {
      // Convert string date to Date object
      const eventDate = stringToDate(event.date);
      if (eventDate && !isNaN(eventDate.getTime()) && 
          !dates.some(d => 
            d.getFullYear() === eventDate.getFullYear() && 
            d.getMonth() === eventDate.getMonth() &&
            d.getDate() === eventDate.getDate())) {
        dates.push(eventDate);
      }
    });
    
    return dates;
  }, [clientsByDate, events]);

  // Get selected day's clients and events
  const selectedDayItems = useMemo(() => {
    if (!date) return { clients: [], events: [] };
    
    try {
      // Convert the selected Date object to a normalized date string
      const dateKey = normalizeDate(date);
      
      // Get clients for this date
      const dayClients = clientsByDate[dateKey] || [];
      
      // Get events for this date
      const dayEvents = events.filter(event => {
        const eventDate = stringToDate(event.date);
        return eventDate && normalizeDate(eventDate) === dateKey;
      });
      
      return { clients: dayClients, events: dayEvents };
    } catch (error) {
      console.error("Error getting selected day items:", error);
      return { clients: [], events: [] };
    }
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
