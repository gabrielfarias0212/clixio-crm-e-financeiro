
import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent } from '@/utils/types';

/**
 * Fetch all calendar events from the database
 */
export const fetchCalendarEvents = async (): Promise<CalendarEvent[]> => {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*');

    if (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }

    return data.map(parseCalendarEvent);
  } catch (error) {
    console.error('Exception fetching calendar events:', error);
    return [];
  }
};

/**
 * Create a new calendar event
 */
export const createCalendarEvent = async (event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent | null> => {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert([event])
      .select()
      .single();

    if (error) {
      console.error('Error creating calendar event:', error);
      return null;
    }

    return parseCalendarEvent(data);
  } catch (error) {
    console.error('Exception creating calendar event:', error);
    return null;
  }
};

/**
 * Update an existing calendar event
 */
export const updateCalendarEvent = async (eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null> => {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .update(updates)
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      console.error('Error updating calendar event:', error);
      return null;
    }

    return parseCalendarEvent(data);
  } catch (error) {
    console.error('Exception updating calendar event:', error);
    return null;
  }
};

/**
 * Delete an existing calendar event
 */
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

/**
 * Parse a calendar event from the database
 */
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
    clientId: data.client_id || undefined
  };
};
