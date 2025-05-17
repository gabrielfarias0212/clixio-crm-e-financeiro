
import { useState, useEffect, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Client, CalendarEvent } from '@/utils/types';

export function useCalendarEvents(clients: Client[]) {
  const [loading, setLoading] = useState(true);
  
  // Convert clients to calendar events format
  const events = useMemo(() => {
    if (!clients || !clients.length) return [];
    
    const eventsList: CalendarEvent[] = [];
    
    clients.forEach(client => {
      // Only add clients with wedding dates
      if (client.weddingDate) {
        try {
          // Create event from wedding date
          eventsList.push({
            id: `wedding-${client.id}`,
            title: `Casamento: ${client.name}`,
            date: client.weddingDate,
            type: 'wedding',
            clientId: client.id
          });
        } catch (error) {
          console.error(`Error parsing wedding date for client ${client.id}:`, error);
        }
      }
      
      // Add meeting dates if available
      if (client.meetingDate) {
        try {
          eventsList.push({
            id: `meeting-${client.id}`,
            title: `Reunião: ${client.name}`,
            date: client.meetingDate,
            type: 'meeting',
            clientId: client.id
          });
        } catch (error) {
          console.error(`Error parsing meeting date for client ${client.id}:`, error);
        }
      }
    });
    
    return eventsList;
  }, [clients]);
  
  // Update loading state
  useEffect(() => {
    setLoading(false);
  }, [clients]);
  
  return { events, loading };
}
