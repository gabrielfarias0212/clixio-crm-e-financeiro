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

// Cores fixas para categorias conhecidas; hash para categorias customizadas
function categoryColorHex(cat: string): string {
  const c = (cat || "").toLowerCase();
  if (c.includes("casamento")) return "#fb7185";  // rose-400
  if (c.includes("ensaio"))    return "#60a5fa";  // blue-400
  if (c.includes("pre") || c.includes("pré")) return "#fbbf24"; // amber-400
  if (c.includes("debutante")) return "#c084fc";  // purple-400
  if (c.includes("aniversar")) return "#4ade80";  // green-400
  // Cor consistente por hash para categorias customizadas
  const palette = ["#f97316","#06b6d4","#8b5cf6","#ec4899","#14b8a6","#f59e0b","#6366f1","#84cc16"];
  let hash = 0;
  for (let i = 0; i < cat.length; i++) hash = (hash * 31 + cat.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length];
}

function isConfirmed(client: Client): boolean {
  return client.salesFunnelStage === "contrato_fechado" || client.salesFunnelStage === "projeto_finalizado";
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
        if ((c.eventCategory || "") !== eventTypeFilter) return;
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
              {dayClients.slice(0, 3).map((c, i) => {
                const hex = categoryColorHex(c.eventCategory);
                const confirmed = isConfirmed(c);
                return confirmed
                  ? <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: hex, display: "inline-block", flexShrink: 0 }} />
                  : <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", border: `2px solid ${hex}`, backgroundColor: "white", display: "inline-block", flexShrink: 0 }} />;
              })}
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
            { label: "Casamento",   hex: "#fb7185" },
            { label: "Ensaio",      hex: "#60a5fa" },
            { label: "Pré-Wedding", hex: "#fbbf24" },
            { label: "Debutante",   hex: "#c084fc" },
            { label: "Aniversário", hex: "#4ade80" },
          ].map(l => (
            <span key={l.label} className="flex items-center gap-1">
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: l.hex, display: "inline-block" }} />
              {l.label}
            </span>
          ))}
          <span className="flex items-center gap-1 border-l pl-3 border-gray-200">
            <span style={{ width: 8, height: 8, borderRadius: "50%", border: "2px solid #94a3b8", backgroundColor: "white", display: "inline-block" }} />
            Pré-agendamento (não fechado)
          </span>
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
