import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { DayView } from "@/components/calendar/DayView";
import { WeekView } from "@/components/calendar/WeekView";
import { cn } from "@/lib/utils";
import { ptBR } from "date-fns/locale";
import { Client } from "@/utils/types";
import { normalizeDate, stringToDate } from "@/utils/dates";

interface CalendarGridProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  view: "day" | "week" | "month";
  setView: (view: "day" | "week" | "month") => void;
  currentMonthYear: string;
  eventDates: Date[];
  clients: Client[];
  onClientClick: (clientId: string) => void;
  eventTypeFilter: string;
}

// Color per event category
function categoryColor(cat: string): string {
  const c = (cat || "").toLowerCase();
  if (c.includes("casamento")) return "bg-rose-400";
  if (c.includes("ensaio"))    return "bg-blue-400";
  if (c.includes("pre") || c.includes("pré")) return "bg-amber-400";
  if (c.includes("debutante")) return "bg-purple-400";
  if (c.includes("aniversar")) return "bg-green-400";
  return "bg-gray-400";
}

export function CalendarGrid({
  date,
  setDate,
  view,
  setView,
  currentMonthYear,
  clients,
  onClientClick,
  eventTypeFilter,
}: CalendarGridProps) {

  // Build a map: dateKey → array of clients on that day
  const clientsByDate = useMemo(() => {
    const map: Record<string, Client[]> = {};
    clients.forEach(c => {
      if (!c.weddingDate) return;
      // apply event type filter
      if (eventTypeFilter !== "all") {
        const cat = (c.eventCategory || "").toLowerCase();
        if (!cat.includes(eventTypeFilter.replace("_", " "))) return;
      }
      const key = normalizeDate(stringToDate(c.weddingDate) || new Date());
      if (!map[key]) map[key] = [];
      map[key].push(c);

      // also include pre-wedding date
      if (c.hasPreWedding && c.preWeddingDate) {
        const pk = normalizeDate(stringToDate(c.preWeddingDate) || new Date());
        if (!map[pk]) map[pk] = [];
        if (!map[pk].find(x => x.id === c.id)) map[pk].push(c);
      }
    });
    return map;
  }, [clients, eventTypeFilter]);

  // Custom day render: show colored dots + count badge
  const components = {
    DayContent: ({ date: d }: { date: Date }) => {
      const key = normalizeDate(d);
      const dayClients = clientsByDate[key] || [];
      const count = dayClients.length;
      return (
        <div className="relative flex flex-col items-center w-full">
          <span>{d.getDate()}</span>
          {count > 0 && (
            <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center max-w-[36px]">
              {dayClients.slice(0, 3).map((c, i) => (
                <span key={i} className={`w-1.5 h-1.5 rounded-full ${categoryColor(c.eventCategory)}`} />
              ))}
              {count > 3 && (
                <span className="text-[8px] text-gray-500 leading-none">+{count - 3}</span>
              )}
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <Card className="border-none shadow-sm bg-white">
      <CardContent className="p-0 rounded-md">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="text-xl font-medium text-orange-500">{currentMonthYear}</div>
          <div className="flex rounded-md overflow-hidden border divide-x">
            {(["month", "week", "day"] as const).map(v => (
              <Button
                key={v}
                variant={view === v ? "default" : "outline"}
                className={cn(
                  "rounded-none px-4 py-2 text-sm h-auto",
                  view === v ? "bg-slate-800 hover:bg-slate-700" : "bg-white hover:bg-gray-50"
                )}
                onClick={() => setView(v)}
              >
                {v === "month" ? "Mês" : v === "week" ? "Semana" : "Dia"}
              </Button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-3 flex-wrap px-4 pt-3 pb-1 text-xs text-gray-500">
          {[
            { label: "Casamento",   color: "bg-rose-400"   },
            { label: "Ensaio",      color: "bg-blue-400"   },
            { label: "Pré-Wedding", color: "bg-amber-400"  },
            { label: "Debutante",   color: "bg-purple-400" },
            { label: "Aniversário", color: "bg-green-400"  },
          ].map(l => (
            <span key={l.label} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${l.color}`} />
              {l.label}
            </span>
          ))}
        </div>

        {view === "month" && (
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={ptBR}
            className="mx-auto w-full pointer-events-auto"
            components={components}
          />
        )}

        {view === "week" && (
          <WeekView date={date || new Date()} clients={clients} onClientClick={onClientClick} />
        )}

        {view === "day" && (
          <DayView date={date || new Date()} clients={clients} onClientClick={onClientClick} />
        )}
      </CardContent>
    </Card>
  );
}
