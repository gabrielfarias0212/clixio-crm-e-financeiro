import { useState, useEffect, useMemo } from 'react';
import { addMonths, subMonths, format, startOfMonth, 
  addWeeks, subWeeks, addDays, isSameDay } from 'date-fns';
import { useCalendarEvents } from './useCalendarEvents';
import { CalendarEvent, CalendarViewType } from '@/utils/types';
import { useClients } from '@/contexts/ClientsContext';

export function useCalendarPage() {
  const [view, setView] = useState<CalendarViewType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const { clients } = useClients();
  const { events, loading } = useCalendarEvents(clients);
  
  // Reset selectedDate when view changes
  useEffect(() => {
    setSelectedDate(null);
  }, [view]);
  
  // Navigation functions
  const goToPrevious = () => {
    setCurrentDate(prevDate => {
      switch(view) {
        case 'month': 
          return subMonths(prevDate, 1);
        case 'week': 
          return subWeeks(prevDate, 1);
        case 'day': 
          return subDays(prevDate, 1);
        default: 
          return prevDate;
      }
    });
  };
  
  const goToNext = () => {
    setCurrentDate(prevDate => {
      switch(view) {
        case 'month': 
          return addMonths(prevDate, 1);
        case 'week': 
          return addWeeks(prevDate, 1);
        case 'day': 
          return addDays(prevDate, 1);
        default: 
          return prevDate;
      }
    });
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
    // If we're in day view, also select today
    if (view === 'day') {
      setSelectedDate(new Date());
    }
  };
  
  const handleDateSelect = (date: Date | null) => {
    setSelectedDate(date);
    if (date && view === 'month') {
      // When selecting a date in month view, we want to keep the month view
      // but update the currentDate to include the selected month
      setCurrentDate(startOfMonth(date));
    } else if (date) {
      // In other views, when selecting a date, update currentDate to that date
      setCurrentDate(date);
    }
  };
  
  // Filter events for the selected date
  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return isSameDay(eventDate, selectedDate);
    });
  }, [selectedDate, events]);
  
  return {
    view,
    setView,
    currentDate,
    selectedDate,
    events,
    loading,
    goToPrevious,
    goToNext,
    goToToday,
    handleDateSelect,
    selectedEvents
  };
}
