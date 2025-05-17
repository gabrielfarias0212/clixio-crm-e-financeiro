
import Layout from "@/components/Layout";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { MonthView } from "@/components/calendar/MonthView";
import { WeekView } from "@/components/calendar/WeekView";
import { DayView } from "@/components/calendar/DayView";
import { DayEventsSidebar } from "@/components/calendar/DayEventsSidebar";
import { useCalendarPage } from "@/hooks/useCalendarPage";

export default function Calendar() {
  const {
    view,
    currentDate,
    selectedDate,
    events,
    loading,
    setView,
    goToToday,
    goToPrevious,
    goToNext,
    handleDateSelect,
    selectedEvents
  } = useCalendarPage();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <CalendarHeader 
          view={view}
          currentDate={currentDate}
          onViewChange={setView}
          onTodayClick={goToToday}
          onPrevClick={goToPrevious}
          onNextClick={goToNext}
        />
        
        <div className="mt-6 flex">
          <div className="flex-1 border rounded-lg bg-card shadow-sm overflow-hidden">
            {view === 'month' && (
              <MonthView 
                currentDate={currentDate}
                events={events}
                onSelectDate={handleDateSelect}
                selectedDate={selectedDate}
                loading={loading}
              />
            )}
            {view === 'week' && (
              <WeekView 
                currentDate={currentDate}
                events={events}
                onSelectDate={handleDateSelect}
                selectedDate={selectedDate}
                loading={loading}
              />
            )}
            {view === 'day' && (
              <DayView 
                currentDate={selectedDate || currentDate}
                events={events}
                loading={loading}
              />
            )}
          </div>
          
          {selectedDate && (
            <DayEventsSidebar 
              date={selectedDate} 
              events={selectedEvents}
              onClose={() => handleDateSelect(null)}
              loading={loading}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
