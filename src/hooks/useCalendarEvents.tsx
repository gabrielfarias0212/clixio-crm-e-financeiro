
import { useState, useEffect, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Client, CalendarEvent } from '@/utils/types';
import { supabase } from '@/integrations/supabase/client';

export function useCalendarEvents(clients: Client[] = []) {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  
  // Fetch events from database
  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error } = await supabase
          .from('calendar_events')
          .select('*');
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setEvents(data as CalendarEvent[]);
        }
      } catch (error) {
        console.error('Error fetching calendar events:', error);
      } finally {
        setLoading(false);
      }
    }
    
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
            type: 'client',
            clientId: client.id,
            description: `Casamento de ${client.name}`,
            startTime: client.weddingStartTime || '10:00',
            endTime: client.weddingEndTime || '18:00',
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
            description: `Reunião com ${client.name}`,
            startTime: '09:00',
            endTime: '10:00',
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
      const { data, error } = await supabase
        .from('calendar_events')
        .insert(eventData)
        .select()
        .single();
        
      if (error) throw error;
      
      setEvents(prev => [...prev, data as CalendarEvent]);
      return data;
    } catch (error) {
      console.error('Error adding calendar event:', error);
      throw error;
    }
  };
  
  const updateEvent = async (eventData: CalendarEvent) => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .update(eventData)
        .eq('id', eventData.id)
        .select()
        .single();
        
      if (error) throw error;
      
      setEvents(prev => prev.map(e => e.id === eventData.id ? data as CalendarEvent : e));
      return data;
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
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*');
        
      if (error) throw error;
      
      if (data) {
        setEvents(data as CalendarEvent[]);
      }
    } catch (error) {
      console.error('Error refreshing calendar events:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return { 
    events: allEvents, 
    loading,
    addEvent,
    updateEvent,
    deleteEvent,
    refreshEvents
  };
}
