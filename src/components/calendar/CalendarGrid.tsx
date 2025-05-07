
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { DayView } from "@/components/calendar/DayView";
import { WeekView } from "@/components/calendar/WeekView";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Client } from "@/utils/types";

interface CalendarGridProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  view: "day" | "week" | "month";
  setView: (view: "day" | "week" | "month") => void;
  currentMonthYear: string;
  eventDates: Date[];
  clients: Client[];
  onClientClick: (clientId: string) => void;
}

export function CalendarGrid({
  date,
  setDate,
  view,
  setView,
  currentMonthYear,
  eventDates,
  clients,
  onClientClick
}: CalendarGridProps) {
  // Create modifiers styles for days with events
  const eventDayStyle = {
    backgroundColor: "rgb(254, 240, 229)",  // Lighter orange background
    color: "rgb(234, 88, 12)",              // Darker orange text
    fontWeight: "bold"
  } as const;

  return (
    <Card className="border-none shadow-sm bg-white">
      <CardContent className="p-0 rounded-md">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="text-xl font-medium text-orange-500">
            {currentMonthYear}
          </div>
          
          <div className="flex rounded-md overflow-hidden border divide-x">
            <Button 
              variant={view === "month" ? "default" : "outline"} 
              className={cn(
                "rounded-none px-4 py-2 text-sm h-auto", 
                view === "month" ? "bg-slate-800 hover:bg-slate-700" : "bg-white hover:bg-gray-50"
              )}
              onClick={() => setView("month")}
            >
              Mês
            </Button>
            <Button 
              variant={view === "week" ? "default" : "outline"} 
              className={cn(
                "rounded-none px-4 py-2 text-sm h-auto", 
                view === "week" ? "bg-slate-800 hover:bg-slate-700" : "bg-white hover:bg-gray-50"
              )}
              onClick={() => setView("week")}
            >
              Semana
            </Button>
            <Button 
              variant={view === "day" ? "default" : "outline"} 
              className={cn(
                "rounded-none px-4 py-2 text-sm h-auto", 
                view === "day" ? "bg-slate-800 hover:bg-slate-700" : "bg-white hover:bg-gray-50"
              )}
              onClick={() => setView("day")}
            >
              Dia
            </Button>
          </div>
        </div>
        
        {view === "month" && (
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="mx-auto w-full pointer-events-auto"
            modifiers={{
              booked: eventDates
            }}
            modifiersStyles={{
              booked: eventDayStyle
            }}
          />
        )}
        
        {view === "week" && (
          <WeekView 
            date={date || new Date()}
            clients={clients}
            onClientClick={onClientClick}
          />
        )}
        
        {view === "day" && (
          <DayView 
            date={date || new Date()} 
            clients={clients}
            onClientClick={onClientClick}
          />
        )}
      </CardContent>
    </Card>
  );
}
