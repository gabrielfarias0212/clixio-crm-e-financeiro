import { useClients } from "@/contexts/ClientsContext";
import { useAlerts } from "@/hooks/useAlerts";
import { useBusinessMetrics } from "@/hooks/useBusinessMetrics";
import { useState, useMemo, useEffect } from "react";
import { differenceInDays, isToday, isPast, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { stringToDate, formatDate } from "@/utils/dates";
import { isFullyPaid } from "@/utils/clientUtils";
import { Client } from "@/utils/types";
import { useNavigate } from "react-router-dom";
import { DashboardCardModal } from "./DashboardCardModal";
import { fetchAllPendingFollowups, completeFollowup, CRMFollowup } from "@/utils/supabase/crm-activities";
import { fetchCompanySettings, CompanySettings } from "@/utils/supabase/settings";
import {
  TrendingUp, AlertTriangle, CheckCircle2,
  Calendar, ChevronRight, DollarSign, Users,
  Bell, Check, Camera
} from "lucide-react";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(v);

const fmtDate = (d: string | Date | null) =>
  d ? formatDate(d, "dd/MM") : "—";

const initials = (name: string) =>
  name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

const AVATAR_COLORS = [
  { bg: "#EEEDFE", color: "#534AB7" }, { bg: "#E6F1FB", color: "#185FA5" },
  { bg: "#EAF3DE", color: "#3B6D11" }, { bg: "#FBEAF0", color: "#993556" },
  { bg: "#FAEEDA", color: "#854F0B" }, { bg: "#E1F5EE", color: "#0F6E56" },
];
const avatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const STAGE_LABELS: Record<string, string> = {
  evento_ensaio: "Evento", copia: "Cópia", backup: "Backup",
  curadoria: "Curadoria", edicao: "Edição", edicao_base: "Ed. Base",
  edicao_final: "Ed. Final", link_pronto: "Link pronto",
  link_enviado: "Link enviado", entrega_fisica: "Entrega física",
  album_em_andamento: "Álbum", projeto_finalizado: "Finalizado",
};

const STAGE_COLORS: Record<string, { bg: string; color: string }> = {
  evento_ensaio:    { bg: "#E6F1FB", color: "#185FA5" },
  copia:            { bg: "#FAEEDA", color: "#854F0B" },
  backup:           { bg: "#FAEEDA", color: "#854F0B" },
  curadoria:        { bg: "#E6F1FB", color: "#185FA5" },
  edicao:           { bg: "#FAEEDA", color: "#854F0B" },
  edicao_base:      { bg: "#FAEEDA", color: "#854F0B" },
  edicao_final:     { bg: "#FAEEDA", color: "#854F0B" },
  link_pronto:      { bg: "#EAF3DE", color: "#3B6D11" },
  link_enviado:     { bg: "#EAF3DE", color: "#3B6D11" },
  entrega_fisica:   { bg: "#FBEAF0", color: "#993556" },
  album_em_andamento: { bg: "#FBEAF0", color: "#993556" },
  projeto_finalizado: { bg: "#F1EFE8", color: "#5F5E5A" },
};



function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  const c = avatarColor(name);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: c.bg, color: c.color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 500, flexShrink: 0,
    }}>{initials(name)}</div>
  );
}

function Chip({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 10, background: bg, color, fontWeight: 500, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

function SectionCard({ children, style, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return (
    <div style={{
      background: "var(--color-background-primary)",
      border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: "var(--border-radius-lg)",
      padding: "14px 16px",
      ...style,
    }} onClick={onClick}>{children}</div>
  );
}

function SectionHeader({ title, badge }: { title: string; badge?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
      <span style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: ".04em" }}>{title}</span>
      {badge}
    </div>
  );
}

function Divider() {
  return <div style={{ height: "0.5px", background: "var(--color-border-tertiary)", margin: "8px 0" }} />;
}

function ModalTriggerRow({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 10, padding: "7px 0",
      borderBottom: "0.5px solid var(--color-border-tertiary)", cursor: "pointer",
    }}
      onMouseEnter={e => (e.currentTarget.style.background = "var(--color-background-secondary)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >{children}</div>
  );
}

export function DashboardContent() {
  const { clients, loading } = useClients();
  const alerts = useAlerts(clients);
  const metrics = useBusinessMetrics();
  const navigate = useNavigate();

  const [modal, setModal] = useState<{ title: string; clients: Client[]; type: "leads" | "contracts" | "delivered" | "pending" | "monthly-events" } | null>(null);
  const [followups, setFollowups] = useState<CRMFollowup[]>([]);
  const [goals, setGoals] = useState<CompanySettings>({});
  const [completingId, setCompletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAllPendingFollowups().then(setFollowups).catch(() => {});
    fetchCompanySettings().then(s => { if (s) setGoals(s); }).catch(() => {});
  }, []);

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // ── Financial data ──
  const receitaConfirmada = useMemo(() => {
    return clients
      .filter(c => c.status === "fechado" || c.status === "projeto_finalizado")
      .reduce((s, c) => {
        const pago = c.payments?.filter(p => p.payment_status === 'pago').reduce((sp, p) => sp + (p.amount || 0), 0) ?? 0;
        return s + pago;
      }, 0);
  }, [clients]);

  const aReceberClients = useMemo(() =>
    clients.filter(c => (c.status === "fechado") && !isFullyPaid(c)),
    [clients]);

  const aReceber = useMemo(() =>
    aReceberClients.reduce((s, c) => {
      const pago = c.payments?.filter(p => p.payment_status === 'pago').reduce((sp, p) => sp + (p.amount || 0), 0) ?? 0;
      return s + Math.max(0, (c.contractValue || 0) - pago);
    }, 0),
    [aReceberClients]);

  const pipelineClients = useMemo(() =>
    clients.filter(c => ["primeiro_contato", "orcamento_enviado", "negociacao"].includes(c.salesFunnelStage ?? "")),
    [clients]);

  const pipelineValue = useMemo(() =>
    pipelineClients.reduce((s, c) => s + (c.contractValue || 0), 0),
    [pipelineClients]);

  const totalAlerts = alerts.editTasks.length + alerts.deliverTasks.length + alerts.payments.length;

  // ── Follow-ups do dia ──
  const todayFollowups = useMemo(() => {
    return followups.filter(f => {
      const d = parseISO(f.scheduled_date);
      return isToday(d) || isPast(d);
    }).sort((a, b) => parseISO(a.scheduled_date).getTime() - parseISO(b.scheduled_date).getTime());
  }, [followups]);

  const handleCompleteFollowup = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletingId(id);
    try {
      await completeFollowup(id);
      setFollowups(prev => prev.filter(f => f.id !== id));
    } finally {
      setCompletingId(null);
    }
  };

  // ── Ensaios pré não agendados ──
  const ensaiosPendentes = useMemo(() => {
    const reminderDays = goals.pre_wedding_reminder_days != null ? Number(goals.pre_wedding_reminder_days) : 90;
    return clients.filter(c => {
      if (!c.hasPreWedding) return false;
      if (c.salesFunnelStage !== "contrato_fechado") return false;
      if (c.preWeddingScheduled) return false;
      if (!c.weddingDate) return false;
      const d = stringToDate(c.weddingDate);
      if (!d) return false;
      const diff = differenceInDays(d, now);
      return diff >= 0 && diff <= reminderDays;
    }).sort((a, b) => {
      const da = stringToDate(a.weddingDate!) ?? new Date(0);
      const db = stringToDate(b.weddingDate!) ?? new Date(0);
      return da.getTime() - db.getTime();
    });
  }, [clients, goals]);

  // ── Meta financeira ──
  const monthlyGoal = goals.monthly_revenue_goal ? Number(goals.monthly_revenue_goal) : 0;
  const metaPct = monthlyGoal > 0 ? Math.min(100, (receitaConfirmada / monthlyGoal) * 100) : 0;
  const metaColor = receitaConfirmada >= monthlyGoal && monthlyGoal > 0 ? "#639922" : metaPct >= 70 ? "#EF9F27" : monthlyGoal > 0 ? "#E24B4A" : "#639922";

  // ── Upcoming events ──
  const upcomingEvents = useMemo(() => {
    return clients
      .filter(c => {
        if (!c.weddingDate) return false;
        if (c.salesFunnelStage === "contrato_perdido") return false;
        const d = stringToDate(c.weddingDate);
        if (!d) return false;
        const diff = differenceInDays(d, now);
        return diff >= -7 && diff <= 180;
      })
      .sort((a, b) => {
        const da = stringToDate(a.weddingDate!) ?? new Date(0);
        const db = stringToDate(b.weddingDate!) ?? new Date(0);
        return da.getTime() - db.getTime();
      })
      .slice(0, 6);
  }, [clients]);

  // ── Funnel ──
  const funnelData = useMemo(() => {
    // Usa salesFunnelStage — mesma fonte do CRM Kanban
    return [
      { label: "Leads",      color: "#85B7EB", stage: "primeiro_contato",  clientList: clients.filter(c => c.salesFunnelStage === "primeiro_contato") },
      { label: "Orçamento",  color: "#FAC775", stage: "orcamento_enviado", clientList: clients.filter(c => c.salesFunnelStage === "orcamento_enviado") },
      { label: "Follow-up",  color: "#EF9F27", stage: "negociacao",        clientList: clients.filter(c => c.salesFunnelStage === "negociacao") },
      { label: "Fechado",    color: "#97C459", stage: "contrato_fechado",  clientList: clients.filter(c => c.salesFunnelStage === "contrato_fechado") },
      { label: "Perdido",    color: "#E24B4A", stage: "contrato_perdido",  clientList: clients.filter(c => c.salesFunnelStage === "contrato_perdido") },
    ].map(f => ({ ...f, count: f.clientList.length }));
  }, [clients]);

  const maxFunnel = Math.max(...funnelData.map(f => f.count), 1);

  // ── Production ──
  const productionStages = useMemo(() => {
    const workflowClients = clients.filter(c => c.status === "fechado" || c.status === "projeto_finalizado");
    const stageCounts: Record<string, Client[]> = {};
    workflowClients.forEach(c => {
      const s = c.workflowStage || "evento_ensaio";
      if (!stageCounts[s]) stageCounts[s] = [];
      stageCounts[s].push(c);
    });
    const order = ["curadoria", "edicao", "edicao_base", "edicao_final", "link_pronto", "link_enviado", "entrega_fisica", "album_em_andamento"];
    return order.map(key => ({ key, label: STAGE_LABELS[key] || key, clients: stageCounts[key] || [], color: STAGE_COLORS[key]?.bg || "#E6F1FB", textColor: STAGE_COLORS[key]?.color || "#185FA5" }))
      .filter(s => s.clients.length > 0);
  }, [clients]);

  const maxProd = Math.max(...productionStages.map(s => s.clients.length), 1);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[1, 2, 3].map(i => <div key={i} style={{ height: 96, background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)", animation: "pulse 1.5s infinite" }} />)}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Row 1: 4 financial cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>

        {/* Receita confirmada + Meta */}
        <SectionCard style={{ borderTop: "2px solid #639922", cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "var(--color-text-secondary)", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".04em" }}>Receita confirmada</span>
            <TrendingUp size={14} style={{ color: "#639922", flexShrink: 0 }} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 500, lineHeight: 1 }}>{fmt(receitaConfirmada)}</div>
          <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 4 }}>pagamentos recebidos</div>
          {monthlyGoal > 0 ? (
            <>
              <div style={{ height: 4, background: "var(--color-background-secondary)", borderRadius: 2, overflow: "hidden", marginTop: 8 }}>
                <div style={{ height: "100%", width: `${metaPct}%`, background: metaColor, borderRadius: 2, transition: "width .4s" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--color-text-secondary)", marginTop: 3 }}>
                <span style={{ color: metaColor, fontWeight: 500 }}>{Math.round(metaPct)}% da meta</span>
                <span>Meta: {fmt(monthlyGoal)}</span>
              </div>
            </>
          ) : (
            <>
              <div style={{ height: 4, background: "var(--color-background-secondary)", borderRadius: 2, overflow: "hidden", marginTop: 8 }}>
                <div style={{ height: "100%", width: `${Math.min(100, (receitaConfirmada / Math.max(receitaConfirmada + aReceber, 1)) * 100)}%`, background: "#639922", borderRadius: 2 }} />
              </div>
              <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginTop: 3 }}>
                {Math.round((receitaConfirmada / Math.max(receitaConfirmada + aReceber, 1)) * 100)}% do total contratado
              </div>
            </>
          )}
        </SectionCard>

        {/* A receber */}
        <SectionCard style={{ borderTop: "2px solid #EF9F27", cursor: "pointer" }}>
          <div onClick={() => setModal({ title: "A Receber — Contratos Pendentes", clients: aReceberClients, type: "pending" })}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "var(--color-text-secondary)", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".04em" }}>A receber</span>
              <DollarSign size={14} style={{ color: "#EF9F27", flexShrink: 0 }} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 500, lineHeight: 1 }}>{fmt(aReceber)}</div>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 4 }}>{aReceberClients.length} contratos pendentes</div>
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#185FA5" }}>
              <span>Ver detalhes</span><ChevronRight size={12} />
            </div>
          </div>
        </SectionCard>

        {/* Pipeline */}
        <SectionCard style={{ borderTop: "2px solid #378ADD", cursor: "pointer" }}>
          <div onClick={() => setModal({ title: "Pipeline — Leads em Negociação", clients: pipelineClients, type: "leads" })}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "var(--color-text-secondary)", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".04em" }}>Pipeline aberto</span>
              <Users size={14} style={{ color: "#378ADD", flexShrink: 0 }} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 500, lineHeight: 1 }}>{fmt(pipelineValue)}</div>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 4 }}>{pipelineClients.length} leads ativos</div>
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#185FA5" }}>
              <span>Ver leads</span><ChevronRight size={12} />
            </div>
          </div>
        </SectionCard>

        {/* Alertas */}
        <SectionCard style={{ borderTop: "2px solid #E24B4A", cursor: "pointer" }}
          onClick={() => setModal({ title: "Alertas — Pagamentos Pendentes", clients: alerts.payments.map(a => a.client!).filter(Boolean) as Client[], type: "pending" })}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "var(--color-text-secondary)", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".04em" }}>Alertas</span>
            <AlertTriangle size={14} style={{ color: "#E24B4A", flexShrink: 0 }} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 500, lineHeight: 1, color: "#A32D2D" }}>{totalAlerts}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <span style={{ color: "var(--color-text-secondary)" }}>Pagamentos</span>
              <span style={{ color: "#A32D2D", fontWeight: 500 }}>{alerts.payments.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <span style={{ color: "var(--color-text-secondary)" }}>Edições</span>
              <span style={{ color: "#854F0B", fontWeight: 500 }}>{alerts.editTasks.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <span style={{ color: "var(--color-text-secondary)" }}>Entregas</span>
              <span style={{ color: "#185FA5", fontWeight: 500 }}>{alerts.deliverTasks.length}</span>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ── Row 2: Follow-ups do dia ── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
        <SectionCard style={{ borderLeft: todayFollowups.length > 0 ? "3px solid #EF9F27" : "3px solid var(--color-border-tertiary)" }}>
          <SectionHeader title="Follow-ups do dia" badge={
            todayFollowups.length > 0
              ? <span style={{ fontSize: 11, background: "#FAEEDA", color: "#854F0B", padding: "2px 8px", borderRadius: 20, fontWeight: 500 }}>
                  {todayFollowups.length} pendente{todayFollowups.length > 1 ? "s" : ""}
                </span>
              : <span style={{ fontSize: 11, background: "#EAF3DE", color: "#3B6D11", padding: "2px 8px", borderRadius: 20, fontWeight: 500 }}>em dia</span>
          } />
          {todayFollowups.length === 0 ? (
            <div style={{ textAlign: "center", padding: "16px 0", color: "var(--color-text-secondary)", fontSize: 13 }}>
              <CheckCircle2 size={20} style={{ margin: "0 auto 6px", color: "#639922" }} />
              Nenhum follow-up pendente para hoje
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {todayFollowups.slice(0, 5).map(f => {
                const clientName = (f as any).wedding_clients?.name ?? "Cliente";
                const dDate = parseISO(f.scheduled_date);
                const isOverdue = isPast(dDate) && !isToday(dDate);
                return (
                  <div key={f.id} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "7px 0",
                    borderBottom: "0.5px solid var(--color-border-tertiary)",
                  }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                      background: isOverdue ? "#FCEBEB" : "#FAEEDA",
                      color: isOverdue ? "#A32D2D" : "#854F0B",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Bell size={12} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{clientName}</div>
                      {f.description && <div style={{ fontSize: 11, color: "var(--color-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.description}</div>}
                    </div>
                    <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
                      {isOverdue && <Chip label="atrasado" bg="#FCEBEB" color="#A32D2D" />}
                      {!isOverdue && <Chip label="hoje" bg="#FAEEDA" color="#854F0B" />}
                      <button
                        onClick={e => handleCompleteFollowup(f.id, e)}
                        disabled={completingId === f.id}
                        style={{
                          width: 24, height: 24, borderRadius: "50%", border: "1.5px solid #639922",
                          background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#639922", opacity: completingId === f.id ? 0.5 : 1,
                        }}
                        title="Marcar como concluído"
                      >
                        <Check size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
              {todayFollowups.length > 5 && (
                <div style={{ fontSize: 11, color: "#185FA5", padding: "6px 0", cursor: "pointer" }}
                  onClick={() => navigate("/crm")}>
                  +{todayFollowups.length - 5} mais → ver no CRM
                </div>
              )}
            </div>
          )}
        </SectionCard>

        {/* Resumo do dia */}
        <SectionCard>
          <SectionHeader title="Resumo do dia" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { icon: <Calendar size={14} />, label: "Eventos este mês", value: upcomingEvents.filter(c => {
                const d = stringToDate(c.weddingDate!);
                return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              }).length, color: "#185FA5", bg: "#E6F1FB" },
              { icon: <Users size={14} />, label: "Em negociação", value: pipelineClients.length, color: "#854F0B", bg: "#FAEEDA" },
              { icon: <Bell size={14} />, label: "Follow-ups pendentes", value: followups.length, color: "#854F0B", bg: "#FAEEDA" },
              { icon: <Camera size={14} />, label: "Ensaios pré a agendar", value: ensaiosPendentes.length, color: "#534AB7", bg: "#EEEDFE" },
              { icon: <AlertTriangle size={14} />, label: "Alertas totais", value: totalAlerts, color: "#A32D2D", bg: "#FCEBEB" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: item.bg, color: item.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{item.label}</div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: item.value > 0 ? item.color : "var(--color-text-secondary)" }}>{item.value}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ── Ensaios pré não agendados ── */}
      {ensaiosPendentes.length > 0 && (
        <SectionCard style={{ borderLeft: "3px solid #7C3AED" }}>
          <SectionHeader
            title="Ensaios pré a agendar"
            badge={
              <span style={{ fontSize: 11, background: "#EEEDFE", color: "#534AB7", padding: "2px 8px", borderRadius: 20, fontWeight: 500 }}>
                {ensaiosPendentes.length} pendente{ensaiosPendentes.length > 1 ? "s" : ""}
              </span>
            }
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {ensaiosPendentes.map(c => {
              const reminderDays = goals.pre_wedding_reminder_days != null ? Number(goals.pre_wedding_reminder_days) : 90;
              const d = stringToDate(c.weddingDate!);
              const diff = d ? differenceInDays(d, now) : 0;
              const urgent = diff <= 30;
              return (
                <div key={c.id} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
                  borderBottom: "0.5px solid var(--color-border-tertiary)", cursor: "pointer",
                }}
                  onClick={() => navigate(`/clients/${c.id}`)}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--color-background-secondary)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                    background: urgent ? "#FCEBEB" : "#EEEDFE",
                    color: urgent ? "#A32D2D" : "#534AB7",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Camera size={13} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
                      Evento: {fmtDate(c.weddingDate)} · {diff} dias restantes
                    </div>
                  </div>
                  <Chip
                    label={urgent ? "urgente" : `${diff}d`}
                    bg={urgent ? "#FCEBEB" : "#EEEDFE"}
                    color={urgent ? "#A32D2D" : "#534AB7"}
                  />
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 8 }}>
            Clique no cliente para agendar o ensaio. Configure o prazo em{" "}
            <span style={{ color: "#534AB7", cursor: "pointer" }} onClick={() => navigate("/settings")}>
              Configurações → Prazos
            </span>
          </div>
        </SectionCard>
      )}

      {/* ── Row 3: Events + Funnel | Alerts + Production ── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>

        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Próximos eventos */}
          <SectionCard>
            <SectionHeader title="Próximos eventos" badge={
              <span style={{ fontSize: 11, background: "#E6F1FB", color: "#185FA5", padding: "2px 8px", borderRadius: 20, fontWeight: 500 }}>
                {upcomingEvents.length} eventos
              </span>
            } />
            {upcomingEvents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "var(--color-text-secondary)", fontSize: 13 }}>Nenhum evento próximo</div>
            ) : upcomingEvents.map(client => {
              const stage = client.workflowStage || "evento_ensaio";
              const stageColor = STAGE_COLORS[stage] || { bg: "#E6F1FB", color: "#185FA5" };
              const diff = differenceInDays(stringToDate(client.weddingDate!) ?? now, now);
              const isLate = diff < -1;
              return (
                <div key={client.id}
                  onClick={() => navigate(`/clients/${client.id}`)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "0.5px solid var(--color-border-tertiary)", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--color-background-secondary)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <Avatar name={client.name} size={30} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{client.name}</div>
                    <div style={{ fontSize: 11, color: "var(--color-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {client.eventCategory}{client.coupleName ? ` · ${client.coupleName}` : ""}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: isLate ? "#A32D2D" : "var(--color-text-primary)" }}>{fmtDate(client.weddingDate)}</div>
                    <Chip label={STAGE_LABELS[stage] || stage} bg={stageColor.bg} color={stageColor.color} />
                  </div>
                </div>
              );
            })}
          </SectionCard>

          {/* Funil de conversão */}
          <SectionCard>
            <SectionHeader title="Funil de conversão" badge={
              <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{new Date().getFullYear()}</span>
            } />
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 72, marginBottom: 8 }}>
              {funnelData.map(f => (
                <div key={f.label}
                  onClick={() => setModal({ title: `${f.label} — Clientes`, clients: f.clientList, type: "leads" })}
                  style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 3, cursor: "pointer" }}
                >
                  <div style={{ width: "100%", background: f.color, borderRadius: "4px 4px 0 0", height: `${Math.max(8, (f.count / maxFunnel) * 72)}px`, transition: "height .2s" }} />
                  <div style={{ fontSize: 10, color: "var(--color-text-secondary)", textAlign: "center" }}>{f.label}</div>
                  <div style={{ fontSize: 11, fontWeight: 500 }}>{f.count}</div>
                </div>
              ))}
            </div>
            <Divider />
            {(() => {
              const fechados  = funnelData.find(f => f.stage === "contrato_fechado")?.count || 0;
              const finalizados = clients.filter(c => c.salesFunnelStage === "projeto_finalizado").length;
              const totalFunnel = funnelData.reduce((s, f) => s + (f.stage !== "contrato_perdido" ? f.count : 0), 0) + finalizados;
              const convRate = totalFunnel > 0 ? ((fechados + finalizados) / totalFunnel * 100).toFixed(1) : "0.0";
              const ticketClients = clients.filter(c => c.salesFunnelStage === "contrato_fechado" || c.salesFunnelStage === "projeto_finalizado");
              const totalContratado = ticketClients.reduce((s, c) => s + (c.contractValue || 0), 0);
              const ticket = ticketClients.length > 0 ? totalContratado / ticketClients.length : 0;
              const perdidos = funnelData.find(f => f.stage === "contrato_perdido")?.count || 0;
              return (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  {[
                    { label: "Conversão", value: `${convRate}%`, color: "#3B6D11" },
                    { label: "Ticket médio", value: fmt(ticket), color: "var(--color-text-primary)" },
                    { label: "Perdidos", value: `${perdidos}`, color: "#A32D2D" },
                  ].map(m => (
                    <div key={m.label} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>{m.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: m.color }}>{m.value}</div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </SectionCard>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Alertas urgentes */}
          <SectionCard>
            <SectionHeader title="Alertas urgentes" badge={
              totalAlerts > 0
                ? <span style={{ fontSize: 11, background: "#FCEBEB", color: "#A32D2D", padding: "2px 8px", borderRadius: 20, fontWeight: 500 }}>{totalAlerts} pendentes</span>
                : <span style={{ fontSize: 11, background: "#EAF3DE", color: "#3B6D11", padding: "2px 8px", borderRadius: 20, fontWeight: 500 }}>tudo ok</span>
            } />

            {alerts.payments.length > 0 && (
              <>
                <div style={{ fontSize: 10, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 4 }}>Pagamentos</div>
                {alerts.payments.slice(0, 3).map((a, i) => (
                  <div key={i}
                    onClick={() => a.client && navigate(`/clients/${a.client.id}`)}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "0.5px solid var(--color-border-tertiary)", cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--color-background-secondary)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#E24B4A", flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.client?.name || "—"}</div>
                    <Chip label="vencido" bg="#FCEBEB" color="#A32D2D" />
                  </div>
                ))}
                {alerts.payments.length > 3 && (
                  <div onClick={() => setModal({ title: "Pagamentos Pendentes", clients: alerts.payments.map(a => a.client!).filter(Boolean) as Client[], type: "pending" })}
                    style={{ fontSize: 11, color: "#185FA5", cursor: "pointer", padding: "4px 0", textAlign: "right" }}>
                    +{alerts.payments.length - 3} mais
                  </div>
                )}
              </>
            )}

            {alerts.editTasks.length > 0 && (
              <>
                <div style={{ fontSize: 10, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: ".04em", margin: "8px 0 4px" }}>Edições</div>
                {alerts.editTasks.slice(0, 3).map((a, i) => (
                  <div key={i}
                    onClick={() => a.client && navigate(`/clients/${a.client.id}`)}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "0.5px solid var(--color-border-tertiary)", cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--color-background-secondary)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF9F27", flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.client?.name || "—"}</div>
                    <Chip label="editar" bg="#FAEEDA" color="#854F0B" />
                  </div>
                ))}
              </>
            )}

            {alerts.deliverTasks.length > 0 && (
              <>
                <div style={{ fontSize: 10, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: ".04em", margin: "8px 0 4px" }}>Entregas</div>
                {alerts.deliverTasks.slice(0, 3).map((a, i) => (
                  <div key={i}
                    onClick={() => a.client && navigate(`/clients/${a.client.id}`)}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "0.5px solid var(--color-border-tertiary)", cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--color-background-secondary)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#378ADD", flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.client?.name || "—"}</div>
                    <Chip label="entregar" bg="#E6F1FB" color="#185FA5" />
                  </div>
                ))}
              </>
            )}

            {totalAlerts === 0 && (
              <div style={{ textAlign: "center", padding: "16px 0", color: "var(--color-text-secondary)", fontSize: 13 }}>
                <CheckCircle2 size={20} style={{ margin: "0 auto 6px", color: "#639922" }} />
                Tudo em dia!
              </div>
            )}
          </SectionCard>

          {/* Produção atual */}
          <SectionCard>
            <SectionHeader title="Produção atual" />
            {productionStages.length === 0 ? (
              <div style={{ textAlign: "center", padding: "16px 0", color: "var(--color-text-secondary)", fontSize: 13 }}>Nenhum projeto em produção</div>
            ) : productionStages.map(s => (
              <div key={s.key}
                onClick={() => setModal({ title: `Projetos — ${s.label}`, clients: s.clients, type: "delivered" })}
                style={{ marginBottom: 8, cursor: "pointer" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                  <span>{s.label}</span>
                  <span style={{ fontWeight: 500 }}>{s.clients.length}</span>
                </div>
                <div style={{ height: 4, background: "var(--color-background-secondary)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(s.clients.length / maxProd) * 100}%`, background: s.textColor, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </SectionCard>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <DashboardCardModal
          title={modal.title}
          open={!!modal}
          onClose={() => setModal(null)}
          clients={modal.clients}
          type={modal.type}
        />
      )}
    </div>
  );
}
