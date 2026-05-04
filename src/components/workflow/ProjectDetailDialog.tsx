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
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
  ExternalLink,
  Truck,
  Camera,
  Copy,
  Shield,
  Scissors,
  Sliders,
  Link as LinkIcon,
  Send,
  Package,
  BookOpen,
  CheckCircle2,
  DollarSign,
  StickyNote,
  BookMarked,
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

interface WorkflowStep {
  field: keyof Client;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  albumStep?: boolean;
}

const MAIN_STEPS: WorkflowStep[] = [
  { field: "weddingPhotographed", label: "Fotografado",    icon: Camera,      color: "text-purple-600", bgColor: "bg-purple-50" },
  { field: "backupCompleted",     label: "Cópia/Backup",   icon: Copy,        color: "text-gray-600",   bgColor: "bg-gray-50"   },
  { field: "curationCompleted",   label: "Curadoria",      icon: Scissors,    color: "text-yellow-600", bgColor: "bg-yellow-50" },
  { field: "inEditing",          label: "Edição Final",   icon: Sliders,     color: "text-blue-600",   bgColor: "bg-blue-50"   },
  { field: "linkSent",           label: "Link Enviado",   icon: Send,        color: "text-green-600",  bgColor: "bg-green-50"  },
  { field: "boxDelivered",       label: "Entrega Física", icon: Package,     color: "text-orange-600", bgColor: "bg-orange-50" },
];

const ALBUM_STEPS: WorkflowStep[] = [
  { field: "albumLinkSent",       label: "Link p/ Escolha", icon: LinkIcon,     color: "text-indigo-600", bgColor: "bg-indigo-50", albumStep: true },
  { field: "albumClientChose",    label: "Cliente Escolheu",icon: CheckCircle2, color: "text-indigo-600", bgColor: "bg-indigo-50", albumStep: true },
  { field: "albumDiagrammed",     label: "Diagramado",      icon: BookOpen,     color: "text-indigo-600", bgColor: "bg-indigo-50", albumStep: true },
  { field: "albumClientApproved", label: "Aprovado",        icon: CheckCircle2, color: "text-indigo-600", bgColor: "bg-indigo-50", albumStep: true },
  { field: "albumOrdered",        label: "Pedido Feito",    icon: Package,      color: "text-indigo-600", bgColor: "bg-indigo-50", albumStep: true },
];

export function ProjectDetailDialog({ client, isOpen, onClose }: ProjectDetailDialogProps) {
  const { updateClient } = useClients();
  const [localClient, setLocalClient] = useState<Client | null>(client);
  const [storageLocation, setStorageLocation] = useState(client?.storageLocation || "");
  const [isSaving, setIsSaving] = useState(false);
  const [togglingField, setTogglingField] = useState<string | null>(null);

  React.useEffect(() => {
    if (client) {
      setLocalClient(client);
      setStorageLocation(client.storageLocation || "");
    }
  }, [client]);

  if (!localClient) return null;

  const semEntregaFisica = localClient.semEntregaFisica ?? false;

  // Calcular progresso
  const steps = localClient.hasAlbum ? [...MAIN_STEPS, ...ALBUM_STEPS] : MAIN_STEPS;
  const visibleSteps = semEntregaFisica ? steps.filter(s => s.field !== "boxDelivered") : steps;
  const done = visibleSteps.filter(s => !!localClient[s.field]).length;
  const pct = visibleSteps.length > 0 ? Math.round((done / visibleSteps.length) * 100) : 0;

  const handleToggleStep = async (field: keyof Client, value: boolean) => {
    setTogglingField(field as string);
    const optimistic = { ...localClient, [field]: value };
    setLocalClient(optimistic);
    try {
      await updateClient(localClient.id, { [field]: value } as Partial<Client>);
    } catch {
      setLocalClient(prev => prev ? { ...prev, [field]: !value } : prev);
      toast.error("Erro ao atualizar etapa");
    } finally {
      setTogglingField(null);
    }
  };

  const handleToggleBoolean = async (field: keyof Client, value: boolean) => {
    const optimistic = { ...localClient, [field]: value };
    setLocalClient(optimistic);
    try {
      await updateClient(localClient.id, { [field]: value } as Partial<Client>);
      if (field === "semEntregaFisica")
        toast.success(value ? "Marcado como entrega digital." : "Entrega física reativada.");
      if (field === "hasAlbum")
        toast.success(value ? "Álbum incluído no projeto." : "Álbum removido do projeto.");
    } catch {
      setLocalClient(prev => prev ? { ...prev, [field]: !value } : prev);
      toast.error("Erro ao atualizar opção");
    }
  };

  const handleSaveStorage = async () => {
    setIsSaving(true);
    try {
      await updateClient(localClient.id, { storageLocation });
      setLocalClient(prev => prev ? { ...prev, storageLocation } : prev);
      toast.success("Local de armazenamento salvo!");
    } catch {
      toast.error("Erro ao salvar");
    } finally {
      setIsSaving(false);
    }
  };

  const weddingDateFormatted = localClient.weddingDate ? formatDate(localClient.weddingDate) : "Não definida";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-6">
            <span className="truncate">{localClient.name}</span>
            <Badge variant="outline" className="ml-2 shrink-0">{localClient.eventCategory}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pb-2">

          {/* Estágio + valor */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-primary text-primary-foreground">
              {localClient.workflowStage ? workflowStageLabels[localClient.workflowStage] : 'Evento/Ensaio'}
            </Badge>
            {localClient.contractValue > 0 && (
              <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                <DollarSign className="h-3.5 w-3.5" />
                R$ {localClient.contractValue.toLocaleString('pt-BR')}
              </span>
            )}
          </div>

          {/* Informações */}
          <div className="space-y-2 text-sm">
            {localClient.coupleName && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4 shrink-0" />
                <span>{localClient.coupleName}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarIcon className="h-4 w-4 shrink-0" />
              <span>{weddingDateFormatted}
                {localClient.weddingStartTime && (
                  <span className="ml-1 text-xs">({localClient.weddingStartTime}{localClient.weddingEndTime ? ` – ${localClient.weddingEndTime}` : ''})</span>
                )}
              </span>
            </div>
            {localClient.eventLocation && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{localClient.eventLocation}</span>
              </div>
            )}
            {localClient.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <span>{localClient.phone}</span>
              </div>
            )}
            {localClient.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span>{localClient.email}</span>
              </div>
            )}
            {localClient.notes && (
              <div className="flex items-start gap-2 text-muted-foreground">
                <StickyNote className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="text-xs leading-relaxed">{localClient.notes}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Progresso */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-medium">
              <span>Progresso do Projeto</span>
              <span className="text-muted-foreground">{done}/{visibleSteps.length} etapas · {pct}%</span>
            </div>
            <Progress value={pct} className="h-2" />

            {/* Etapas clicáveis */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {visibleSteps.map(step => {
                const isDone = !!localClient[step.field];
                const Icon = step.icon;
                const isLoading = togglingField === step.field;
                return (
                  <button
                    key={step.field as string}
                    title={step.label}
                    onClick={() => handleToggleStep(step.field, !isDone)}
                    disabled={!!togglingField}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-all ${
                      isDone
                        ? `${step.bgColor} ${step.color} border-current/20`
                        : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
                    } ${step.albumStep ? "border-dashed" : ""} ${isLoading ? "opacity-50" : ""}`}
                  >
                    {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Icon className="h-3 w-3" />}
                    {step.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Local de armazenamento */}
          <div className="space-y-2">
            <Label htmlFor="storageLocation" className="flex items-center gap-2 text-sm font-medium">
              <HardDrive className="h-4 w-4" />
              Local de Armazenamento
            </Label>
            <div className="flex gap-2">
              <Input
                id="storageLocation"
                placeholder="Ex: SSD1, SSD2, HD externo..."
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveStorage()}
                className="flex-1"
              />
              <Button
                onClick={handleSaveStorage}
                disabled={isSaving || storageLocation === (localClient.storageLocation || "")}
                size="sm"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Opções */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Opções do Projeto</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium leading-none">Sem entrega física</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Entrega somente digital</p>
                </div>
              </div>
              <Switch
                checked={semEntregaFisica}
                onCheckedChange={(v) => handleToggleBoolean("semEntregaFisica", v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <BookMarked className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium leading-none">Inclui álbum</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Adiciona etapas de álbum ao progresso</p>
                </div>
              </div>
              <Switch
                checked={localClient.hasAlbum ?? false}
                onCheckedChange={(v) => handleToggleBoolean("hasAlbum", v)}
              />
            </div>
          </div>

          <Separator />

          {/* Link para detalhes */}
          <Link to={`/clientes/${localClient.id}`} onClick={onClose}>
            <Button variant="outline" className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Página Completa do Cliente
            </Button>
          </Link>

        </div>
      </DialogContent>
    </Dialog>
  );
}
