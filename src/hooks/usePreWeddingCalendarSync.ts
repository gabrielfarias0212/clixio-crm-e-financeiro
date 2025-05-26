
import { useEffect, useRef } from "react";
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
  const { events, addEvent, updateEvent, deleteEvent } = useCalendarEvents();
  const previousValues = useRef<{
    preWeddingDate: string | null;
    preWeddingStartTime?: string;
    preWeddingEndTime?: string;
    hasPreWedding?: boolean;
  }>({
    preWeddingDate: null,
    preWeddingStartTime: "",
    preWeddingEndTime: "",
    hasPreWedding: false
  });

  useEffect(() => {
    // Only sync if we have a clientId (for existing clients) or if it's a form with data
    if (!clientId && !preWeddingDate) return;

    const prev = previousValues.current;
    const current = { preWeddingDate, preWeddingStartTime, preWeddingEndTime, hasPreWedding };

    // Check if anything changed
    const hasChanged = 
      prev.preWeddingDate !== current.preWeddingDate ||
      prev.preWeddingStartTime !== current.preWeddingStartTime ||
      prev.preWeddingEndTime !== current.preWeddingEndTime ||
      prev.hasPreWedding !== current.hasPreWedding;

    if (!hasChanged) return;

    // Find existing pre-wedding event for this client
    const existingEvent = events.find(event => 
      event.type === 'pre-wedding' && event.clientId === clientId
    );

    // If hasPreWedding is false or preWeddingDate is null, remove the event
    if (!hasPreWedding || !preWeddingDate) {
      if (existingEvent) {
        deleteEvent(existingEvent.id);
      }
    } else {
      // Create or update the pre-wedding event
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

      if (existingEvent) {
        updateEvent(eventData);
      } else {
        addEvent(eventData);
      }
    }

    // Update previous values
    previousValues.current = { ...current };
  }, [
    clientId,
    clientName,
    preWeddingDate,
    preWeddingStartTime,
    preWeddingEndTime,
    hasPreWedding,
    events,
    addEvent,
    updateEvent,
    deleteEvent
  ]);
}
