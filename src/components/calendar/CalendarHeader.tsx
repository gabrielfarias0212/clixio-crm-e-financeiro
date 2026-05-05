import React from "react";
import { Button } from "@/components/ui/button";
import { CalendarPlus, CalendarCheck, Heart, Camera, Sunset, Star, Cake, LayoutGrid } from "lucide-react";

interface CalendarHeaderProps {
  currentMonthYear: string;
  view: "day" | "week" | "month";
  setView: (view: "day" | "week" | "month") => void;
  setAddEventOpen: (open: boolean) => void;
  onGoToToday: () => void;
  eventTypeFilter: string;
  setEventTypeFilter: (f: string) => void;
}

const EVENT_TYPE_OPTIONS: { value: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "all",         label: "Todos",       icon: LayoutGrid },
  { value: "casamento",   label: "Casamento",   icon: Heart      },
  { value: "ensaio",      label: "Ensaio",      icon: Camera     },
  { value: "pre_wedding", label: "Pré-Wedding", icon: Sunset     },
  { value: "debutante",   label: "Debutante",   icon: Star       },
  { value: "aniversario", label: "Aniversário", icon: Cake       },
];

export function CalendarHeader({ 
  currentMonthYear, 
  view, 
  setView,
  setAddEventOpen,
  onGoToToday,
  eventTypeFilter,
  setEventTypeFilter,
}: CalendarHeaderProps) {
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

      {/* Filter by event type */}
      <div className="flex gap-1.5 flex-wrap">
        {EVENT_TYPE_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setEventTypeFilter(opt.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              eventTypeFilter === opt.value
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <opt.icon className="h-3 w-3" />
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
