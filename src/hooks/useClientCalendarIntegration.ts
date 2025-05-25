
import { useCallback } from 'react';
import { useCalendarEvents } from './useCalendarEvents';
import { Client } from '@/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { dateToString, stringToDate } from '@/utils/dates';

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
    console.log('Syncing pre-wedding event:', { clientId: client.id, preWeddingDate, preWeddingStartTime, preWeddingEndTime });
    
    const existingEvent = findPreWeddingEvent(client.id);
    console.log('Existing event found:', existingEvent);

    if (!preWeddingDate) {
      // If no date is set, remove existing event
      if (existingEvent) {
        console.log('Removing existing pre-wedding event');
        deleteEvent(existingEvent.id);
      }
      return;
    }

    // Convert date if it's in DD/MM/YYYY format to ensure proper handling
    let formattedDate = preWeddingDate;
    const dateObj = stringToDate(preWeddingDate);
    if (dateObj) {
      formattedDate = dateToString(dateObj);
    }

    const eventData = {
      id: existingEvent?.id || uuidv4(),
      clientId: client.id,
      title: `Pré-Wedding - ${client.name}`,
      description: `Ensaio pré-wedding com ${client.name}${client.coupleName ? ` e ${client.coupleName}` : ''}`,
      date: formattedDate,
      startTime: preWeddingStartTime || '09:00',
      endTime: preWeddingEndTime || '12:00',
      type: 'pre-wedding' as const,
      color: '#10b981' // Green color for pre-wedding events
    };

    console.log('Event data to save:', eventData);

    if (existingEvent) {
      console.log('Updating existing event');
      updateEvent(eventData);
    } else {
      console.log('Adding new event');
      addEvent(eventData);
    }
  }, [addEvent, updateEvent, deleteEvent, findPreWeddingEvent]);

  return {
    syncPreWeddingEvent,
    findPreWeddingEvent
  };
}
