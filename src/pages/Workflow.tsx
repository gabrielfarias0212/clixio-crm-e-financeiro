import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import { useClients } from "@/contexts/ClientsContext";
import { useNavigate } from "react-router-dom";
import { Client } from "@/utils/types";
import { SearchInput } from "@/components/SearchInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Camera, HardDrive, Scissors, Sliders, Link, Package,
  BookOpen, AlertTriangle, CheckCircle2, Clock, ChevronRight,
  X, Filter
} from "lucide-react";
import { useClients as useClientsHook } from "@/contexts/ClientsContext";
import { toast } from "sonner";

// ─── Definição das etapas ───────────────────────────────────────────────────

interface WorkflowStep {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  field: keyof Client;
  description: string;
  albumStep?: boolean; // etapas só para quem tem álbum
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  { key: "wedding_photographed", label: "Fotografado", icon: Camera, color: "text-purple-600", bgColor: "bg-purple-50", field: "weddingPhotographed", description: "Evento realizado" },
  { key: "backup_done", label: "Cópia/Backup", icon: HardDrive, color: "text-gray-600", bgColor: "bg-gray-50", field: "backupDone", description: "RAW + JPG copiados para o SSD" },
  { key: "curadoria_done", label: "Curadoria", icon: Scissors, color: "text-yellow-600", bgColor: "bg-yellow-50", field: "curadoriaDone", description: "Seleção no Aftershoot" },
  { key: "in_editing", label: "Edição Final", icon: Sliders, color: "text-blue-600", bgColor: "bg-blue-50", field: "inEditing", description: "Lightroom — ajustes finais" },
  { key: "link_sent", label: "Link Enviado", icon: Link, color: "text-green-600", bgColor: "bg-green-50", field: "linkSent", description: "Galeria Wfolio enviada ao cliente" },
  { key: "box_delivered", label: "Entrega Física", icon: Package, color: "text-orange-600", bgColor: "bg-orange-50", field: "boxDelivered", description: "Pen drive entregue" },
];

const ALBUM_STEPS: WorkflowStep[] = [
  { key: "album_link_sent", label: "Link p/ Escolha", icon: Link, color: "text-indigo-600", bgColor: "bg-indigo-50", field: "albumLinkSent", description: "Link enviado para cliente escolher fotos", albumStep: true },
  { key: "album_client_chose", label: "Cliente Escolheu", icon: CheckCircle2, color: "text-indigo-600", bgColor: "bg-indigo-50", field: "albumClientChose", description: "Cliente selecionou as fotos", albumStep: true },
  { key: "album_diagrammed", label: "Diagramado", icon: BookOpen, color: "text-indigo-600", bgColor: "bg-indigo-50", field: "albumDiagrammed", description: "Álbum diagramado por você ou Laís", albumStep: true },
  { key: "album_client_approved", label: "Aprovado", icon: CheckCircle2, color: "text-indigo-600", bgColor: "bg-indigo-50", field: "albumClientApproved", description: "Cliente aprovou o layout", albumStep: true },
  { key: "album_ordered", label: "Pedido Feito", icon: Package, color: "text-indigo-600", bgColor: "bg-indigo-50", field: "albumOrdered", description: "Álbum enviado para produção", albumStep: true },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getClientField(client: any, field: string): boolean {
  const map: Record<string, string> = {
    weddingPhotographed: "weddingPhotographed",
    backupDone: "backupDone",
    curadoriaDone: "curadoriaDone",
    inEditing: "inEditing",
    linkSent: "linkSent",
    boxDelivered: "boxDelivered",
    albumLinkSent: "albumLinkSent",
    albumClientChose: "albumClientChose",
    albumDiagrammed: "albumDiagrammed",
    albumClientApproved: "albumClientApproved",
    albumOrdered: "albumOrdered",
  };
  return !!client[map[field] ?? field];
}

function calcProgress(client: any): { done: number; total: number; pct: number; currentStep: string } {
  const hasAlbum = !!client.hasAlbum;
  const steps = hasAlbum ? [...WORKFLOW_STEPS, ...ALBUM_STEPS] : WORKFLOW_STEPS;
  const done = steps.filter(s => getClientField(client, s.field as string)).length;
  const total = steps.length;
  const pct = Math.round((done / total) * 100);

  // Encontrar etapa atual (primeira não concluída)
  const current = steps.find(s => !getClientField(client, s.field as string));
  return { done, total, pct, currentStep: current?.label ?? "Finalizado" };
}

function daysSince(dateStr?: string | null): number {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function urgencyColor(days: number, linkSent: boolean): string {
  if (linkSent) return "text-green-600";
  if (days > 60) return "text-red-600";
  if (days > 30) return "text-orange-500";
  return "text-gray-500";
}

// ─── Card do projeto ──────────────────────────────────────────────────────────

function ProjectCard({ client, onToggleStep, onClick }: {
  client: any;
  onToggleStep: (clientId: string, field: string, value: boolean) => void;
  onClick: () => void;
}) {
  const { done, total, pct, currentStep } = calcProgress(client);
  const days = daysSince(client.weddingDate);
  const isFinished = client.status === "projeto_finalizado";
  const hasAlbum = !!client.hasAlbum;
  const steps = hasAlbum ? [...WORKFLOW_STEPS, ...ALBUM_STEPS] : WORKFLOW_STEPS;

  return (
    <div
      className={`bg-white border rounded-xl p-5 space-y-4 hover:shadow-md transition-all cursor-pointer ${
        isFinished ? "opacity-60 border-gray-100" : "border-gray-200"
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{client.name}</h3>
          {client.coupleName && (
            <p className="text-xs text-muted-foreground truncate">{client.coupleName}</p>
          )}
          <p className={`text-xs mt-0.5 ${urgencyColor(days, client.linkSent)}`}>
            {client.weddingDate
              ? `Evento: ${new Date(client.weddingDate).toLocaleDateString("pt-BR")} · ${days}d atrás`
              : "Data não definida"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {isFinished ? (
            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Finalizado</Badge>
          ) : days > 60 && !client.linkSent ? (
            <Badge className="bg-red-100 text-red-800 border-red-200 text-xs flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Atrasado
            </Badge>
          ) : (
            <Badge className="bg-blue-50 text-blue-700 border-blue-100 text-xs">
              {currentStep}
            </Badge>
          )}
          {hasAlbum && (
            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 text-xs">
              📖 Álbum
            </Badge>
          )}
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{done}/{total} etapas</span>
          <span>{pct}%</span>
        </div>
        <Progress value={pct} className="h-1.5" />
      </div>

      {/* Steps rápidos */}
      <div
        className="flex flex-wrap gap-1.5"
        onClick={e => e.stopPropagation()}
      >
        {steps.map(step => {
          const done = getClientField(client, step.field as string);
          const Icon = step.icon;
          return (
            <button
              key={step.key}
              title={step.label}
              onClick={() => onToggleStep(client.id, step.field as string, !done)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-all ${
                done
                  ? `${step.bgColor} ${step.color} border-current/20`
                  : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
              } ${step.albumStep ? "border-dashed" : ""}`}
            >
              <Icon className="h-3 w-3" />
              {step.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Fila de Entregas Físicas ─────────────────────────────────────────────────

function DeliveryQueue({ clients, onToggleStep }: {
  clients: any[];
  onToggleStep: (clientId: string, field: string, value: boolean) => void;
}) {
  const pending = clients
    .filter(c => c.linkSent && !c.boxDelivered)
    .sort((a, b) => {
      const da = new Date(a.weddingDate || 0).getTime();
      const db = new Date(b.weddingDate || 0).getTime();
      return da - db; // mais antigos primeiro
    });

  if (pending.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">Nenhuma entrega pendente</p>
        <p className="text-sm">Tudo entregue! 🎉</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
        <AlertTriangle className="h-4 w-4 text-orange-600 shrink-0" />
        <p className="text-sm text-orange-800">
          <strong>{pending.length} entrega{pending.length > 1 ? "s" : ""} pendente{pending.length > 1 ? "s" : ""}</strong>
          {" "}— ordenadas do mais antigo para o mais recente
        </p>
      </div>

      {pending.map((client, index) => {
        const days = daysSince(client.weddingDate);
        const hasAlbum = !!client.hasAlbum;
        const albumPending = hasAlbum && !client.albumOrdered;

        return (
          <div
            key={client.id}
            className={`bg-white border rounded-xl p-4 flex items-center gap-4 ${
              days > 90 ? "border-red-200 bg-red-50/30" : "border-gray-200"
            }`}
          >
            <div className={`text-2xl font-bold w-8 text-center ${
              days > 90 ? "text-red-500" : "text-gray-300"
            }`}>
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{client.name}</p>
              {client.coupleName && (
                <p className="text-xs text-muted-foreground">{client.coupleName}</p>
              )}
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-xs ${days > 90 ? "text-red-600 font-medium" : "text-gray-500"}`}>
                  <Clock className="h-3 w-3 inline mr-0.5" />
                  {days} dias desde o evento
                </span>
                {albumPending && (
                  <span className="text-xs text-indigo-600">
                    📖 Álbum em andamento
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => onToggleStep(client.id, "boxDelivered", true)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <Package className="h-3.5 w-3.5" />
              Marcar entregue
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function WorkflowPage() {
  const { clients, loading, updateClient } = useClients();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "finished">("active");

  const workflowClients = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return clients.filter(c => {
      // Sempre mostrar finalizados
      if (c.status === "projeto_finalizado") return true;

      // Só mostrar "fechado" se:
      // 1. O evento já aconteceu (data <= hoje), OU
      // 2. Já tem alguma etapa do workflow marcada (foi fotografado)
      if (c.status !== "fechado") return false;

      const jaFotografado = !!c.weddingPhotographed;
      if (jaFotografado) return true;

      if (!c.weddingDate) return false;
      const eventDate = new Date(c.weddingDate);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate <= today;
    });
  }, [clients]);

  const filtered = useMemo(() => {
    let list = workflowClients;

    if (filterStatus === "active") list = list.filter(c => c.status === "fechado");
    if (filterStatus === "finished") list = list.filter(c => c.status === "projeto_finalizado");

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.coupleName ?? "").toLowerCase().includes(q)
      );
    }

    return list;
  }, [workflowClients, filterStatus, searchTerm]);

  // Stats
  const stats = useMemo(() => ({
    ativos: workflowClients.filter(c => c.status === "fechado").length,
    entregaFisicaPendente: workflowClients.filter(c => c.linkSent && !c.boxDelivered).length,
    linkEnviado: workflowClients.filter(c => c.linkSent).length,
    finalizados: workflowClients.filter(c => c.status === "projeto_finalizado").length,
    atrasados: workflowClients.filter(c => {
      const days = daysSince(c.weddingDate);
      return !c.linkSent && days > 60;
    }).length,
  }), [workflowClients]);

  const handleToggleStep = async (clientId: string, field: string, value: boolean) => {
    // Map de campo frontend → banco
    const fieldMap: Record<string, string> = {
      weddingPhotographed: "weddingPhotographed",
      backupDone: "backupDone",
      curadoriaDone: "curadoriaDone",
      inEditing: "inEditing",
      linkSent: "linkSent",
      boxDelivered: "boxDelivered",
      albumLinkSent: "albumLinkSent",
      albumClientChose: "albumClientChose",
      albumDiagrammed: "albumDiagrammed",
      albumClientApproved: "albumClientApproved",
      albumOrdered: "albumOrdered",
    };

    const updates: any = { [fieldMap[field] ?? field]: value };

    // Se todas as etapas principais estão concluídas, marcar como finalizado
    const client = workflowClients.find(c => c.id === clientId);
    if (client && field === "boxDelivered" && value) {
      const hasAlbum = !!client.hasAlbum;
      const albumOk = !hasAlbum || client.albumOrdered;
      if (albumOk) {
        updates.status = "projeto_finalizado";
      }
    }

    await updateClient(clientId, updates);
    toast.success("Etapa atualizada!");
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fluxo de Trabalho</h1>
          <p className="text-gray-500 text-sm mt-0.5">Acompanhe cada projeto do evento até a entrega</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Ativos", value: stats.ativos, color: "text-gray-900" },
            { label: "Link Enviado", value: stats.linkEnviado, color: "text-green-600" },
            { label: "Entrega Pendente", value: stats.entregaFisicaPendente, color: stats.entregaFisicaPendente > 0 ? "text-orange-600" : "text-gray-400" },
            { label: "Atrasados", value: stats.atrasados, color: stats.atrasados > 0 ? "text-red-600" : "text-gray-400" },
            { label: "Finalizados", value: stats.finalizados, color: "text-purple-600" },
          ].map(s => (
            <div key={s.label} className="bg-white border rounded-xl p-4">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="projetos">
          <TabsList>
            <TabsTrigger value="projetos">Todos os Projetos</TabsTrigger>
            <TabsTrigger value="entregas" className="relative">
              Fila de Entregas
              {stats.entregaFisicaPendente > 0 && (
                <span className="ml-1.5 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {stats.entregaFisicaPendente}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Tab: Projetos */}
          <TabsContent value="projetos" className="space-y-4 mt-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 max-w-sm">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Buscar por nome ou casal..."
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                {(["all", "active", "finished"] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilterStatus(f)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      filterStatus === f
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {f === "all" ? "Todos" : f === "active" ? "Em andamento" : "Finalizados"}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Camera className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum projeto encontrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(client => (
                  <ProjectCard
                    key={client.id}
                    client={client}
                    onToggleStep={handleToggleStep}
                    onClick={() => navigate(`/clients/${client.id}`)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab: Fila de Entregas */}
          <TabsContent value="entregas" className="mt-4">
            <DeliveryQueue
              clients={workflowClients}
              onToggleStep={handleToggleStep}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
