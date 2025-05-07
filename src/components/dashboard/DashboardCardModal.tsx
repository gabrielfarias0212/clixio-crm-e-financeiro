
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Client } from "@/utils/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { formatDate } from "@/utils/clientUtils";
import { Bell, Calendar, DollarSign } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface AlertItem {
  type: "task" | "event" | "payment";
  title: string;
  description: string;
  client: Client;
  date: Date;
}

interface DashboardCardModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  clients: Client[];
  type: "leads" | "contracts" | "delivered" | "pending";
  customData?: AlertItem[]; // Add this prop for alerts data
}

export function DashboardCardModal({ title, open, onClose, clients, type, customData }: DashboardCardModalProps) {
  // Determine if this is an alerts modal
  const isAlertsModal = !!customData;

  const renderAlertTypeIcon = (type: string) => {
    switch (type) {
      case "task":
        return <Bell className="h-4 w-4 text-amber-500" />;
      case "event":
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case "payment":
        return <DollarSign className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case "task":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Tarefa</Badge>;
      case "event":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Evento</Badge>;
      case "payment":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Pagamento</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[500px]">
          {isAlertsModal && customData && customData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Alerta</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contato</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customData.map((alert, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center">
                        {renderAlertTypeIcon(alert.type)}
                        <span className="ml-2">{getAlertTypeLabel(alert.type)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{alert.title}</TableCell>
                    <TableCell>{alert.client.name}</TableCell>
                    <TableCell>
                      <StatusBadge status={alert.client.status} />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500">
                        <div>{alert.client.email}</div>
                        <div className="mt-1">{alert.client.phone}</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : clients.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contato</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>
                      {client.weddingDate ? formatDate(new Date(client.weddingDate)) : "Não definida"}
                    </TableCell>
                    <TableCell>
                      <span className={client.status === "orçamento enviado" || client.status === "follow-up" ? "text-gray-400 italic" : "font-medium"}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.contractValue)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={client.status} />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500">
                        <div>{client.email}</div>
                        <div className="mt-1">{client.phone}</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Nenhum cliente encontrado para esta categoria.
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
