
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Client, AlertItem } from "@/utils/types"; // Import AlertItem from types.ts
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Bell, Calendar, DollarSign, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/utils/dateUtils";

interface DashboardCardModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  clients: Client[];
  type: "leads" | "contracts" | "delivered" | "pending" | "monthly-events";
  customData?: AlertItem[]; // Use the imported AlertItem type
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
      case "due_payment":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
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
      case "due_payment":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Pagamento Vencido</Badge>;
      default:
        return null;
    }
  };

  // Function to safely format a date string
  const safeFormatDate = (dateValue: string | null) => {
    if (!dateValue) return "Não definida";
    
    try {
      return formatDateTime(dateValue);
    } catch (error) {
      console.error("Error formatting date:", dateValue, error);
      return "Data inválida";
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
                      {safeFormatDate(client.weddingDate)}
                    </TableCell>
                    <TableCell>
                      <span className={client.status === "orçamento enviado" || client.status === "primeiro_contato" ? "text-gray-400 italic" : "font-medium"}>
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
