
import React, { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, User, MapPin } from "lucide-react";
import { useClients } from "@/contexts/ClientsContext";

interface ProjectionEvent {
  id: string;
  clientName: string;
  clientId: string;
  eventDate: string;
  amount: number;
  type: 'guaranteed' | 'probable' | 'potential';
  status: string;
  description: string;
  location?: string;
}

interface FinancialProjectionModalProps {
  open: boolean;
  onClose: () => void;
  type: 'guaranteed' | 'probable' | 'potential' | 'monthly';
  title: string;
  events: ProjectionEvent[];
  monthFilter?: string;
}

export function FinancialProjectionModal({
  open,
  onClose,
  type,
  title,
  events,
  monthFilter
}: FinancialProjectionModalProps) {
  const { clients } = useClients();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'fechado':
      case 'em andamento':
        return 'bg-green-100 text-green-800';
      case 'orçamento enviado':
        return 'bg-blue-100 text-blue-800';
      case 'follow-up':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'guaranteed':
        return 'text-green-600';
      case 'probable':
        return 'text-blue-600';
      case 'potential':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredEvents = useMemo(() => {
    if (!monthFilter) return events;
    
    return events.filter(event => {
      try {
        const eventDate = new Date(event.eventDate);
        const eventMonth = eventDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        return eventMonth.toLowerCase() === monthFilter.toLowerCase();
      } catch {
        return false;
      }
    });
  }, [events, monthFilter]);

  const totalValue = filteredEvents.reduce((sum, event) => sum + event.amount, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            {title}
          </DialogTitle>
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-muted-foreground">
              {filteredEvents.length} evento(s) • Total: {formatCurrency(totalValue)}
            </p>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[60vh]">
          <div className="p-6 space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum evento encontrado para este período</p>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {event.clientName}
                      </h3>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getTypeColor(event.type)}`}>
                        {formatCurrency(event.amount)}
                      </div>
                      <Badge className={getStatusColor(event.status)} variant="secondary">
                        {event.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Data: {formatDate(event.eventDate)}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">Local: {event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
