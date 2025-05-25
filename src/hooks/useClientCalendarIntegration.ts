
import { useCallback } from 'react';
import { useCalendarEvents } from './useCalendarEvents';
import { Client } from '@/utils/types';
import { v4 as uuidv4 } from 'uuid';

export function useClientCalendarIntegration() {
  const { addEvent, updateEvent, deleteEvent, events } = useCalendarEvents();

  // Find existing pre-wedding event for a client
  const findPreWeddingEvent = useCallback((clientId: string) => {
    return events.find(event => 
      event.clientId === clientId && 
      event.type === 'pre-wedding'
    );
  }, [events]);

  // Create or update pre-wedding event
  const syncPreWeddingEvent = useCallback((
    client: Client,
    preWeddingDate: string | null,
    preWeddingStartTime?: string,
    preWeddingEndTime?: string
  ) => {
    const existingEvent = findPreWeddingEvent(client.id);

    if (!preWeddingDate) {
      // If no date is set, remove existing event
      if (existingEvent) {
        deleteEvent(existingEvent.id);
      }
      return;
    }

    const eventData = {
      id: existingEvent?.id || uuidv4(),
      clientId: client.id,
      title: `Pré-Wedding - ${client.name}`,
      description: `Ensaio pré-wedding com ${client.name}${client.coupleName ? ` e ${client.coupleName}` : ''}`,
      date: preWeddingDate,
      startTime: preWeddingStartTime || '09:00',
      endTime: preWeddingEndTime || '12:00',
      type: 'pre-wedding' as const,
      color: '#10b981' // Green color for pre-wedding events
    };

    if (existingEvent) {
      updateEvent(eventData);
    } else {
      addEvent(eventData);
    }
  }, [addEvent, updateEvent, deleteEvent, findPreWeddingEvent]);

  return {
    syncPreWeddingEvent,
    findPreWeddingEvent
  };
}
