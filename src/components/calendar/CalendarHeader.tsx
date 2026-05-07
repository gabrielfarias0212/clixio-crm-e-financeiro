import React from "react";
import { Button } from "@/components/ui/button";
import { CalendarPlus, CalendarCheck, LayoutGrid, Tag } from "lucide-react";
import { useEventCategories } from "@/hooks/useEventCategories";

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
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <h1 className="text-2xl font-bold">Calendário de Eventos</h1>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="bg-white border-gray-200 hover:bg-gray-50"
            onClick={onGoToToday}
          >
            <CalendarCheck className="mr-2 h-4 w-4 text-gray-500" />
            Hoje
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-white border-gray-200 hover:bg-gray-50"
            onClick={() => setAddEventOpen(true)}
          >
            <CalendarPlus className="mr-2 h-4 w-4 text-orange-500" />
            Cadastrar Evento
          </Button>
        </div>
      </div>

      {/* Filter pills — dinâmico via banco */}
      <div className="flex gap-1.5 flex-wrap">
        {/* Todos */}
        <button
          onClick={() => setEventTypeFilter("all")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            eventTypeFilter === "all"
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          }`}
        >
          <LayoutGrid className="h-3 w-3" />
          Todos
        </button>

        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setEventTypeFilter(cat.name)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              eventTypeFilter === cat.name
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Tag className="h-3 w-3" />
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
