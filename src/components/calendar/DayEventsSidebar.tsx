import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar as CalendarIcon, Edit, ExternalLink, PlusCircle, Trash2, User, Camera } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Client, CalendarEvent } from "@/utils/types";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { useNavigate } from "react-router-dom";
import { normalizeDate, stringToDate } from "@/utils/dates";

interface DayEventsSidebarProps {
  date: Date | undefined;
  selectedDayItems: { clients: Client[]; events: CalendarEvent[] };
  setAddEventOpen: (open: boolean) => void;
  openEditEvent?: (event: CalendarEvent) => void;
  allClients: Client[];
}

const getEventColorClass = (color: string) => {
  switch (color) {
    case "blue":   return "bg-blue-500";
    case "green":  return "bg-green-500";
    case "red":    return "bg-red-500";
    case "yellow": return "bg-amber-500";
    case "purple": return "bg-purple-500";
    default:       return "bg-gray-500";
  }
};

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(v);

export function DayEventsSidebar({
  date,
  selectedDayItems,
  setAddEventOpen,
  openEditEvent,
  allClients,
}: DayEventsSidebarProps) {
  const { deleteEvent } = useCalendarEvents();
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formattedDate = date
    ? format(date, "EEEE, d 'de' MMMM", { locale: ptBR })
    : "";

  // Also show pre-wedding events on this date
  const preWeddingClients = allClients.filter(c => {
    if (!c.hasPreWedding || !c.preWeddingDate || !date) return false;
    const key = normalizeDate(stringToDate(c.preWeddingDate) || new Date());
    return key === normalizeDate(date);
  });

  const totalClients = [...selectedDayItems.clients, ...preWeddingClients.filter(
    pw => !selectedDayItems.clients.find(c => c.id === pw.id)
  )];

  const isEmpty = totalClients.length === 0 && selectedDayItems.events.length === 0;

  return (
    <Card className="border-none shadow-sm">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold capitalize">{formattedDate}</h3>
          <Button size="sm" variant="outline" onClick={() => setAddEventOpen(true)} className="flex gap-1 items-center">
            <PlusCircle className="h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-[520px] overflow-y-auto">
        {isEmpty ? (
          <div className="text-center text-muted-foreground py-8">
            <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum evento para esta data</p>
            <Button variant="link" onClick={() => setAddEventOpen(true)} className="mt-1 text-xs">
              Adicionar evento
            </Button>
          </div>
        ) : (
          <>
            {/* Client events */}
            {totalClients.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Eventos de Clientes</p>
                {totalClients.map(client => {
                  const isPreWedding = !selectedDayItems.clients.find(c => c.id === client.id);
                  return (
                    <div key={client.id} className={`p-3 border rounded-lg ${isPreWedding ? "bg-amber-50 border-amber-100" : "bg-orange-50 border-orange-100"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Camera className="h-3.5 w-3.5 shrink-0 text-gray-500" />
                            <p className="font-semibold text-sm truncate">{client.name}</p>
                            {isPreWedding && (
                              <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 rounded-full shrink-0">Pré-Wedding</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {isPreWedding ? "Pré-Wedding" : client.eventCategory}
                            {(isPreWedding ? client.preWeddingStartTime : client.weddingStartTime) && (
                              <> • {isPreWedding ? client.preWeddingStartTime : client.weddingStartTime}</>
                            )}
                          </p>
                          {client.eventLocation && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate">{client.eventLocation}</p>
                          )}
                          {client.contractValue > 0 && (
                            <p className="text-xs font-medium text-green-700 mt-1">{fmt(client.contractValue)}</p>
                          )}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 shrink-0 text-gray-400 hover:text-gray-700"
                          onClick={() => navigate(`/clients/${client.id}`)}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Calendar events */}
            {selectedDayItems.events.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Eventos Manuais</p>
                {selectedDayItems.events.map(event => (
                  <div key={event.id} className="p-3 border rounded-lg bg-white">
                    {deletingId === event.id ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-red-700">Excluir <strong>{event.title}</strong>?</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="destructive" className="h-7 text-xs"
                            onClick={() => { deleteEvent(event.id); setDeletingId(null); }}>
                            Sim, excluir
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs"
                            onClick={() => setDeletingId(null)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${getEventColorClass(event.color)}`} />
                            <p className="font-medium text-sm truncate">{event.title}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{event.startTime} – {event.endTime}</p>
                          {event.description && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate">{event.description}</p>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button size="icon" variant="ghost" className="h-7 w-7"
                            onClick={() => openEditEvent?.(event)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setDeletingId(event.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
