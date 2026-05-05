import { useState, useMemo } from "react";
import { QuickProjectForm } from "@/components/workflow/QuickProjectForm";
import { WorkflowReportDialog } from "@/components/workflow/WorkflowReportDialog";
import { ProjectDetailDialog } from "@/components/workflow/ProjectDetailDialog";
import Layout from "@/components/Layout";
import { useClients } from "@/contexts/ClientsContext";
import { useNavigate } from "react-router-dom";
import { Client } from "@/utils/types";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Camera, HardDrive, Scissors, Sliders, Link, Package,
  BookOpen, AlertTriangle, CheckCircle2, Clock, Search, ChevronRight, Plus, FileText
} from "lucide-react";
import { toast } from "sonner";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface WorkflowStep {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  field: keyof Client;
  description: string;
  albumStep?: boolean;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  { key: "wedding_photographed", label: "Fotografado", icon: Camera, color: "text-purple-600", bgColor: "bg-purple-50", field: "weddingPhotographed", description: "Evento realizado" },
  { key: "backup_completed", label: "Cópia/Backup", icon: HardDrive, color: "text-gray-600", bgColor: "bg-gray-50", field: "backupCompleted", description: "RAW + JPG copiados para o SSD" },
  { key: "curation_completed", label: "Curadoria", icon: Scissors, color: "text-yellow-600", bgColor: "bg-yellow-50", field: "curationCompleted", description: "Seleção no Aftershoot" },
  { key: "in_editing", label: "Edição Final", icon: Sliders, color: "text-blue-600", bgColor: "bg-blue-50", field: "inEditing", description: "Lightroom — ajustes finais" },
  { key: "link_sent", label: "Link Enviado", icon: Link, color: "text-green-600", bgColor: "bg-green-50", field: "linkSent", description: "Galeria Wfolio enviada ao cliente" },
  { key: "box_delivered", label: "Entrega Física", icon: Package, color: "text-orange-600", bgColor: "bg-orange-50", field: "boxDelivered", description: "Pen drive entregue" },
];

const ALBUM_STEPS: WorkflowStep[] = [
  { key: "album_link_sent", label: "Link p/ Escolha", icon: Link, color: "text-indigo-600", bgColor: "bg-indigo-50", field: "albumLinkSent", description: "Link enviado para cliente escolher fotos", albumStep: true },
  { key: "album_client_chose", label: "Cliente Escolheu", icon: CheckCircle2, color: "text-indigo-600", bgColor: "bg-indigo-50", field: "albumClientChose", description: "Cliente selecionou as fotos", albumStep: true },
  { key: "album_diagrammed", label: "Diagramado", icon: BookOpen, color: "text-indigo-600", bgColor: "bg-indigo-50", field: "albumDiagrammed", description: "Álbum diagramado", albumStep: true },
  { key: "album_client_approved", label: "Aprovado", icon: CheckCircle2, color: "text-indigo-600", bgColor: "bg-indigo-50", field: "albumClientApproved", description: "Cliente aprovou o layout", albumStep: true },
  { key: "album_ordered", label: "Pedido Feito", icon: Package, color: "text-indigo-600", bgColor: "bg-indigo-50", field: "albumOrdered", description: "Álbum enviado para produção", albumStep: true },
];

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Normaliza data para evitar problema de fuso UTC→local
function parseDate(dateStr?: string | null): Date | null {
  if (!dateStr) return null;
  const normalized = dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`;
  return new Date(normalized);
}

function daysSince(dateStr?: string | null): number {
  const d = parseDate(dateStr);
  if (!d) return 0;
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr?: string | null): string {
  const d = parseDate(dateStr);
  if (!d) return "—";
  return d.toLocaleDateString("pt-BR");
}

function getClientField(client: any, field: string): boolean {
  return !!client[field];
}

function calcProgress(client: any) {
  let steps = client.hasAlbum ? [...WORKFLOW_STEPS, ...ALBUM_STEPS] : WORKFLOW_STEPS;
  if (client.semEntregaFisica) steps = steps.filter(s => s.field !== 'boxDelivered');
  const done = steps.filter(s => getClientField(client, s.field as string)).length;
  const total = steps.length;
  const pct = Math.round((done / total) * 100);
  const current = steps.find(s => !getClientField(client, s.field as string));
  return { done, total, pct, currentStep: current?.label ?? "Finalizado" };
}

// Retorna a chave da etapa atual (próxima pendente) de um cliente
function isFutureEvent(client: any): boolean {
  const d = parseDate(client.weddingDate);
  if (!d) return false;
  return d.getTime() > Date.now();
}

// Retorna a ÚLTIMA etapa concluída (onde o cliente está agora)
// Assim "Cópia/Backup" no filtro = quem fez backup mas ainda não fez curadoria
function getCurrentStageKey(client: any): string {
  if (client.status === "projeto_finalizado") return "finalizado";

  // Evento futuro sem nenhuma etapa feita → aguardando
  if (isFutureEvent(client) && !getClientField(client, "weddingPhotographed")) {
    return "aguardando_evento";
  }

  // Retorna a última etapa concluída (percorre de trás pra frente)
  let steps = client.hasAlbum ? [...WORKFLOW_STEPS, ...ALBUM_STEPS] : WORKFLOW_STEPS;
  if (client.semEntregaFisica) steps = steps.filter((s: any) => s.field !== 'boxDelivered');

  // Acha a última etapa concluída (mais avançada)
  for (let i = steps.length - 1; i >= 0; i--) {
    if (getClientField(client, steps[i].field as string)) {
      return steps[i].key;
    }
  }

  // Nenhuma etapa concluída e evento já passou → aguardando (sem data ou evento recente)
  return "aguardando_evento";
}

// Lista única de etapas (workflow + álbum + finalizado) para o filtro
const ALL_STAGE_OPTIONS: { key: string; label: string }[] = [
  { key: "aguardando_evento", label: "Aguardando Evento" },
  ...WORKFLOW_STEPS.map(s => ({ key: s.key, label: s.label })),
  ...ALBUM_STEPS.map(s => ({ key: s.key, label: `Álbum: ${s.label}` })),
  { key: "finalizado", label: "Finalizado" },
];

// Mapa rápido: chave → label legível para o badge do card
const STAGE_LABEL: Record<string, string> = {
  aguardando_evento: "Aguardando Evento",
  ...Object.fromEntries(WORKFLOW_STEPS.map(s => [s.key, s.label])),
  ...Object.fromEntries(ALBUM_STEPS.map(s => [s.key, s.label])),
  finalizado: "Finalizado",
};

function urgencyColor(days: number, linkSent: boolean): string {
  if (linkSent) return "text-green-600";
  if (days > 60) return "text-red-600";
  if (days > 30) return "text-orange-500";
  return "text-gray-500";
}

// ─── ProjectCard ──────────────────────────────────────────────────────────────

function ProjectCard({ client, onToggleStep, onClick }: {
  client: any;
  onToggleStep: (id: string, field: string, value: boolean) => void;
  onClick: () => void;
}) {
  const { done, total, pct } = calcProgress(client);
  const stageKey = getCurrentStageKey(client);
  const stageLabel = STAGE_LABEL[stageKey] ?? stageKey;
  const days = daysSince(client.weddingDate);
  const isFuture = isFutureEvent(client);
  const isFinished = client.status === "projeto_finalizado";
  let steps = client.hasAlbum ? [...WORKFLOW_STEPS, ...ALBUM_STEPS] : WORKFLOW_STEPS;
  if (client.semEntregaFisica) steps = steps.filter(s => s.field !== 'boxDelivered');

  const dateLabel = client.weddingDate
    ? isFuture
      ? `${formatDate(client.weddingDate)} · em ${Math.abs(days)} dias`
      : `${formatDate(client.weddingDate)} · ${days}d atrás`
    : "Data não definida";

  return (
    <div
      className={`bg-white border rounded-xl p-5 space-y-4 hover:shadow-md transition-all cursor-pointer ${
        isFinished ? "opacity-60 border-gray-100" : "border-gray-200"
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <h3 className="font-semibold text-gray-900 truncate">{client.name}</h3>
            <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          </div>
          {client.coupleName && (
            <p className="text-xs text-muted-foreground truncate">{client.coupleName}</p>
          )}
          <p className={`text-xs mt-0.5 ${isFuture ? "text-blue-600" : urgencyColor(days, client.linkSent)}`}>
            {dateLabel}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {isFinished ? (
            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Finalizado</Badge>
          ) : isFuture && !client.weddingPhotographed ? (
            <Badge className="bg-sky-100 text-sky-700 border-sky-200 text-xs">Aguardando Evento</Badge>
          ) : days > 60 && !client.linkSent ? (
            <Badge className="bg-red-100 text-red-800 border-red-200 text-xs flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Atrasado
            </Badge>
          ) : (
            <Badge className="bg-blue-50 text-blue-700 border-blue-100 text-xs">{stageLabel}</Badge>
          )}
          {client.hasAlbum && (
            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 text-xs">📖 Álbum</Badge>
          )}
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{done}/{total} etapas</span>
          <span>{pct}%</span>
        </div>
        <Progress value={pct} className="h-1.5" />
      </div>

      <div className="flex flex-wrap gap-1.5" onClick={e => e.stopPropagation()}>
        {steps.map(step => {
          const isDone = getClientField(client, step.field as string);
          const Icon = step.icon;
          return (
            <button
              key={step.key}
              title={step.label}
              onClick={() => onToggleStep(client.id, step.field as string, !isDone)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-all ${
                isDone
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

// ─── DeliveryQueue ────────────────────────────────────────────────────────────

function DeliveryQueue({ clients, onToggleStep, onNavigate }: {
  clients: any[];
  onToggleStep: (id: string, field: string, value: boolean) => void;
  onNavigate: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState<number | "all">("all");
  const [filterYear, setFilterYear] = useState<number | "all">("all");

  const pending = useMemo(() =>
    clients
      .filter(c => c.linkSent && !c.boxDelivered)
      .sort((a, b) => {
        const da = parseDate(a.weddingDate)?.getTime() ?? 0;
        const db = parseDate(b.weddingDate)?.getTime() ?? 0;
        return da - db;
      }),
    [clients]
  );

  const years = useMemo(() => {
    const ys = new Set(pending.map(c => parseDate(c.weddingDate)?.getFullYear()).filter(Boolean));
    return Array.from(ys).sort() as number[];
  }, [pending]);

  const filtered = useMemo(() => {
    return pending.filter(c => {
      const d = parseDate(c.weddingDate);
      if (filterMonth !== "all" && d?.getMonth() !== filterMonth) return false;
      if (filterYear !== "all" && d?.getFullYear() !== filterYear) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return c.name.toLowerCase().includes(q) ||
          (c.coupleName ?? "").toLowerCase().includes(q) ||
          (c.weddingDate ?? "").includes(q);
      }
      return true;
    });
  }, [pending, filterMonth, filterYear, search]);

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
    <div className="space-y-4">
      {/* Alerta */}
      <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
        <AlertTriangle className="h-4 w-4 text-orange-600 shrink-0" />
        <p className="text-sm text-orange-800">
          <strong>{pending.length} entrega{pending.length > 1 ? "s" : ""} pendente{pending.length > 1 ? "s" : ""}</strong>
          {filtered.length !== pending.length && ` · mostrando ${filtered.length}`}
          {" "}— ordenadas do mais antigo
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Pesquisa */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar nome, casal, data..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>

        {/* Filtro Ano */}
        <select
          value={filterYear}
          onChange={e => setFilterYear(e.target.value === "all" ? "all" : Number(e.target.value))}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          <option value="all">Todos os anos</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        {/* Filtro Mês */}
        <select
          value={filterMonth}
          onChange={e => setFilterMonth(e.target.value === "all" ? "all" : Number(e.target.value))}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          <option value="all">Todos os meses</option>
          {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">Nenhum resultado para os filtros selecionados.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((client, index) => {
            const days = daysSince(client.weddingDate);
            const isUrgent = days > 90;

            return (
              <div
                key={client.id}
                className={`bg-white border rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-sm transition-all ${
                  isUrgent ? "border-red-200 bg-red-50/20" : "border-gray-200"
                }`}
                onClick={() => onNavigate(client.id)}
              >
                <div className={`text-2xl font-bold w-8 text-center shrink-0 ${
                  isUrgent ? "text-red-400" : "text-gray-200"
                }`}>
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="font-semibold text-gray-900 truncate">
                      {client.coupleName || client.name}
                    </p>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  </div>
                  {client.coupleName && (
                    <p className="text-xs text-gray-400 truncate">{client.name}</p>
                  )}
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className={`h-3 w-3 shrink-0 ${isUrgent ? "text-red-500" : "text-gray-400"}`} />
                    <span className={`text-xs ${isUrgent ? "text-red-500 font-medium" : "text-gray-400"}`}>
                      {formatDate(client.weddingDate)} · {days} dias atrás
                    </span>
                    {client.hasAlbum && !client.albumOrdered && (
                      <span className="text-xs text-indigo-600 ml-2">📖 Álbum pendente</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    onToggleStep(client.id, "boxDelivered", true);
                  }}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-gray-900 hover:bg-gray-700 active:scale-95 text-white text-xs font-medium rounded-lg transition-all"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Entregue
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────

export default function WorkflowPage() {
  const { clients, loading, updateClient } = useClients();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "finished">("active");
  const [filterMonth, setFilterMonth] = useState<number | "all">("all");
  const [filterYear, setFilterYear] = useState<number | "all">("all");
  const [filterStage, setFilterStage] = useState<string>("all");
  const [showQuickForm, setShowQuickForm] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const workflowClients = useMemo(() => {
    return clients.filter(c => {
      // Finalizado sempre aparece
      if (c.status === "projeto_finalizado") return true;
      // Apenas clientes com contrato fechado entram no fluxo
      // (inclui eventos futuros — aparecem na coluna Evento/Ensaio)
      return c.status === "fechado";
    });
  }, [clients]);

  const years = useMemo(() => {
    const ys = new Set(workflowClients.map(c => parseDate(c.weddingDate)?.getFullYear()).filter(Boolean));
    return Array.from(ys).sort() as number[];
  }, [workflowClients]);

  // Contagem por etapa para mostrar quantos projetos estão em cada uma
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    workflowClients.forEach(c => {
      const key = getCurrentStageKey(c);
      counts[key] = (counts[key] ?? 0) + 1;
    });
    return counts;
  }, [workflowClients]);

  const filtered = useMemo(() => {
    let list = workflowClients;
    if (filterStatus === "active") list = list.filter(c => c.status === "fechado");
    if (filterStatus === "finished") list = list.filter(c => c.status === "projeto_finalizado");
    if (filterStage !== "all") list = list.filter(c => getCurrentStageKey(c) === filterStage);
    if (filterMonth !== "all") list = list.filter(c => parseDate(c.weddingDate)?.getMonth() === filterMonth);
    if (filterYear !== "all") list = list.filter(c => parseDate(c.weddingDate)?.getFullYear() === filterYear);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.coupleName ?? "").toLowerCase().includes(q) ||
        (c.weddingDate ?? "").includes(q) ||
        (c.eventLocation ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [workflowClients, filterStatus, filterStage, filterMonth, filterYear, searchTerm]);

  const stats = useMemo(() => ({
    ativos: workflowClients.filter(c => c.status === "fechado").length,
    entregaFisicaPendente: workflowClients.filter(c => c.linkSent && !c.boxDelivered).length,
    linkEnviado: workflowClients.filter(c => c.linkSent).length,
    finalizados: workflowClients.filter(c => c.status === "projeto_finalizado").length,
    atrasados: workflowClients.filter(c => !c.linkSent && daysSince(c.weddingDate) > 60).length,
  }), [workflowClients]);

  const handleToggleStep = async (clientId: string, field: string, value: boolean) => {
    const updates: any = { [field]: value };
    const client = workflowClients.find(c => c.id === clientId);
    if (client && field === "boxDelivered" && value) {
      const albumOk = !client.hasAlbum || client.albumOrdered;
      if (albumOk) updates.status = "projeto_finalizado";
      updates.nextAction = "nenhuma";
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

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fluxo de Trabalho</h1>
            <p className="text-gray-500 text-sm mt-0.5">Acompanhe cada projeto do evento até a entrega</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReports(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-4 w-4" />
              Relatórios
            </button>
            <button
              onClick={() => setShowQuickForm(prev => !prev)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Novo Projeto
            </button>
          </div>
        </div>

        {showQuickForm && (
          <QuickProjectForm
            onSubmit={() => setShowQuickForm(false)}
            onCancel={() => setShowQuickForm(false)}
          />
        )}

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
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
              {/* Pesquisa */}
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar nome, casal, local..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>

              {/* Status */}
              <div className="flex gap-1.5">
                {(["all", "active", "finished"] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilterStatus(f)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      filterStatus === f
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {f === "all" ? "Todos" : f === "active" ? "Em andamento" : "Finalizados"}
                  </button>
                ))}
              </div>

              {/* Ano */}
              <select
                value={filterYear}
                onChange={e => setFilterYear(e.target.value === "all" ? "all" : Number(e.target.value))}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <option value="all">Todos os anos</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>

              {/* Mês */}
              <select
                value={filterMonth}
                onChange={e => setFilterMonth(e.target.value === "all" ? "all" : Number(e.target.value))}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <option value="all">Todos os meses</option>
                {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>

              {/* Etapa */}
              <select
                value={filterStage}
                onChange={e => setFilterStage(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <option value="all">Todas as etapas</option>
                {ALL_STAGE_OPTIONS.map(opt => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label} ({stageCounts[opt.key] ?? 0})
                  </option>
                ))}
              </select>
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
                    onClick={() => { setSelectedClient(client); setIsDetailDialogOpen(true); }}
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
              onNavigate={id => navigate(`/clients/${id}`)}
            />
          </TabsContent>
        </Tabs>
      </div>

      <ProjectDetailDialog
        client={selectedClient}
        isOpen={isDetailDialogOpen}
        onClose={() => { setIsDetailDialogOpen(false); setSelectedClient(null); }}
      />
      <WorkflowReportDialog
        open={showReports}
        onClose={() => setShowReports(false)}
        clients={workflowClients}
      />
    </Layout>
  );
}
