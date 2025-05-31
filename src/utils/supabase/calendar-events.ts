
import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent } from '../types';
import { formatDateForSupabase } from './base';

export const fetchCalendarEvents = async (): Promise<CalendarEvent[]> => {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }

    return data ? data.map(parseCalendarEvent) : [];
  } catch (error) {
    console.error('Exception fetching calendar events:', error);
    return [];
  }
};

export const createCalendarEvent = async (eventData: CalendarEvent): Promise<CalendarEvent | null> => {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        id: eventData.id,
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        start_time: eventData.startTime,
        end_time: eventData.endTime,
        type: eventData.type,
        color: eventData.color,
        client_id: eventData.clientId || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating calendar event:', error);
      return null;
    }

    return data ? parseCalendarEvent(data) : null;
  } catch (error) {
    console.error('Exception creating calendar event:', error);
    return null;
  }
};

export const updateCalendarEvent = async (eventData: CalendarEvent): Promise<CalendarEvent | null> => {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .update({
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        start_time: eventData.startTime,
        end_time: eventData.endTime,
        type: eventData.type,
        color: eventData.color,
        client_id: eventData.clientId || null
      })
      .eq('id', eventData.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating calendar event:', error);
      return null;
    }

    return data ? parseCalendarEvent(data) : null;
  } catch (error) {
    console.error('Exception updating calendar event:', error);
    return null;
  }
};

export const deleteCalendarEvent = async (eventId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('Error deleting calendar event:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception deleting calendar event:', error);
    return false;
  }
};

// Helper function to parse calendar event data
const parseCalendarEvent = (data: any): CalendarEvent => {
  return {
    id: data.id,
    title: data.title,
    description: data.description || '',
    date: data.date,
    startTime: data.start_time,
    endTime: data.end_time,
    type: data.type,
    color: data.color,
    clientId: data.client_id
  };
};
