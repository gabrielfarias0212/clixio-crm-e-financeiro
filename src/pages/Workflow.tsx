import { useState, useMemo } from "react";
import { QuickProjectForm } from "@/components/workflow/QuickProjectForm";
import { WorkflowReportDialog } from "@/components/workflow/WorkflowReportDialog";
import { ProjectDetailDialog } from "@/components/workflow/ProjectDetailDialog";
import Layout from "@/components/Layout";
import { useClients } from "@/contexts/ClientsContext";
import { useNavigate } from "react-router-dom";
import { Client } from "@/utils/types";
import { Progress } from "@/components/ui/progress";
import {
  Camera, HardDrive, Scissors, Sliders, Link, Package,
  BookOpen, AlertTriangle, CheckCircle2, Clock, Search,
  ChevronRight, Plus, FileText,
} from "lucide-react";
import { toast } from "sonner";

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  text:       "#1a1a1a",
  textSub:    "#9A9590",
  divider:    "#F0EDE8",
  itemBg:     "#FAFAF8",
  border:     "#E8E4DE",
  navy:       "#1E3A5F",
  navyBg:     "#E8EEF6",
  amber:      "#E8A838",
  amberBg:    "#FEF3DC",
  success:    "#52C97A",
  successBg:  "#E6F9EE",
  danger:     "#E05252",
  dangerBg:   "#FEE8E8",
  gray:       "#9A9590",
  grayBg:     "#F0EDE8",
};

const CARD = {
  background: "#FFFFFF",
  borderRadius: 14,
  boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 6px 20px rgba(0,0,0,0.07)",
} as const;

// ─── Status helpers ───────────────────────────────────────────────────────────

function isDelivered(client: any): boolean {
  if (client.status === "projeto_finalizado") return true;
  if (client.semEntregaFisica) return !!client.linkSent;
  return !!client.boxDelivered;
}
function isInProgress(client: any): boolean {
  return !!client.weddingPhotographed && !isDelivered(client);
}
function isAwaiting(client: any): boolean {
  return !client.weddingPhotographed && !isDelivered(client);
}

// ─── Workflow steps ───────────────────────────────────────────────────────────

interface WorkflowStep {
  key: string;
  label: string;
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  color: string;
  bgColor: string;
  field: keyof Client;
  description: string;
  albumStep?: boolean;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  { key: "wedding_photographed", label: "Fotografado",    icon: Camera,      color: "#7C3AED", bgColor: "#F3EFFE", field: "weddingPhotographed", description: "Evento realizado" },
  { key: "backup_completed",     label: "Cópia/Backup",  icon: HardDrive,   color: C.gray,    bgColor: C.grayBg,  field: "backupCompleted",     description: "RAW + JPG copiados" },
  { key: "curation_completed",   label: "Curadoria",     icon: Scissors,    color: C.amber,   bgColor: C.amberBg, field: "curationCompleted",   description: "Seleção no Aftershoot" },
  { key: "in_editing",           label: "Edição Final",  icon: Sliders,     color: "#2563EB", bgColor: "#EFF6FF",  field: "inEditing",           description: "Lightroom — ajustes finais" },
  { key: "link_sent",            label: "Link Enviado",  icon: Link,        color: C.success, bgColor: C.successBg, field: "linkSent",          description: "Galeria enviada" },
  { key: "box_delivered",        label: "Entrega Física",icon: Package,     color: "#D97706", bgColor: "#FEF3C7",  field: "boxDelivered",        description: "Pen drive entregue" },
];

const ALBUM_STEPS: WorkflowStep[] = [
  { key: "album_link_sent",       label: "Link p/ Escolha",   icon: Link,         color: "#4F46E5", bgColor: "#EEF2FF", field: "albumLinkSent",       description: "Link enviado para escolha", albumStep: true },
  { key: "album_client_chose",    label: "Cliente Escolheu",  icon: CheckCircle2, color: "#4F46E5", bgColor: "#EEF2FF", field: "albumClientChose",    description: "Cliente selecionou as fotos", albumStep: true },
  { key: "album_diagrammed",      label: "Diagramado",        icon: BookOpen,     color: "#4F46E5", bgColor: "#EEF2FF", field: "albumDiagrammed",     description: "Álbum diagramado", albumStep: true },
  { key: "album_client_approved", label: "Aprovado",          icon: CheckCircle2, color: "#4F46E5", bgColor: "#EEF2FF", field: "albumClientApproved", description: "Cliente aprovou o layout", albumStep: true },
  { key: "album_ordered",         label: "Pedido Feito",      icon: Package,      color: "#4F46E5", bgColor: "#EEF2FF", field: "albumOrdered",        description: "Enviado para produção", albumStep: true },
];

const MONTHS = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseDate(dateStr?: string | null): Date | null {
  if (!dateStr) return null;
  const normalized = dateStr.includes("T") ? dateStr : `${dateStr}T12:00:00`;
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
  if (client.semEntregaFisica) steps = steps.filter(s => s.field !== "boxDelivered");
  const done = steps.filter(s => getClientField(client, s.field as string)).length;
  const total = steps.length;
  const pct = Math.round((done / total) * 100);
  const current = steps.find(s => !getClientField(client, s.field as string));
  return { done, total, pct, currentStep: current?.label ?? "Finalizado" };
}
function isFutureEvent(client: any): boolean {
  const d = parseDate(client.weddingDate);
  if (!d) return false;
  return d.getTime() > Date.now();
}
function getCurrentStageKey(client: any): string {
  if (client.status === "projeto_finalizado") return "finalizado";
  if (isFutureEvent(client) && !getClientField(client, "weddingPhotographed")) return "aguardando_evento";
  let steps = client.hasAlbum ? [...WORKFLOW_STEPS, ...ALBUM_STEPS] : WORKFLOW_STEPS;
  if (client.semEntregaFisica) steps = steps.filter((s: any) => s.field !== "boxDelivered");
  for (let i = steps.length - 1; i >= 0; i--) {
    if (getClientField(client, steps[i].field as string)) return steps[i].key;
  }
  return "aguardando_evento";
}

const ALL_STAGE_OPTIONS: { key: string; label: string }[] = [
  { key: "aguardando_evento", label: "Aguardando Evento" },
  ...WORKFLOW_STEPS.map(s => ({ key: s.key, label: s.label })),
  ...ALBUM_STEPS.map(s => ({ key: s.key, label: `Álbum: ${s.label}` })),
  { key: "finalizado", label: "Finalizado" },
];
const STAGE_LABEL: Record<string, string> = {
  aguardando_evento: "Aguardando Evento",
  ...Object.fromEntries(WORKFLOW_STEPS.map(s => [s.key, s.label])),
  ...Object.fromEntries(ALBUM_STEPS.map(s => [s.key, s.label])),
  finalizado: "Finalizado",
};

// ─── StatusPill ───────────────────────────────────────────────────────────────

function StatusPill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, borderRadius: 999, padding: "2px 8px",
      color, background: bg, whiteSpace: "nowrap" as const,
    }}>
      {label}
    </span>
  );
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
  const isDelayed = !isFinished && !client.linkSent && days > 60;
  let steps = client.hasAlbum ? [...WORKFLOW_STEPS, ...ALBUM_STEPS] : WORKFLOW_STEPS;
  if (client.semEntregaFisica) steps = steps.filter(s => s.field !== "boxDelivered");

  const dateLabel = client.weddingDate
    ? isFuture
      ? `${formatDate(client.weddingDate)} · em ${Math.abs(days)}d`
      : `${formatDate(client.weddingDate)} · ${days}d atrás`
    : "Data não definida";

  const dateColor = isFuture ? C.navy : isDelayed ? C.danger : C.textSub;

  return (
    <div
      style={{
        ...CARD,
        padding: "16px",
        display: "flex", flexDirection: "column", gap: 12,
        cursor: "pointer",
        opacity: isFinished ? 0.65 : 1,
        borderTop: isDelayed ? `3px solid ${C.danger}` : isFinished ? `3px solid ${C.success}` : `3px solid ${C.navy}`,
        transition: "box-shadow 0.15s",
      }}
      onClick={onClick}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)"}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = CARD.boxShadow}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
              {client.name}
            </span>
            <ChevronRight style={{ width: 12, height: 12, color: C.textSub, flexShrink: 0 }} />
          </div>
          {client.coupleName && (
            <div style={{ fontSize: 11, color: C.textSub, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
              {client.coupleName}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
            <span style={{ fontSize: 11, color: dateColor, fontWeight: isDelayed ? 600 : 400 }}>
              {dateLabel}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
          {isFinished ? (
            <StatusPill label="Finalizado" color="#2A8050" bg={C.successBg} />
          ) : isFuture && !client.weddingPhotographed ? (
            <StatusPill label="Aguardando Evento" color={C.navy} bg={C.navyBg} />
          ) : isDelayed ? (
            <StatusPill label="⚠ Atrasado" color={C.danger} bg={C.dangerBg} />
          ) : (
            <StatusPill label={stageLabel} color={C.navy} bg={C.navyBg} />
          )}
          {client.hasAlbum && (
            <StatusPill label="📖 Álbum" color="#4F46E5" bg="#EEF2FF" />
          )}
        </div>
      </div>

      {/* Progress */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: C.textSub }}>{done}/{total} etapas</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: pct === 100 ? C.success : C.navy }}>{pct}%</span>
        </div>
        <Progress value={pct} className="h-1.5" />
      </div>

      {/* Step buttons */}
      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5 }} onClick={e => e.stopPropagation()}>
        {steps.map(step => {
          const isDone = getClientField(client, step.field as string);
          const Icon = step.icon;
          return (
            <button
              key={step.key}
              title={step.description}
              onClick={() => onToggleStep(client.id, step.field as string, !isDone)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "4px 8px", borderRadius: 6,
                fontSize: 11, fontWeight: 600, cursor: "pointer",
                border: isDone
                  ? `1px solid ${step.color}30`
                  : `1px solid ${C.divider}`,
                background: isDone ? step.bgColor : C.itemBg,
                color: isDone ? step.color : C.textSub,
                borderStyle: step.albumStep ? "dashed" : "solid",
                transition: "all 0.1s",
              }}
            >
              <Icon style={{ width: 10, height: 10 }} />
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
      .sort((a, b) => (parseDate(a.weddingDate)?.getTime() ?? 0) - (parseDate(b.weddingDate)?.getTime() ?? 0)),
    [clients]
  );
  const years = useMemo(() => {
    const ys = new Set(pending.map(c => parseDate(c.weddingDate)?.getFullYear()).filter(Boolean));
    return Array.from(ys).sort() as number[];
  }, [pending]);

  const filtered = useMemo(() => pending.filter(c => {
    const d = parseDate(c.weddingDate);
    if (filterMonth !== "all" && d?.getMonth() !== filterMonth) return false;
    if (filterYear !== "all" && d?.getFullYear() !== filterYear) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || (c.coupleName ?? "").toLowerCase().includes(q);
    }
    return true;
  }), [pending, filterMonth, filterYear, search]);

  if (pending.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0", color: C.textSub }}>
        <Package style={{ width: 48, height: 48, margin: "0 auto 12px", opacity: 0.25 }} />
        <div style={{ fontSize: 14, fontWeight: 600 }}>Nenhuma entrega pendente</div>
        <div style={{ fontSize: 12, marginTop: 4 }}>Tudo entregue! 🎉</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Alert */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 14px", borderRadius: 10,
        background: C.amberBg, border: `1px solid #F8DCAA`,
      }}>
        <AlertTriangle style={{ width: 14, height: 14, color: C.amber, flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: "#9A5A00", fontWeight: 500 }}>
          <strong>{pending.length} entrega{pending.length > 1 ? "s" : ""} pendente{pending.length > 1 ? "s" : ""}</strong>
          {filtered.length !== pending.length && ` · mostrando ${filtered.length}`}
          {" "}— ordenadas do mais antigo
        </span>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
        <div style={{ position: "relative" as const, flex: 1, minWidth: 200 }}>
          <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: C.textSub }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar nome, casal..."
            style={{
              width: "100%", boxSizing: "border-box" as const,
              padding: "8px 12px 8px 30px", border: `1.5px solid ${C.border}`,
              borderRadius: 8, background: C.itemBg, fontSize: 12, color: C.text, outline: "none",
            }}
          />
        </div>
        <select
          value={filterYear}
          onChange={e => setFilterYear(e.target.value === "all" ? "all" : Number(e.target.value))}
          style={{ padding: "8px 10px", border: `1.5px solid ${C.border}`, borderRadius: 8, background: C.itemBg, fontSize: 12, color: C.text, outline: "none" }}
        >
          <option value="all">Todos os anos</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select
          value={filterMonth}
          onChange={e => setFilterMonth(e.target.value === "all" ? "all" : Number(e.target.value))}
          style={{ padding: "8px 10px", border: `1.5px solid ${C.border}`, borderRadius: 8, background: C.itemBg, fontSize: 12, color: C.text, outline: "none" }}
        >
          <option value="all">Todos os meses</option>
          {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0", fontSize: 13, color: C.textSub }}>
          Nenhum resultado para os filtros selecionados.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((client, index) => {
            const days = daysSince(client.weddingDate);
            const isUrgent = days > 90;
            return (
              <div
                key={client.id}
                style={{
                  ...CARD,
                  padding: "14px 16px",
                  display: "flex", alignItems: "center", gap: 14,
                  cursor: "pointer",
                  borderLeft: `4px solid ${isUrgent ? C.danger : C.divider}`,
                  borderRadius: 12,
                }}
                onClick={() => onNavigate(client.id)}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)"}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = CARD.boxShadow}
              >
                <span style={{ fontSize: 22, fontWeight: 800, color: isUrgent ? C.danger : C.divider, flexShrink: 0, minWidth: 28, textAlign: "center" as const }}>
                  {index + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                      {client.coupleName || client.name}
                    </span>
                    <ChevronRight style={{ width: 11, height: 11, color: C.textSub, flexShrink: 0 }} />
                  </div>
                  {client.coupleName && (
                    <div style={{ fontSize: 11, color: C.textSub }}>{client.name}</div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                    <Clock style={{ width: 11, height: 11, color: isUrgent ? C.danger : C.textSub }} />
                    <span style={{ fontSize: 11, color: isUrgent ? C.danger : C.textSub, fontWeight: isUrgent ? 600 : 400 }}>
                      {formatDate(client.weddingDate)} · {days} dias atrás
                    </span>
                    {client.hasAlbum && !client.albumOrdered && (
                      <span style={{ fontSize: 11, color: "#4F46E5", marginLeft: 4 }}>📖 Álbum pendente</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); onToggleStep(client.id, "boxDelivered", true); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "7px 12px", borderRadius: 8,
                    background: C.navy, border: "none",
                    fontSize: 12, fontWeight: 700, color: "#FFFFFF", cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <CheckCircle2 style={{ width: 13, height: 13 }} />
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
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "finished" | "awaiting">("active");
  const [filterMonth, setFilterMonth] = useState<number | "all">("all");
  const [filterYear, setFilterYear] = useState<number | "all">("all");
  const [filterStage, setFilterStage] = useState<string>("all");
  const [showQuickForm, setShowQuickForm] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"projetos" | "entregas">("projetos");

  const workflowClients = useMemo(() =>
    clients.filter(c => c.status === "projeto_finalizado" || c.status === "fechado"),
    [clients]
  );

  const years = useMemo(() => {
    const ys = new Set(workflowClients.map(c => parseDate(c.weddingDate)?.getFullYear()).filter(Boolean));
    return Array.from(ys).sort() as number[];
  }, [workflowClients]);

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
    if (filterStatus === "active")   list = list.filter(c => isInProgress(c));
    if (filterStatus === "finished") list = list.filter(c => isDelivered(c));
    if (filterStatus === "awaiting") list = list.filter(c => isAwaiting(c));
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
    ativos:               workflowClients.filter(c => isInProgress(c)).length,
    aguardando:           workflowClients.filter(c => isAwaiting(c)).length,
    entregaFisicaPendente:workflowClients.filter(c => c.linkSent && !c.boxDelivered && !c.semEntregaFisica).length,
    linkEnviado:          workflowClients.filter(c => c.linkSent).length,
    finalizados:          workflowClients.filter(c => isDelivered(c)).length,
    atrasados:            workflowClients.filter(c => isInProgress(c) && !c.linkSent && daysSince(c.weddingDate) > 60).length,
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 256 }}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  const statCards = [
    { label: "Em Andamento",      value: stats.ativos,                accent: C.navy,    accentBg: C.navyBg },
    { label: "Aguardando Evento", value: stats.aguardando,            accent: "#2563EB", accentBg: "#EFF6FF" },
    { label: "Entrega Pendente",  value: stats.entregaFisicaPendente, accent: stats.entregaFisicaPendente > 0 ? "#D97706" : C.gray, accentBg: stats.entregaFisicaPendente > 0 ? "#FEF3C7" : C.grayBg },
    { label: "Atrasados",         value: stats.atrasados,             accent: stats.atrasados > 0 ? C.danger : C.gray, accentBg: stats.atrasados > 0 ? C.dangerBg : C.grayBg },
    { label: "Finalizados",       value: stats.finalizados,           accent: C.success, accentBg: C.successBg },
  ];

  const filterStatusOptions = [
    { key: "all",      label: "Todos" },
    { key: "active",   label: "Em andamento", count: stats.ativos },
    { key: "awaiting", label: "Aguardando",   count: stats.aguardando },
    { key: "finished", label: "Finalizados" },
  ] as const;

  return (
    <Layout>
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Page header */}
        <div style={{ ...CARD, padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>Fluxo de Trabalho</h1>
            <p style={{ fontSize: 12, color: C.textSub, marginTop: 3 }}>Acompanhe cada projeto do evento até a entrega</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setShowReports(true)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 8,
                border: `1px solid ${C.divider}`, background: C.itemBg,
                fontSize: 12, fontWeight: 600, color: C.text, cursor: "pointer",
              }}
            >
              <FileText style={{ width: 13, height: 13 }} />
              Relatórios
            </button>
            <button
              onClick={() => setShowQuickForm(prev => !prev)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 16px", borderRadius: 8,
                border: "none", background: C.navy,
                fontSize: 12, fontWeight: 700, color: "#FFFFFF", cursor: "pointer",
              }}
            >
              <Plus style={{ width: 13, height: 13 }} />
              Novo Projeto
            </button>
          </div>
        </div>

        {/* Quick form */}
        {showQuickForm && (
          <QuickProjectForm
            onSubmit={() => setShowQuickForm(false)}
            onCancel={() => setShowQuickForm(false)}
          />
        )}

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0,1fr))", gap: 12 }}>
          {statCards.map(s => (
            <div key={s.label} style={{ ...CARD, borderTop: `3px solid ${s.accent}`, padding: "14px 16px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: C.textSub, marginBottom: 6 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.accent, lineHeight: 1 }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div>
          {/* Tab buttons */}
          <div style={{ display: "flex", gap: 0, borderBottom: `2px solid ${C.divider}`, marginBottom: 16 }}>
            {(["projetos", "entregas"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "10px 20px", border: "none", background: "none",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  color: activeTab === tab ? C.navy : C.textSub,
                  borderBottom: activeTab === tab ? `2px solid ${C.navy}` : "2px solid transparent",
                  marginBottom: -2,
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                {tab === "projetos" ? "Todos os Projetos" : "Fila de Entregas"}
                {tab === "entregas" && stats.entregaFisicaPendente > 0 && (
                  <span style={{
                    background: "#D97706", color: "#FFFFFF",
                    fontSize: 9, fontWeight: 700, borderRadius: 999, padding: "1px 5px",
                  }}>
                    {stats.entregaFisicaPendente}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab: Projetos */}
          {activeTab === "projetos" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Filter bar */}
              <div style={{ ...CARD, padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, alignItems: "center" }}>
                  {/* Search */}
                  <div style={{ position: "relative" as const, flex: 1, minWidth: 180 }}>
                    <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: C.textSub }} />
                    <input
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder="Buscar nome, casal, local..."
                      style={{
                        width: "100%", boxSizing: "border-box" as const,
                        padding: "7px 12px 7px 30px",
                        border: `1.5px solid ${C.border}`, borderRadius: 8,
                        background: C.itemBg, fontSize: 12, color: C.text, outline: "none",
                      }}
                    />
                  </div>

                  {/* Status pills */}
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" as const }}>
                    {filterStatusOptions.map(f => (
                      <button
                        key={f.key}
                        onClick={() => setFilterStatus(f.key)}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "6px 10px", borderRadius: 8,
                          fontSize: 11, fontWeight: 600, cursor: "pointer",
                          border: filterStatus === f.key ? `1px solid ${C.navy}` : `1px solid ${C.divider}`,
                          background: filterStatus === f.key ? C.navyBg : C.itemBg,
                          color: filterStatus === f.key ? C.navy : C.textSub,
                        }}
                      >
                        {f.label}
                        {"count" in f && f.count > 0 && (
                          <span style={{ background: C.navy, color: "#FFFFFF", fontSize: 9, borderRadius: 999, padding: "1px 5px" }}>
                            {f.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Year */}
                  <select
                    value={filterYear}
                    onChange={e => setFilterYear(e.target.value === "all" ? "all" : Number(e.target.value))}
                    style={{ padding: "7px 10px", border: `1.5px solid ${C.border}`, borderRadius: 8, background: C.itemBg, fontSize: 12, color: C.text, outline: "none" }}
                  >
                    <option value="all">Todos os anos</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>

                  {/* Month */}
                  <select
                    value={filterMonth}
                    onChange={e => setFilterMonth(e.target.value === "all" ? "all" : Number(e.target.value))}
                    style={{ padding: "7px 10px", border: `1.5px solid ${C.border}`, borderRadius: 8, background: C.itemBg, fontSize: 12, color: C.text, outline: "none" }}
                  >
                    <option value="all">Todos os meses</option>
                    {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                  </select>

                  {/* Stage */}
                  <select
                    value={filterStage}
                    onChange={e => setFilterStage(e.target.value)}
                    style={{ padding: "7px 10px", border: `1.5px solid ${C.border}`, borderRadius: 8, background: C.itemBg, fontSize: 12, color: C.text, outline: "none" }}
                  >
                    <option value="all">Todas as etapas</option>
                    {ALL_STAGE_OPTIONS.map(opt => (
                      <option key={opt.key} value={opt.key}>
                        {opt.label} ({stageCounts[opt.key] ?? 0})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Project grid */}
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: C.textSub }}>
                  <Camera style={{ width: 48, height: 48, margin: "0 auto 12px", opacity: 0.25 }} />
                  <div style={{ fontSize: 14 }}>Nenhum projeto encontrado</div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
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
            </div>
          )}

          {/* Tab: Fila de Entregas */}
          {activeTab === "entregas" && (
            <DeliveryQueue
              clients={workflowClients}
              onToggleStep={handleToggleStep}
              onNavigate={id => navigate(`/clients/${id}`)}
            />
          )}
        </div>
      </div>

      <ProjectDetailDialog
        client={selectedClient}
        isOpen={isDetailDialogOpen}
        onClose={() => { setIsDetailDialogOpen(false); setSelectedClient(null); }}
      />
      <WorkflowReportDialog
        open={showReports}
        onClose={() => setShowReports(false)}
        clients={workflowClients.filter(c => isInProgress(c))}
      />
    </Layout>
  );
}
