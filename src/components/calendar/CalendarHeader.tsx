import React from "react";
import { CalendarPlus, CalendarCheck, LayoutGrid, Tag } from "lucide-react";
import { useEventCategories } from "@/hooks/useEventCategories";

const C = {
  text:    "#1a1a1a",
  textSub: "#9A9590",
  divider: "#F0EDE8",
  itemBg:  "#FAFAF8",
  navy:    "#1E3A5F",
  navyBg:  "#E8EEF6",
  border:  "#E8E4DE",
  amber:   "#E8A838",
  amberBg: "#FEF3DC",
};

interface CalendarHeaderProps {
  currentMonthYear: string;
  view: "day" | "week" | "month";
  setView: (view: "day" | "week" | "month") => void;
  setAddEventOpen: (open: boolean) => void;
  onGoToToday: () => void;
  eventTypeFilter: string;
  setEventTypeFilter: (f: string) => void;
}

export function CalendarHeader({
  currentMonthYear,
  view,
  setView,
  setAddEventOpen,
  onGoToToday,
  eventTypeFilter,
  setEventTypeFilter,
}: CalendarHeaderProps) {
  const { categories } = useEventCategories();

  return (
    <div style={{
      background: "#FFFFFF",
      borderRadius: 14,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 6px 20px rgba(0,0,0,0.07)",
      padding: "18px 22px",
      marginBottom: 20,
      display: "flex",
      flexDirection: "column" as const,
      gap: 14,
    }}>
      {/* Top row: title + buttons */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 10 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>
          Calendário de Eventos
        </h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onGoToToday}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "8px 14px", borderRadius: 8,
              border: `1px solid ${C.border}`, background: C.itemBg,
              fontSize: 12, fontWeight: 600, color: C.text, cursor: "pointer",
            }}
          >
            <CalendarCheck style={{ width: 13, height: 13, color: C.textSub }} />
            Hoje
          </button>
          <button
            onClick={() => setAddEventOpen(true)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "8px 16px", borderRadius: 8,
              border: "none", background: C.navy,
              fontSize: 12, fontWeight: 700, color: "#FFFFFF", cursor: "pointer",
            }}
          >
            <CalendarPlus style={{ width: 13, height: 13 }} />
            Cadastrar Evento
          </button>
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
        {/* Todos */}
        <button
          onClick={() => setEventTypeFilter("all")}
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "5px 12px", borderRadius: 999,
            fontSize: 11, fontWeight: 600, cursor: "pointer",
            border: eventTypeFilter === "all" ? `1px solid ${C.navy}40` : `1px solid ${C.border}`,
            background: eventTypeFilter === "all" ? C.navyBg : C.itemBg,
            color: eventTypeFilter === "all" ? C.navy : C.textSub,
          }}
        >
          <LayoutGrid style={{ width: 11, height: 11 }} />
          Todos
        </button>

        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setEventTypeFilter(cat.name)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "5px 12px", borderRadius: 999,
              fontSize: 11, fontWeight: 600, cursor: "pointer",
              border: eventTypeFilter === cat.name ? `1px solid ${C.navy}40` : `1px solid ${C.border}`,
              background: eventTypeFilter === cat.name ? C.navyBg : C.itemBg,
              color: eventTypeFilter === cat.name ? C.navy : C.textSub,
            }}
          >
            <Tag style={{ width: 10, height: 10 }} />
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
