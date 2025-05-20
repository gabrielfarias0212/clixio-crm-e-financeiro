
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarHeaderProps {
  currentMonthYear: string;
  view: "day" | "week" | "month";
  setView: (view: "day" | "week" | "month") => void;
  setAddEventOpen: (open: boolean) => void;
}

export function CalendarHeader({ 
  currentMonthYear, 
  view, 
  setView,
  setAddEventOpen
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <h1 className="text-2xl font-bold">Calendário de Eventos</h1>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="bg-white border-gray-200 hover:bg-gray-50"
          onClick={() => setAddEventOpen(true)}
        >
          <CalendarPlus className="mr-2 h-4 w-4 text-orange-500" />
          Cadastrar Evento
        </Button>
      </div>
    </div>
  );
}
