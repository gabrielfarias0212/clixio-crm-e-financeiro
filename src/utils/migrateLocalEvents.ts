
import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent } from '@/utils/types';

/**
 * Migrate events from localStorage to Supabase database
 * This should be run once to transfer any existing events
 */
export async function migrateLocalEventsToDatabase(): Promise<boolean> {
  try {
    // Check if migration has already happened
    const migrationDone = localStorage.getItem('calendarEventsMigrated');
    if (migrationDone === 'true') {
      return true;
    }

    // Get events from localStorage
    const storedEvents = localStorage.getItem("calendarEvents");
    if (!storedEvents) {
      // No events to migrate
      localStorage.setItem('calendarEventsMigrated', 'true');
      return true;
    }

    // Parse events
    const events = JSON.parse(storedEvents);
    if (!Array.isArray(events) || events.length === 0) {
      localStorage.setItem('calendarEventsMigrated', 'true');
      return true;
    }

    // Format events for database insertion
    const formattedEvents = events.map((event: any) => {
      return {
        id: event.id,
        title: event.title,
        description: event.description || '',
        date: event.date,
        start_time: event.startTime,
        end_time: event.endTime,
        type: event.type,
        color: event.color,
        client_id: event.clientId
      };
    });

    // Insert events to database
    const { error } = await supabase
      .from('calendar_events')
      .upsert(formattedEvents, { onConflict: 'id' });

    if (error) {
      console.error('Error migrating events to database:', error);
      return false;
    }

    // Mark migration as complete
    localStorage.setItem('calendarEventsMigrated', 'true');
    return true;
  } catch (error) {
    console.error('Exception migrating events to database:', error);
    return false;
  }
}
