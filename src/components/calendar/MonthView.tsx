
import React from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addDays, isSameMonth, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarEvent } from "@/utils/types";
import { cn } from "@/lib/utils";

interface MonthViewProps {
  date: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date | null) => void;
  selectedDate: Date | null;
  loading: boolean;
}

export function MonthView({ date, events, onDateClick, selectedDate, loading }: MonthViewProps) {
  // Generate days for the calendar
  const firstDayOfMonth = startOfMonth(date);
  const lastDayOfMonth = endOfMonth(date);
  const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });
  
  // Add days from previous and next month to fill the weeks
  const startDay = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const endDay = 6 - lastDayOfMonth.getDay();
  
  // Fix the reverse error by creating an array of days properly
  const prevMonthDays = Array.from({ length: startDay }, (_, i) => 
    addDays(firstDayOfMonth, -(startDay - i))
  );
  
  const nextMonthDays = Array.from({ length: endDay }, (_, i) => 
    addDays(lastDayOfMonth, i + 1)
  );
  
  // Combine all days
  const allDays = [...prevMonthDays, ...daysInMonth, ...nextMonthDays];
  
  // Function to get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return isSameDay(eventDate, day);
    });
  };
  
  if (loading) {
    return (
      <div className="p-6 text-center">
        <p>Carregando calendário...</p>
      </div>
    );
  }
  
  // Render calendar
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Calendar header with weekday names */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 border-b">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day, index) => (
          <div key={index} className="py-2 text-center text-sm font-medium">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {daysInMonth.map((day, index) => {
          const eventsForDay = getEventsForDay(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, date);
          const dayIsToday = isToday(day);
          
          return (
            <div 
              key={index}
              className={cn(
                "min-h-[100px] bg-white p-1",
                !isCurrentMonth && "bg-gray-50 text-gray-400",
                isSelected && "bg-orange-50",
                "hover:bg-orange-50 cursor-pointer"
              )}
              onClick={() => onDateClick(day)}
            >
              <div className="flex justify-between items-start">
                <span className={cn(
                  "inline-flex items-center justify-center w-6 h-6 text-sm rounded-full",
                  dayIsToday ? "bg-orange-500 text-white" : "text-gray-700"
                )}>
                  {format(day, "d")}
                </span>
              </div>
              
              {/* Events for this day */}
              <div className="mt-1 space-y-1 max-h-[80px] overflow-y-auto">
                {eventsForDay.map((event, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "text-xs px-1 py-0.5 rounded truncate",
                      event.type === 'client' && "bg-purple-100 text-purple-800",
                      event.type === 'meeting' && "bg-blue-100 text-blue-800",
                      event.type === 'delivery' && "bg-green-100 text-green-800",
                      event.type === 'photoshoot' && "bg-amber-100 text-amber-800"
                    )}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
