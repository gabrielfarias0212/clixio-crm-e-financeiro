import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Calendar as CalendarIcon, Edit, PlusCircle, Trash2, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Client, CalendarEvent } from "@/utils/types";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { toast } from "@/hooks/use-toast";

interface DayEventsSidebarProps {
  date: Date | undefined;
  selectedDayItems: {
    clients: Client[];
    events: CalendarEvent[];
  };
  setAddEventOpen: (open: boolean) => void;
  openEditEvent?: (event: CalendarEvent) => void;
}

export function DayEventsSidebar({ 
  date, 
  selectedDayItems,
  setAddEventOpen,
  openEditEvent
}: DayEventsSidebarProps) {
  const { deleteEvent, refreshEvents } = useCalendarEvents();
  const formattedDate = date ? format(date, "EEEE, d 'de' MMMM", { locale: ptBR }) : "";
  
  const handleEditEvent = (event: CalendarEvent) => {
    if (openEditEvent) {
      openEditEvent(event);
    } else {
      // Fallback if openEditEvent is not provided
      setAddEventOpen(true);
    }
  };
  
  const handleDeleteEvent = async (eventId: string) => {
    if (confirm("Tem certeza que deseja excluir este evento?")) {
      try {
        await deleteEvent(eventId);
        toast({
          title: "Evento excluído",
          description: "O evento foi excluído com sucesso."
        });
      } catch (error) {
        console.error("Error deleting event:", error);
        toast({
          title: "Erro ao excluir evento",
          description: "Ocorreu um erro ao excluir o evento.",
          variant: "destructive"
        });
      }
    }
  };
  
  const getEventColorClass = (color: string) => {
    switch(color) {
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      case 'red': return 'bg-red-500';
      case 'yellow': return 'bg-amber-500';
      case 'purple': return 'bg-purple-500';
      case 'gray': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };
  
  const getEventTypeIcon = (type: string) => {
    switch(type) {
      case 'meeting': return <User size={16} className="mr-1" />;
      case 'photoshoot': return <CalendarIcon size={16} className="mr-1" />;
      default: return <CalendarIcon size={16} className="mr-1" />;
    }
  };

  return (
    <Card className="border-none shadow-sm">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-medium">
            {formattedDate}
          </h3>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setAddEventOpen(true)}
            className="flex gap-1 items-center"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Adicionar</span>
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        {(selectedDayItems.clients.length === 0 && selectedDayItems.events.length === 0) ? (
          <div className="text-center text-muted-foreground py-6">
            <p>Nenhum evento para esta data</p>
            <Button 
              variant="link" 
              onClick={() => setAddEventOpen(true)}
              className="mt-2"
            >
              Adicionar evento
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Client Events */}
            {selectedDayItems.clients.length > 0 && (
              <>
                <h4 className="font-medium text-sm text-muted-foreground">Eventos de Clientes</h4>
                <div className="space-y-3">
                  {selectedDayItems.clients.map((client) => (
                    <div 
                      key={client.id} 
                      className="p-3 border rounded-md bg-orange-50 border-orange-100"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium">{client.name}</h5>
                          <p className="text-sm text-gray-600 mt-1">
                            {client.eventCategory}
                            {client.weddingStartTime && ` • ${client.weddingStartTime}`}
                          </p>
                        </div>
                        <div className="text-xs font-medium rounded-full bg-orange-100 text-orange-800 px-2 py-0.5">
                          {client.status}
                        </div>
                      </div>
                      
                      {client.eventLocation && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {client.eventLocation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {/* Calendar Events */}
            {selectedDayItems.events.length > 0 && (
              <>
                <h4 className="font-medium text-sm text-muted-foreground">Eventos do Calendário</h4>
                <div className="space-y-3">
                  {selectedDayItems.events.map((event) => (
                    <div 
                      key={event.id} 
                      className="p-3 border rounded-md bg-white"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div className={`h-3 w-3 rounded-full mr-2 ${getEventColorClass(event.color)}`}></div>
                            <h5 className="font-medium">{event.title}</h5>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 flex items-center">
                            {getEventTypeIcon(event.type)}
                            {event.startTime} - {event.endTime}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleEditEvent(event)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                      
                      {event.description && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
