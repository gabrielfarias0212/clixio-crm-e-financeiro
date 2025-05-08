
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
    // Convert camelCase object to snake_case for database
    const dbEvent = {
      title: event.title,
      description: event.description || '',
      date: event.date,
      start_time: event.startTime,
      end_time: event.endTime,
      type: event.type,
      color: event.color,
      client_id: event.clientId
    };

    const { data, error } = await supabase
      .from('calendar_events')
      .insert([dbEvent])
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
    // Convert camelCase object to snake_case for database
    const dbUpdates: any = {};
    
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
    if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.clientId !== undefined) dbUpdates.client_id = updates.clientId;

    const { data, error } = await supabase
      .from('calendar_events')
      .update(dbUpdates)
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
