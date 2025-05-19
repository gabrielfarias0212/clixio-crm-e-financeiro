
import { useState, useEffect, useMemo } from 'react';
import { Client, CalendarEvent } from '@/utils/types';
import { supabase } from '@/integrations/supabase/client';

// Helper function to convert database event to frontend format
const mapDatabaseEventToCalendarEvent = (dbEvent: any): CalendarEvent => {
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    description: dbEvent.description || '',
    date: dbEvent.date,
    startTime: dbEvent.start_time, // Map to our frontend property
    endTime: dbEvent.end_time,     // Map to our frontend property
    start_time: dbEvent.start_time, // Keep original for database compatibility
    end_time: dbEvent.end_time,     // Keep original for database compatibility
    type: dbEvent.type as any,      // Cast to our EventType
    color: dbEvent.color,
    clientId: dbEvent.client_id,    // Map to our frontend property
    client_id: dbEvent.client_id    // Keep original for database compatibility
  };
};

// Helper function to convert frontend event to database format
const mapCalendarEventToDatabase = (event: Omit<CalendarEvent, 'id'>): any => {
  return {
    title: event.title,
    description: event.description,
    date: event.date,
    start_time: event.startTime || event.start_time,
    end_time: event.endTime || event.end_time,
    type: event.type,
    color: event.color,
    client_id: event.clientId || event.client_id
  };
};

export function useCalendarEvents(clients: Client[] = []) {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch events from database
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*');
        
      if (error) {
        throw error;
      }
      
      if (data) {
        // Map database events to our frontend format
        const mappedEvents = data.map(mapDatabaseEventToCalendarEvent);
        setEvents(mappedEvents);
      } else {
        // If no data, set empty array to prevent loading state from hanging
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      setError(error as Error);
      // Set empty events array to prevent the loading state from hanging
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchEvents();
  }, []);
  
  // Convert clients to calendar events format
  const clientEvents = useMemo(() => {
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
            clientId: client.id,
            client_id: client.id,
            description: `Casamento de ${client.name}`,
            startTime: client.weddingStartTime || '10:00',
            endTime: client.weddingEndTime || '18:00',
            start_time: client.weddingStartTime || '10:00',
            end_time: client.weddingEndTime || '18:00',
            color: 'purple'
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
            clientId: client.id,
            client_id: client.id,
            description: `Reunião com ${client.name}`,
            startTime: '09:00',
            endTime: '10:00',
            start_time: '09:00',
            end_time: '10:00',
            color: 'blue'
          });
        } catch (error) {
          console.error(`Error parsing meeting date for client ${client.id}:`, error);
        }
      }
    });
    
    return eventsList;
  }, [clients]);
  
  // Combine database events and client events
  const allEvents = useMemo(() => {
    return [...events, ...clientEvents];
  }, [events, clientEvents]);
  
  // CRUD operations for events
  const addEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    try {
      // Convert to database format before inserting
      const dbEventData = mapCalendarEventToDatabase(eventData);
      
      const { data, error } = await supabase
        .from('calendar_events')
        .insert(dbEventData)
        .select()
        .single();
        
      if (error) throw error;
      
      // Convert back to frontend format for state update
      const newEvent = mapDatabaseEventToCalendarEvent(data);
      setEvents(prev => [...prev, newEvent]);
      return newEvent;
    } catch (error) {
      console.error('Error adding calendar event:', error);
      throw error;
    }
  };
  
  const updateEvent = async (eventData: CalendarEvent) => {
    try {
      // Convert to database format before updating
      const dbEventData = mapCalendarEventToDatabase(eventData);
      
      const { data, error } = await supabase
        .from('calendar_events')
        .update(dbEventData)
        .eq('id', eventData.id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Convert back to frontend format for state update
      const updatedEvent = mapDatabaseEventToCalendarEvent(data);
      setEvents(prev => prev.map(e => e.id === eventData.id ? updatedEvent : e));
      return updatedEvent;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  };
  
  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId);
        
      if (error) throw error;
      
      setEvents(prev => prev.filter(e => e.id !== eventId));
      return true;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  };
  
  const refreshEvents = async () => {
    return fetchEvents();
  };
  
  return { 
    events: allEvents, 
    loading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    refreshEvents
  };
}
