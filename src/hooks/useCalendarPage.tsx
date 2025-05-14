
import { useState, useMemo, useCallback } from "react";
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
  
  // Cache de clientes com datas de casamento para melhorar performance
  const clientsWithWeddingDates = useMemo(() => 
    clients.filter(client => client.weddingDate !== null) as (Client & { weddingDate: string })[],
  [clients]);

  // Get current month and year for header display - otimizado com memoization
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

  // Group clients by date - otimizado com memoization
  const clientsByDate = useMemo(() => {
    if (clientsWithWeddingDates.length === 0) return {};
    
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

  // Get all event dates (client events + calendar events) - otimizado com memoization
  const eventDates = useMemo(() => {
    if (events.length === 0 && Object.keys(clientsByDate).length === 0) {
      return [];
    }
    
    const dates: Date[] = [];
    const dateMap = new Map<string, Date>();
    
    // Add client wedding dates
    Object.keys(clientsByDate).forEach(dateStr => {
      try {
        // Convert YYYY-MM-DD to Date object
        if (dateStr && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = dateStr.split('-').map(Number);
          const eventDate = new Date(year, month - 1, day);
          
          // Make sure it's valid before adding
          if (!isNaN(eventDate.getTime())) {
            const key = dateStr;
            if (!dateMap.has(key)) {
              dateMap.set(key, eventDate);
              dates.push(eventDate);
            }
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
      if (eventDate && !isNaN(eventDate.getTime())) {
        const key = normalizeDate(eventDate);
        if (!dateMap.has(key)) {
          dateMap.set(key, eventDate);
          dates.push(eventDate);
        }
      }
    });
    
    return dates;
  }, [clientsByDate, events]);
  
  // Função otimizada para obter eventos do dia selecionado
  const getSelectedDayItems = useCallback(() => {
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

  // Get selected day's clients and events - usando a função otimizada
  const selectedDayItems = useMemo(() => getSelectedDayItems(), [getSelectedDayItems]);

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
