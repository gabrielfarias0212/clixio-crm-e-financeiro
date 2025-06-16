
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock } from "lucide-react";
import { Client } from "@/utils/types";
import { stringToDate, formatDate } from "@/utils/dates";
import { StatusBadge } from "@/components/StatusBadge";
import { useNavigate } from "react-router-dom";

interface MonthlyEventsModalProps {
  open: boolean;
  onClose: () => void;
  clients: Client[];
}

interface EventEntry {
  client: Client;
  date: string;
  type: "wedding" | "pre-wedding";
  location?: string;
  startTime?: string;
}

export function MonthlyEventsModal({ open, onClose, clients }: MonthlyEventsModalProps) {
  const navigate = useNavigate();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState((currentDate.getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());

  const months = [
    { value: "1", label: "Janeiro" },
    { value: "2", label: "Fevereiro" },
    { value: "3", label: "Março" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Maio" },
    { value: "6", label: "Junho" },
    { value: "7", label: "Julho" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
  ];

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearsList = [];
    for (let i = currentYear - 2; i <= currentYear + 3; i++) {
      yearsList.push({ value: i.toString(), label: i.toString() });
    }
    return yearsList;
  }, []);

  const filteredEvents = useMemo(() => {
    const events: EventEntry[] = [];
    const targetMonth = parseInt(selectedMonth);
    const targetYear = parseInt(selectedYear);

    clients.forEach(client => {
      // Check wedding date
      if (client.weddingDate) {
        const weddingDate = stringToDate(client.weddingDate);
        if (weddingDate && 
            weddingDate.getMonth() + 1 === targetMonth && 
            weddingDate.getFullYear() === targetYear) {
          events.push({
            client,
            date: client.weddingDate,
            type: "wedding",
            location: client.eventLocation,
            startTime: client.weddingStartTime,
          });
        }
      }

      // Check pre-wedding date
      if (client.preWeddingDate) {
        const preWeddingDate = stringToDate(client.preWeddingDate);
        if (preWeddingDate && 
            preWeddingDate.getMonth() + 1 === targetMonth && 
            preWeddingDate.getFullYear() === targetYear) {
          events.push({
            client,
            date: client.preWeddingDate,
            type: "pre-wedding",
            startTime: client.preWeddingStartTime,
          });
        }
      }
    });

    return events.sort((a, b) => {
      const dateA = stringToDate(a.date);
      const dateB = stringToDate(b.date);
      if (!dateA || !dateB) return 0;
      return dateA.getTime() - dateB.getTime();
    });
  }, [clients, selectedMonth, selectedYear]);

  const handleRowClick = (clientId: string) => {
    navigate(`/clients/${clientId}`);
    onClose();
  };

  const getEventTypeLabel = (type: "wedding" | "pre-wedding", category?: string) => {
    if (type === "pre-wedding") {
      return "Pré-Wedding";
    }
    return category || "Casamento";
  };

  const getEventTypeBadge = (type: "wedding" | "pre-wedding") => {
    if (type === "pre-wedding") {
      return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Pré-Wedding</Badge>;
    }
    return <Badge variant="default" className="bg-blue-100 text-blue-800">Evento Principal</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Eventos por Mês
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filtros */}
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Mês:</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Ano:</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto text-sm text-gray-600">
              {filteredEvents.length} evento(s) encontrado(s)
            </div>
          </div>

          {/* Tabela de eventos */}
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum evento encontrado para {months.find(m => m.value === selectedMonth)?.label} de {selectedYear}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Local</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event, index) => (
                  <TableRow 
                    key={`${event.client.id}-${event.type}-${index}`}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleRowClick(event.client.id)}
                  >
                    <TableCell className="font-medium">
                      {event.client.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {event.date}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm">
                          {getEventTypeLabel(event.type, event.client.eventCategory)}
                        </div>
                        {getEventTypeBadge(event.type)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={event.client.status} />
                    </TableCell>
                    <TableCell>
                      {event.startTime && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="h-3 w-3" />
                          {event.startTime}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {event.location && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-32" title={event.location}>
                            {event.location}
                          </span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
