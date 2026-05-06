import { formatDate } from '@/utils/dates';
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Client } from "@/utils/types";
import { Phone, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LeadOriginDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  originName: string;
  clients: Client[];
}

export function LeadOriginDetailDialog({ 
  isOpen, 
  onClose, 
  originName, 
  clients 
}: LeadOriginDetailDialogProps) {
  // Filter clients by origin and sort alphabetically
  const filteredClients = clients
    .filter(client => (client as any).leadSource === originName)
    .sort((a, b) => a.name.localeCompare(b.name));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "primeiro_contato":
        return "bg-yellow-100 text-yellow-800";
      case "proposta_enviada":
        return "bg-blue-100 text-blue-800";
      case "contrato_fechado":
        return "bg-green-100 text-green-800";
      case "fechado":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      primeiro_contato: "Primeiro Contato",
      proposta_enviada: "Proposta Enviada", 
      contrato_fechado: "Contrato Fechado",
      fechado: "Fechado"
    };
    return statusMap[status] || status;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Leads de {originName}</span>
            <Badge variant="secondary">
              {filteredClients.length} {filteredClients.length === 1 ? 'lead' : 'leads'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {filteredClients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum lead encontrado para esta origem.
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="border border-border rounded-lg p-4 bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">
                          {client.name}
                        </h3>
                        <Badge 
                          variant="secondary" 
                          className={getStatusColor(client.status || 'primeiro_contato')}
                        >
                          {formatStatus(client.status || 'primeiro_contato')}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        {client.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                        {client.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{client.email}</span>
                          </div>
                        )}
                        {client.weddingDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {formatDate(client.weddingDate)}
                            </span>
                          </div>
                        )}
                      </div>

                      {client.notes && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {client.notes}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      {client.contractValue && (
                        <div className="text-lg font-semibold text-foreground">
                          R$ {client.contractValue.toLocaleString('pt-BR')}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {client.eventCategory || 'Casamento'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}