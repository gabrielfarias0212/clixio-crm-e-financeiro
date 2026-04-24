import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Client, WorkflowStage } from "@/utils/types";
import { useClients } from "@/contexts/ClientsContext";
import { toast } from "sonner";
import { 
  CalendarIcon, 
  MapPin, 
  Mail, 
  Phone, 
  HardDrive, 
  Users, 
  Save,
  Loader2,
  ExternalLink
} from "lucide-react";
import { formatDate } from "@/utils/dates";
import { Link } from "react-router-dom";

interface ProjectDetailDialogProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
}

const workflowStageLabels: Record<WorkflowStage, string> = {
  'evento_ensaio': 'Evento/Ensaio',
  'copia': 'Cópia',
  'backup': 'Backup',
  'curadoria': 'Curadoria',
  'edicao': 'Edição',
  'link_pronto': 'Link Pronto',
  'link_enviado': 'Link Enviado',
  'entrega_fisica': 'Entrega Física',
  'projeto_finalizado': 'Finalizado',
  'edicao_base': 'Edição Base',
  'edicao_final': 'Edição Final',
  'album_em_andamento': 'Álbum em Andamento'
};

export function ProjectDetailDialog({ client, isOpen, onClose }: ProjectDetailDialogProps) {
  const { updateClient } = useClients();
  const [storageLocation, setStorageLocation] = useState(client?.storageLocation || "");
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when client changes
  React.useEffect(() => {
    if (client) {
      setStorageLocation(client.storageLocation || "");
    }
  }, [client]);

  const handleSaveStorageLocation = async () => {
    if (!client) return;

    setIsSaving(true);
    try {
      await updateClient(client.id, { storageLocation });
      toast.success("Local de armazenamento salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar local de armazenamento:", error);
      toast.error("Erro ao salvar local de armazenamento");
    } finally {
      setIsSaving(false);
    }
  };

  if (!client) return null;

  const weddingDateFormatted = client.weddingDate 
    ? formatDate(client.weddingDate) 
    : "Não definida";

  const preWeddingDateFormatted = client.preWeddingDate 
    ? formatDate(client.preWeddingDate) 
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{client.name}</span>
            <Badge variant="outline" className="ml-2">
              {client.eventCategory}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status do Workflow */}
          <div className="flex items-center gap-2">
            <Badge className="bg-primary">
              {client.workflowStage ? workflowStageLabels[client.workflowStage] : 'Evento/Ensaio'}
            </Badge>
            {client.contractValue > 0 && (
              <span className="text-sm font-medium text-green-600">
                R$ {client.contractValue.toLocaleString('pt-BR')}
              </span>
            )}
          </div>

          {/* Informações básicas */}
          <div className="space-y-3 text-sm">
            {client.coupleName && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{client.coupleName}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              <div>
                <span>{weddingDateFormatted}</span>
                {client.weddingStartTime && (
                  <span className="ml-2 text-xs">
                    ({client.weddingStartTime}{client.weddingEndTime ? ` - ${client.weddingEndTime}` : ''})
                  </span>
                )}
              </div>
            </div>

            {preWeddingDateFormatted && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                <span>Pré-Wedding: {preWeddingDateFormatted}</span>
              </div>
            )}

            {client.eventLocation && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{client.eventLocation}</span>
              </div>
            )}

            {client.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{client.email}</span>
              </div>
            )}

            {client.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{client.phone}</span>
              </div>
            )}
          </div>

          {/* Local de Armazenamento */}
          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="storageLocation" className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Local de Armazenamento
            </Label>
            <div className="flex gap-2">
              <Input
                id="storageLocation"
                placeholder="Ex: SSD1, SSD2, HD1, etc."
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleSaveStorageLocation}
                disabled={isSaving || storageLocation === (client.storageLocation || "")}
                size="sm"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Informe onde o projeto está armazenado (SSD, HD, etc.)
            </p>
          </div>

          {/* Link para página do cliente */}
          <div className="border-t pt-4">
            <Link to={`/clientes/${client.id}`}>
              <Button variant="outline" className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver Detalhes Completos
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
