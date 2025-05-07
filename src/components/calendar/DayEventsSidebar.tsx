
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Client } from "@/utils/types";
import { CalendarEvent } from "@/utils/types";
import { CalendarDays, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface DayEventsSidebarProps {
  date: Date | undefined;
  selectedDayItems: {
    clients: Client[];
    events: CalendarEvent[];
  };
  setAddEventOpen: (open: boolean) => void;
}

export function DayEventsSidebar({ date, selectedDayItems, setAddEventOpen }: DayEventsSidebarProps) {
  const navigate = useNavigate();
  
  return (
    <Card className="border-none shadow-sm bg-white h-full">
      <CardContent className="p-4">
        <h2 className="text-lg font-medium mb-4 flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5 text-orange-500" />
          {date && format(date, "dd 'de' MMMM", { locale: ptBR })}
        </h2>
        
        {selectedDayItems.clients.length > 0 || selectedDayItems.events.length > 0 ? (
          <div className="space-y-4">
            {selectedDayItems.clients.map(client => (
              <div 
                key={client.id}
                className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 cursor-pointer transition-all hover:shadow-sm"
                onClick={() => navigate(`/clients/${client.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{client.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {client.eventCategory || "Evento"}
                    </p>
                  </div>
                  <StatusBadge status={client.status} />
                </div>
                
                <div className="mt-2 text-sm">
                  <span className="font-medium">Valor: </span>
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(client.contractValue)}
                </div>
              </div>
            ))}
            
            {selectedDayItems.events.map(event => (
              <div 
                key={event.id}
                className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all hover:shadow-sm"
              >
                <div>
                  <h3 className="font-medium">{event.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {event.time} - {event.description}
                  </p>
                </div>
                
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    event.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                    event.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                    event.color === 'green' ? 'bg-green-100 text-green-800' :
                    event.color === 'red' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {event.type || "Evento"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CalendarDays className="mx-auto h-10 w-10 mb-2 text-gray-300" />
            <p>Nenhum evento agendado para este dia.</p>
            <Button 
              variant="link" 
              className="mt-2 text-orange-500"
              onClick={() => setAddEventOpen(true)}
            >
              + Adicionar evento
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
