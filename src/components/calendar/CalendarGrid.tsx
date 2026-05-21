import { useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { DayView } from "@/components/calendar/DayView";
import { WeekView } from "@/components/calendar/WeekView";
import { ptBR } from "date-fns/locale";
import { Client, CalendarEvent } from "@/utils/types";
import { normalizeDate, stringToDate } from "@/utils/dates";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";

const C = {
  text:    "#1a1a1a",
  textSub: "#9A9590",
  divider: "#F0EDE8",
  itemBg:  "#FAFAF8",
  navy:    "#1E3A5F",
  navyBg:  "#E8EEF6",
  border:  "#E8E4DE",
  amber:   "#E8A838",
};

// Cores fixas para categorias conhecidas; hash para customizadas
function categoryColorHex(cat: string): string {
  const c = (cat || "").toLowerCase();
  if (c.includes("casamento")) return "#fb7185";
  if (c.includes("ensaio"))    return "#60a5fa";
  if (c.includes("pre") || c.includes("pré")) return "#fbbf24";
  if (c.includes("debutante")) return "#c084fc";
  if (c.includes("aniversar")) return "#4ade80";
  const palette = ["#f97316","#06b6d4","#8b5cf6","#ec4899","#14b8a6","#f59e0b","#6366f1","#84cc16"];
  let hash = 0;
  for (let i = 0; i < cat.length; i++) hash = (hash * 31 + cat.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length];
}

function isConfirmed(client: Client): boolean {
  return client.salesFunnelStage === "contrato_fechado" || client.salesFunnelStage === "projeto_finalizado";
}

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

const LEGEND = [
  { label: "Casamento",   hex: "#fb7185" },
  { label: "Ensaio",      hex: "#60a5fa" },
  { label: "Pré-Wedding", hex: "#fbbf24" },
  { label: "Debutante",   hex: "#c084fc" },
  { label: "Aniversário", hex: "#4ade80" },
  { label: "Personalizado", hex: "#3B82F6" },
];

const EVENT_COLOR_HEX: Record<string, string> = {
  blue:   "#3B82F6",
  green:  "#52C97A",
  red:    "#E05252",
  yellow: "#E8A838",
  purple: "#8B5CF6",
  gray:   "#9A9590",
};

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
  const clientsByDate = useMemo(() => {
    const map: Record<string, Client[]> = {};
    clients.forEach(c => {
      if (!c.weddingDate) return;
      if (eventTypeFilter !== "all" && (c.eventCategory || "") !== eventTypeFilter) return;
      const key = normalizeDate(stringToDate(c.weddingDate) || new Date());
      if (!map[key]) map[key] = [];
      map[key].push(c);
      if (c.hasPreWedding && c.preWeddingDate) {
        const pk = normalizeDate(stringToDate(c.preWeddingDate) || new Date());
        if (!map[pk]) map[pk] = [];
        if (!map[pk].find(x => x.id === c.id)) map[pk].push(c);
      }
    });
    return map;
  }, [clients, eventTypeFilter]);

  const components = {
    DayContent: ({ date: d }: { date: Date }) => {
      const key = normalizeDate(d);
      const dayClients = clientsByDate[key] || [];
      const count = dayClients.length;
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
          <span>{d.getDate()}</span>
          {count > 0 && (
            <div style={{ display: "flex", gap: 2, marginTop: 2, flexWrap: "wrap", justifyContent: "center", maxWidth: 36 }}>
              {dayClients.slice(0, 3).map((c, i) => {
                const hex = categoryColorHex(c.eventCategory);
                const confirmed = isConfirmed(c);
                return confirmed
                  ? <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: hex, display: "inline-block", flexShrink: 0 }} />
                  : <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", border: `2px solid ${hex}`, backgroundColor: "white", display: "inline-block", flexShrink: 0 }} />;
              })}
              {count > 3 && (
                <span style={{ fontSize: 8, color: C.textSub, lineHeight: 1 }}>+{count - 3}</span>
              )}
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div style={{
      background: "#FFFFFF",
      borderRadius: 14,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 6px 20px rgba(0,0,0,0.07)",
      overflow: "hidden",
    }}>
      {/* Header bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 18px", borderBottom: `1px solid ${C.divider}`,
      }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: C.amber }}>{currentMonthYear}</span>

        {/* View toggle */}
        <div style={{ display: "flex", border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
          {(["month", "week", "day"] as const).map((v, i) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: "6px 14px", border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 600,
                background: view === v ? C.navy : C.itemBg,
                color: view === v ? "#FFFFFF" : C.textSub,
                borderRight: i < 2 ? `1px solid ${C.border}` : "none",
              }}
            >
              {v === "month" ? "Mês" : v === "week" ? "Semana" : "Dia"}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const, padding: "10px 18px 4px", borderBottom: `1px solid ${C.divider}` }}>
        {LEGEND.map(l => (
          <span key={l.label} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: C.textSub }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: l.hex, display: "inline-block" }} />
            {l.label}
          </span>
        ))}
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: C.textSub, paddingLeft: 10, borderLeft: `1px solid ${C.divider}` }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", border: "2px solid #94a3b8", backgroundColor: "white", display: "inline-block" }} />
          Pré-agendamento
        </span>
      </div>

      {/* Calendar content */}
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
    </div>
  );
}
