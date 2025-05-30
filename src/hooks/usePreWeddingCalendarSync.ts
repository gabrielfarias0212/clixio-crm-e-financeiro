
import { useEffect, useRef, useCallback } from "react";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { v4 as uuidv4 } from "uuid";
import { CalendarEvent } from "@/utils/types";

interface UsePreWeddingCalendarSyncProps {
  clientId?: string;
  clientName: string;
  preWeddingDate: string | null;
  preWeddingStartTime?: string;
  preWeddingEndTime?: string;
  hasPreWedding?: boolean;
}

export function usePreWeddingCalendarSync({
  clientId,
  clientName,
  preWeddingDate,
  preWeddingStartTime,
  preWeddingEndTime,
  hasPreWedding
}: UsePreWeddingCalendarSyncProps) {
  const { addEvent, updateEvent, deleteEvent, getEventById } = useCalendarEvents();
  
  // Usar refs para evitar dependências problemáticas no useEffect
  const previousValues = useRef<{
    preWeddingDate: string | null;
    preWeddingStartTime?: string;
    preWeddingEndTime?: string;
    hasPreWedding?: boolean;
    clientName: string;
  }>({
    preWeddingDate: null,
    preWeddingStartTime: "",
    preWeddingEndTime: "",
    hasPreWedding: false,
    clientName: ""
  });
  
  const lastSyncTime = useRef<number>(0);
  const syncInProgress = useRef<boolean>(false);

  // Função para buscar evento existente manualmente
  const findExistingPreWeddingEvent = useCallback((searchClientId?: string) => {
    if (!searchClientId) return null;
    
    // Buscar pelo ID do evento armazenado no localStorage se disponível
    const storedEvents = localStorage.getItem("calendarEvents");
    if (storedEvents) {
      try {
        const events = JSON.parse(storedEvents);
        return events.find((event: CalendarEvent) => 
          event.type === 'pre-wedding' && event.clientId === searchClientId
        );
      } catch (error) {
        console.error("[PreWeddingSync] Erro ao buscar eventos do localStorage:", error);
      }
    }
    return null;
  }, []);

  // Função para criar chave de comparação
  const createComparisonKey = useCallback((data: any) => {
    return JSON.stringify({
      preWeddingDate: data.preWeddingDate,
      preWeddingStartTime: data.preWeddingStartTime,
      preWeddingEndTime: data.preWeddingEndTime,
      hasPreWedding: data.hasPreWedding,
      clientName: data.clientName
    });
  }, []);

  // Debounce para evitar múltiplas sincronizações
  const debouncedSync = useCallback(() => {
    const now = Date.now();
    if (now - lastSyncTime.current < 500 || syncInProgress.current) {
      console.log("[PreWeddingSync] Sync ignorada - debounce ou em progresso");
      return;
    }

    syncInProgress.current = true;
    lastSyncTime.current = now;

    try {
      const current = { preWeddingDate, preWeddingStartTime, preWeddingEndTime, hasPreWedding, clientName };
      const previous = previousValues.current;

      // Comparação profunda para detectar mudanças
      const currentKey = createComparisonKey(current);
      const previousKey = createComparisonKey(previous);

      console.log("[PreWeddingSync] Verificando mudanças:", {
        currentKey,
        previousKey,
        hasChanged: currentKey !== previousKey,
        clientId,
        preWeddingDate
      });

      if (currentKey === previousKey) {
        console.log("[PreWeddingSync] Nenhuma mudança detectada");
        return;
      }

      // Buscar evento existente
      const existingEvent = findExistingPreWeddingEvent(clientId);
      console.log("[PreWeddingSync] Evento existente encontrado:", existingEvent);

      // UPDATED LOGIC: Se hasPreWedding é false OU preWeddingDate é null/empty, remover o evento
      if (!hasPreWedding || !preWeddingDate || preWeddingDate.trim() === '') {
        if (existingEvent) {
          console.log("[PreWeddingSync] Removendo evento pré-wedding:", existingEvent.id);
          deleteEvent(existingEvent.id);
        }
      } else {
        // Criar ou atualizar o evento pré-wedding
        const eventData: CalendarEvent = {
          id: existingEvent?.id || uuidv4(),
          title: `Pré-Wedding - ${clientName}`,
          description: `Sessão de pré-wedding para ${clientName}`,
          date: preWeddingDate,
          startTime: preWeddingStartTime || "09:00",
          endTime: preWeddingEndTime || "10:00",
          type: 'pre-wedding',
          color: 'purple',
          clientId: clientId
        };

        console.log("[PreWeddingSync] Dados do evento:", eventData);

        if (existingEvent) {
          console.log("[PreWeddingSync] Atualizando evento existente");
          updateEvent(eventData);
        } else {
          console.log("[PreWeddingSync] Criando novo evento");
          addEvent(eventData);
        }
      }

      // Atualizar valores anteriores
      previousValues.current = { ...current };

    } catch (error) {
      console.error("[PreWeddingSync] Erro durante sincronização:", error);
    } finally {
      syncInProgress.current = false;
    }
  }, [
    clientId,
    clientName,
    preWeddingDate,
    preWeddingStartTime,
    preWeddingEndTime,
    hasPreWedding,
    addEvent,
    updateEvent,
    deleteEvent,
    findExistingPreWeddingEvent,
    createComparisonKey
  ]);

  useEffect(() => {
    // Only sync if we have essential data
    if (!clientName) {
      console.log("[PreWeddingSync] Sync ignorada - dados essenciais ausentes");
      return;
    }

    console.log("[PreWeddingSync] Iniciando sincronização com dados:", {
      clientId,
      clientName,
      preWeddingDate,
      hasPreWedding
    });
    
    // Usar setTimeout para debounce
    const timeoutId = setTimeout(debouncedSync, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [debouncedSync]);
}
