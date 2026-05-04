import { useState, useMemo } from "react";
import { ptBR } from "date-fns/locale";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { normalizeDate, TIMEZONE, stringToDate } from "@/utils/dates";
import { Client } from "@/utils/types";
import { formatInTimeZone } from "date-fns-tz";

export function useCalendarPage(clients: Client[]) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("month");
  const [addEventOpen, setAddEventOpen] = useState(false);
  const { events } = useCalendarEvents();

  // 1. Agrupar Clientes por Data (YYYY-MM-DD)
  const clientsByDate = useMemo(() => {
    const result: Record<string, Client[]> = {};
    
    clients.forEach(client => {
      if (client.status === "contrato_perdido") return;
      if (!client.weddingDate) return;
      const dateObj = stringToDate(client.weddingDate);
      if (!dateObj) return;
      
      const dateKey = normalizeDate(dateObj);
      if (!result[dateKey]) result[dateKey] = [];
      result[dateKey].push(client);
    });
    
    return result;
  }, [clients]);

  // 2. Agrupar Eventos do Calendário por Data (YYYY-MM-DD)
  // Isso resolve o problema de sincronização do Claude
  const eventsByDate = useMemo(() => {
    const result: Record<string, any[]> = {};
    
    events.forEach(event => {
      const dateObj = stringToDate(event.date);
      if (!dateObj) return;
      
      const dateKey = normalizeDate(dateObj);
      if (!result[dateKey]) result[dateKey] = [];
      result[dateKey].push(event);
    });
    
    return result;
  }, [events]);

  // 3. Gerar array de objetos Date para os marcadores (dots) do calendário
  const eventDates = useMemo(() => {
    // Usamos um Set para evitar duplicatas no mesmo dia
    const allKeys = new Set([...Object.keys(clientsByDate), ...Object.keys(eventsByDate)]);
    
    return Array.from(allKeys).map(dateStr => {
      const [year, month, day] = dateStr.split('-').map(Number);
      // Criamos a data local às 12:00 para evitar que o fuso a jogue para o dia anterior
      return new Date(year, month - 1, day, 12, 0, 0);
    });
  }, [clientsByDate, eventsByDate]);

  // 4. Itens do dia selecionado
  const selectedDayItems = useMemo(() => {
    if (!date) return { clients: [], events: [] };
    
    const dateKey = normalizeDate(date);
    return {
      clients: clientsByDate[dateKey] || [],
      events: eventsByDate[dateKey] || []
    };
  }, [date, clientsByDate, eventsByDate]);

  // 5. Título do Header (Ex: "Abril de 2026")
  const currentMonthYear = useMemo(() => {
    if (!date) return "";
    return formatInTimeZone(date, TIMEZONE, "MMMM 'de' yyyy", { locale: ptBR });
  }, [date]);

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
    clientsByDate,
    eventsByDate
  };
}
