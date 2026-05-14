import { useClients } from "@/contexts/ClientsContext";
import { useAlerts } from "@/hooks/useAlerts";
import { useBusinessMetrics } from "@/hooks/useBusinessMetrics";
import { useState, useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { differenceInDays } from "date-fns";
import { stringToDate } from "@/utils/dates";
import { isFullyPaid } from "@/utils/clientUtils";
import { Client, AlertItem } from "@/utils/types";
import { useNavigate } from "react-router-dom";
import { DashboardCardModal } from "./DashboardCardModal";
import { DashboardAlertsPanel } from "./DashboardAlertsPanel";
import { FollowUpBanner } from "@/components/crm/FollowUpBanner";
import {
  TrendingUp, AlertTriangle, DollarSign, Users,
  CheckCircle2, ChevronRight, Calendar,
} from "lucide-react";

// ── Formatters ────────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(v);

const fmtDate = (d: string | Date | null) =>
  d ? new Date(d instanceof Date ? d : d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) : "—";

const fmtMonth = (d: string | Date | null) =>
  d ? new Date(d instanceof Date ? d : d + "T12:00:00").toLocaleDateString("pt-BR", { month: "short" }).replace(".", "").toUpperCase() : "";

const initials = (name: string) =>
  name.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase();

// ── Design tokens ─────────────────────────────────────────────────────────────

const CARD: React.CSSProperties = {
  background: "#FFFFFF",
  borderRadius: 14,
  boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 6px 20px rgba(0,0,0,0.07)",
  padding: "18px 20px",
};

const CARD_MOBILE: React.CSSProperties = {
  background: "#FFFFFF",
  borderRadius: 12,
  boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 14px rgba(0,0,0,0.07)",
  padding: "12px 14px",
};

const CARD_SM: React.CSSProperties = {
  background: "#FFFFFF",
  borderRadius: 12,
  boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06)",
  padding: "16px 18px",
};

const MINI_TITLE: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.10em",
  textTransform: "uppercase" as const,
  color: "#9A9590",
  marginBottom: 10,
};

const AVATAR_COLORS = [
  { bg: "#E8EEF6", color: "#1E3A5F" },
  { bg: "#FEF3DC", color: "#B07A1A" },
  { bg: "#EAF3DE", color: "#3B6D11" },
  { bg: "#FBEAF0", color: "#993556" },
  { bg: "#E1F5EE", color: "#0F6E56" },
  { bg: "#F0EEE9", color: "#5a5550" },
];
const avatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const STAGE_LABELS: Record<string, string> = {
  evento_ensaio: "Evento", copia: "Cópia", backup: "Backup",
  curadoria: "Curadoria", edicao: "Edição", edicao_base: "Ed. Base",
  edicao_final: "Ed. Final", link_pronto: "Link Pronto",
  link_enviado: "Link Enviado", entrega_fisica: "Entrega Física",
  album_em_andamento: "Álbum", projeto_finalizado: "Finalizado",
};

const STAGE_BADGE: Record<string, { bg: string; color: string }> = {
  evento_ensaio:    { bg: "#E8EEF6", color: "#1E3A5F" },
  copia:            { bg: "#FEF3DC", color: "#B07A1A" },
  backup:           { bg: "#FEF3DC", color: "#B07A1A" },
  curadoria:        { bg: "#E8EEF6", color: "#1E3A5F" },
  edicao:           { bg: "#FEF3DC", color: "#B07A1A" },
  edicao_base:      { bg: "#FEF3DC", color: "#B07A1A" },
  edicao_final:     { bg: "#FEF3DC", color: "#B07A1A" },
  link_pronto:      { bg: "#EAF3DE", color: "#3B6D11" },
  link_enviado:     { bg: "#EAF3DE", color: "#3B6D11" },
  entrega_fisica:   { bg: "#FBEAF0", color: "#993556" },
  album_em_andamento: { bg: "#FBEAF0", color: "#993556" },
  projeto_finalizado: { bg: "#F0EEE9", color: "#5F5E5A" },
};

const PROD_COLORS: Record<string, string> = {
  curadoria: "#E8A838", edicao: "#E8A838", edicao_base: "#E8A838",
  edicao_final: "#E8A838", link_pronto: "#1E3A5F", link_enviado: "#1E3A5F",
  entrega_fisica: "#52C97A", album_em_andamento: "#993556",
};

// ── Small components ─────────────────────────────────────────────────────────

function Avatar({ name, size = 30 }: { name: string; size?: number }) {
  const c = avatarColor(name);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: c.bg, color: c.color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 600, flexShrink: 0,
      letterSpacing: "0.02em",
    }}>
      {initials(name)}
    </div>
  );
}

function Badge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, letterSpacing: "0.06em",
      padding: "2px 7px", borderRadius: 20,
      background: bg, color, whiteSpace: "nowrap" as const,
    }}>
      {label}
    </span>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "#F0EDE8", margin: "12px 0" }} />;
}

function AlertDot({ color }: { color: string }) {
  return <div style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0 }} />;
}

// ── Main component ────────────────────────────────────────────────────────────

export function DashboardContent() {
  const { clients, loading } = useClients();
  const alerts = useAlerts(clients);
  const metrics = useBusinessMetrics();
  const navigate = useNavigate();

  const isMobile = useIsMobile();

  const [modal, setModal] = useState<{
    title: string; clients: Client[];
    type: "leads" | "contracts" | "delivered" | "pending" | "monthly-events";
    customData?: AlertItem[];
  } | null>(null);

  const now = new Date();

  // ── Financial ──────────────────────────────────────────────────────────────
  const receitaConfirmada = useMemo(() =>
    clients
      .filter(c => c.status === "fechado" || c.status === "projeto_finalizado")
      .reduce((s, c) => s + (c.payments?.reduce((sp, p) => sp + (p.amount || 0), 0) ?? 0), 0),
    [clients]);

  const aReceberClients = useMemo(() =>
    clients.filter(c => c.status === "fechado" && !isFullyPaid(c)),
    [clients]);

  const aReceber = useMemo(() =>
    aReceberClients.reduce((s, c) => {
      const pago = c.payments?.reduce((sp, p) => sp + (p.amount || 0), 0) ?? 0;
      return s + Math.max(0, (c.contractValue || 0) - pago);
    }, 0),
    [aReceberClients]);

  const pipelineClients = useMemo(() =>
    clients.filter(c => ["primeiro_contato", "orçamento enviado", "negociacao"].includes(c.status)),
    [clients]);

  const pipelineValue = useMemo(() =>
    pipelineClients.reduce((s, c) => s + (c.contractValue || 0), 0),
    [pipelineClients]);

  const totalAlerts = alerts.editTasks.length + alerts.deliverTasks.length + alerts.payments.length + alerts.preWedding.length;

  // Receita % do total contratado
  const totalContratado = receitaConfirmada + aReceber;
  const receitaPct = totalContratado > 0 ? Math.round((receitaConfirmada / totalContratado) * 100) : 0;

  // ── Upcoming events ────────────────────────────────────────────────────────
  const upcomingEvents = useMemo(() =>
    clients
      .filter(c => {
        if (!c.weddingDate || c.status === "contrato_perdido") return false;
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
      .slice(0, 7),
    [clients]);

  // ── Funnel ─────────────────────────────────────────────────────────────────
  const funnelData = useMemo(() => [
    { label: "Leads",      count: clients.filter(c => c.status === "primeiro_contato").length,   color: "#93B8DD", clientList: clients.filter(c => c.status === "primeiro_contato") },
    { label: "Orçamento",  count: clients.filter(c => c.status === "orçamento enviado").length,  color: "#FAC775", clientList: clients.filter(c => c.status === "orçamento enviado") },
    { label: "Follow-up",  count: clients.filter(c => c.status === "negociacao").length,          color: "#E8A838", clientList: clients.filter(c => c.status === "negociacao") },
    { label: "Fechado",    count: clients.filter(c => c.status === "fechado").length,             color: "#7EB96A", clientList: clients.filter(c => c.status === "fechado") },
    { label: "Perdido",    count: clients.filter(c => c.status === "contrato_perdido").length,    color: "#E8A0A0", clientList: clients.filter(c => c.status === "contrato_perdido") },
  ], [clients]);

  const maxFunnel = Math.max(...funnelData.map(f => f.count), 1);

  // ── Production ─────────────────────────────────────────────────────────────
  const productionStages = useMemo(() => {
    const wf = clients.filter(c => c.status === "fechado" || c.status === "projeto_finalizado");
    const counts: Record<string, Client[]> = {};
    wf.forEach(c => {
      const s = c.workflowStage || "evento_ensaio";
      if (!counts[s]) counts[s] = [];
      counts[s].push(c);
    });
    const order = ["curadoria", "edicao", "edicao_base", "edicao_final", "link_pronto", "link_enviado", "entrega_fisica", "album_em_andamento"];
    return order
      .map(key => ({ key, label: STAGE_LABELS[key] || key, clients: counts[key] || [], color: PROD_COLORS[key] || "#CBD5E1" }))
      .filter(s => s.clients.length > 0);
  }, [clients]);

  const maxProd = Math.max(...productionStages.map(s => s.clients.length), 1);

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: 90, ...CARD, opacity: 0.5 }} />
        ))}
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Follow-up banner */}
      <FollowUpBanner />

      {/* ── KPI Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, minmax(0, 1fr))", gap: isMobile ? 10 : 12 }}>

        {/* Receita Confirmada */}
        <div style={{ ...(isMobile ? CARD_MOBILE : CARD), borderTop: "3px solid #1E3A5F" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={MINI_TITLE}>Receita Confirmada</span>
            <TrendingUp size={14} color="#1E3A5F" />
          </div>
          <div style={{ fontSize: isMobile ? 18 : 24, fontWeight: 700, color: "#1a1a1a", lineHeight: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {fmt(receitaConfirmada)}
          </div>
          {!isMobile && (
          <>
          <div style={{ marginTop: 10, height: 4, borderRadius: 2, background: "#F0EDE8", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${receitaPct}%`, background: "#1E3A5F", borderRadius: 2, transition: "width .4s" }} />
          </div>
          <div style={{ fontSize: 11, color: "#9A9590", marginTop: 5 }}>{receitaPct}% do total contratado</div>
          </>
          )}
        </div>

        {/* A Receber */}
        <div
          style={{ ...(isMobile ? CARD_MOBILE : CARD), borderTop: "3px solid #E8A838", cursor: "pointer" }}
          onClick={() => setModal({ title: "A Receber — Contratos Pendentes", clients: aReceberClients, type: "pending" })}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={MINI_TITLE}>A Receber</span>
            <DollarSign size={14} color="#E8A838" />
          </div>
          <div style={{ fontSize: isMobile ? 18 : 24, fontWeight: 700, color: "#1a1a1a", lineHeight: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {fmt(aReceber)}
          </div>
          <div style={{ fontSize: 11, color: "#9A9590", marginTop: 6 }}>{aReceberClients.length} contratos pendentes</div>
          <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#1E3A5F", marginTop: 8, fontWeight: 500 }}>
            Ver detalhes <ChevronRight size={11} />
          </div>
        </div>

        {/* Pipeline */}
        <div
          style={{ ...(isMobile ? CARD_MOBILE : CARD), borderTop: "3px solid #CBD5E1", cursor: "pointer" }}
          onClick={() => setModal({ title: "Pipeline — Leads em Negociação", clients: pipelineClients, type: "leads" })}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={MINI_TITLE}>Pipeline Aberto</span>
            <Users size={14} color="#8A9BB0" />
          </div>
          <div style={{ fontSize: isMobile ? 18 : 24, fontWeight: 700, color: "#1a1a1a", lineHeight: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {fmt(pipelineValue)}
          </div>
          <div style={{ fontSize: 11, color: "#9A9590", marginTop: 6 }}>{pipelineClients.length} leads ativos</div>
          <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#1E3A5F", marginTop: 8, fontWeight: 500 }}>
            Ver leads <ChevronRight size={11} />
          </div>
        </div>

        {/* Alertas */}
        <div
          style={{ ...(isMobile ? CARD_MOBILE : CARD), borderTop: "3px solid #E05252", cursor: "pointer" }}
          onClick={() => setModal({ title: "Alertas — Pagamentos Pendentes", clients: [], type: "pending", customData: alerts.payments })}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={MINI_TITLE}>Alertas</span>
            <AlertTriangle size={14} color="#E05252" />
          </div>
          <div style={{ fontSize: isMobile ? 18 : 24, fontWeight: 700, color: totalAlerts > 0 ? "#E05252" : "#1a1a1a", lineHeight: 1 }}>
            {totalAlerts}
          </div>
          {!isMobile && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
            {[
              { label: "Pagamentos", count: alerts.payments.length, color: "#E05252" },
              { label: "Edições",    count: alerts.editTasks.length, color: "#E8A838" },
              { label: "Entregas",   count: alerts.deliverTasks.length, color: "#1E3A5F" },
              { label: "Pré-Wedding", count: alerts.preWedding.length, color: "#7C3AED" },
            ].map(({ label, count, color }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11 }}>
                <span style={{ color: "#9A9590" }}>{label}</span>
                <span style={{ fontWeight: 600, color: count > 0 ? color : "#9A9590" }}>{count}</span>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>

      {/* ── Body: 3 columns ── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 300px", gap: isMobile ? 10 : 12, alignItems: "start" }}>

        {/* ── Col 1: Foco do Dia ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>

          {/* DashboardAlertsPanel (follow-ups, contas, tarefas) */}
          <DashboardAlertsPanel />

          {/* Funil compacto */}
          <div style={{ ...CARD }}>
            <div style={{ ...MINI_TITLE, marginBottom: 12 }}>Funil de Conversão</div>
            <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 60, marginBottom: 10 }}>
              {funnelData.map(f => (
                <div
                  key={f.label}
                  onClick={() => setModal({ title: `${f.label} — Clientes`, clients: f.clientList, type: "leads" })}
                  style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 2, cursor: "pointer" }}
                  title={`${f.label}: ${f.count}`}
                >
                  <div style={{
                    width: "100%", background: f.color, borderRadius: "4px 4px 0 0",
                    height: `${Math.max(6, (f.count / maxFunnel) * 60)}px`,
                    transition: "height .3s",
                  }} />
                  <div style={{ fontSize: 9, color: "#9A9590", textAlign: "center" }}>{f.label}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#3a3530" }}>{f.count}</div>
                </div>
              ))}
            </div>
            <Divider />
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              {[
                { label: "Conversão", value: `${metrics.conversionRate.toFixed(1)}%`, color: "#3B6D11" },
                { label: "Ticket médio", value: fmt(metrics.activeContracts > 0 ? metrics.totalRevenue / metrics.activeContracts : 0), color: "#1a1a1a" },
                { label: "Perdidos", value: `${funnelData.find(f => f.label === "Perdido")?.count || 0}`, color: "#E05252" },
              ].map(m => (
                <div key={m.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: "#9A9590", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{m.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: m.color, marginTop: 2 }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Col 2: Próximos Eventos (timeline) ── */}
        <div style={{ ...CARD, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={MINI_TITLE}>Próximos Eventos</span>
            <span style={{ fontSize: 10, background: "#E8EEF6", color: "#1E3A5F", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>
              {upcomingEvents.length}
            </span>
          </div>

          {upcomingEvents.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "#9A9590", fontSize: 13 }}>
              <Calendar size={22} style={{ margin: "0 auto 8px", color: "#CBD5E1" }} />
              Nenhum evento próximo
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {upcomingEvents.map((client, idx) => {
                const stage = client.workflowStage || "evento_ensaio";
                const badge = STAGE_BADGE[stage] || { bg: "#E8EEF6", color: "#1E3A5F" };
                const d = stringToDate(client.weddingDate!) ?? now;
                const diff = differenceInDays(d, now);
                const isLate = diff < -1;
                const isSoon = diff >= 0 && diff <= 14;
                const dateBlockBg = isLate ? "#FEE8E8" : isSoon ? "#1E3A5F" : "#F0EDE8";
                const dateBlockColor = isLate ? "#E05252" : isSoon ? "#FFFFFF" : "#5a5550";
                const dateBlockMonthColor = isLate ? "#E05252" : isSoon ? "rgba(255,255,255,0.7)" : "#9A9590";

                return (
                  <div
                    key={client.id}
                    onClick={() => navigate(`/clients/${client.id}`)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "9px 0",
                      borderBottom: idx < upcomingEvents.length - 1 ? "1px solid #F0EDE8" : "none",
                      cursor: "pointer",
                    }}
                  >
                    {/* Date block */}
                    <div style={{
                      width: 38, height: 40, borderRadius: 8,
                      background: dateBlockBg,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1, color: dateBlockColor }}>
                        {new Date((client.weddingDate instanceof Date ? client.weddingDate : client.weddingDate + "T12:00:00")).getDate()}
                      </div>
                      <div style={{ fontSize: 8, fontWeight: 600, color: dateBlockMonthColor, letterSpacing: "0.06em", marginTop: 1 }}>
                        {fmtMonth(client.weddingDate)}
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {client.name}
                      </div>
                      <div style={{ fontSize: 10, color: "#9A9590", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {client.eventCategory}{client.coupleName ? ` · ${client.coupleName}` : ""}
                      </div>
                    </div>

                    {/* Badge */}
                    <Badge label={STAGE_LABELS[stage] || stage} bg={badge.bg} color={badge.color} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Col 3: Alertas urgentes + Produção ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: isMobile ? "100%" : 300, flexShrink: 0, minWidth: 0 }}>

          {/* Alertas urgentes */}
          <div style={{ ...CARD_SM }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={MINI_TITLE}>Alertas Urgentes</span>
              {totalAlerts > 0
                ? <span style={{ fontSize: 10, background: "#FEE8E8", color: "#E05252", padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>{totalAlerts}</span>
                : <span style={{ fontSize: 10, background: "#EAF3DE", color: "#3B6D11", padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>ok</span>
              }
            </div>

            {totalAlerts === 0 && (
              <div style={{ textAlign: "center", padding: "14px 0", color: "#9A9590", fontSize: 12 }}>
                <CheckCircle2 size={18} style={{ margin: "0 auto 6px", color: "#7EB96A" }} />
                Tudo em dia!
              </div>
            )}

            {alerts.payments.length > 0 && (
              <>
                <div style={{ ...MINI_TITLE, marginBottom: 6 }}>Pagamentos</div>
                {alerts.payments.slice(0, 3).map((a, i) => (
                  <div
                    key={i}
                    onClick={() => a.client && navigate(`/clients/${a.client.id}`)}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: 8, background: "#FAFAF8", marginBottom: 4, cursor: "pointer" }}
                  >
                    <AlertDot color={a.isOverdue || a.title?.toLowerCase().includes("atrasado") ? "#E05252" : "#E8A838"} />
                    <div style={{ flex: 1, fontSize: 11, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#3a3530" }}>
                      {a.client?.name || "—"}
                    </div>
                    <Badge
                      label={a.isOverdue || a.title?.toLowerCase().includes("atrasado") ? "vencido" : a.urgency === "high" ? "em breve" : "pendente"}
                      bg={a.isOverdue || a.title?.toLowerCase().includes("atrasado") ? "#FEE8E8" : a.urgency === "high" ? "#FEF3DC" : "#EFF6FF"}
                      color={a.isOverdue || a.title?.toLowerCase().includes("atrasado") ? "#E05252" : a.urgency === "high" ? "#B07A1A" : "#1E3A5F"}
                    />
                  </div>
                ))}
                {alerts.payments.length > 3 && (
                  <div
                    onClick={() => setModal({ title: "Alertas — Pagamentos Pendentes", clients: [], type: "pending", customData: alerts.payments })}
                    style={{ fontSize: 11, color: "#1E3A5F", cursor: "pointer", textAlign: "right", padding: "2px 0", fontWeight: 500 }}
                  >
                    +{alerts.payments.length - 3} mais
                  </div>
                )}
              </>
            )}

            {alerts.editTasks.length > 0 && (
              <>
                <div style={{ ...MINI_TITLE, marginBottom: 6, marginTop: alerts.payments.length > 0 ? 10 : 0 }}>Edições</div>
                {alerts.editTasks.slice(0, 3).map((a, i) => (
                  <div
                    key={i}
                    onClick={() => a.client && navigate(`/clients/${a.client.id}`)}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: 8, background: "#FAFAF8", marginBottom: 4, cursor: "pointer" }}
                  >
                    <AlertDot color="#E8A838" />
                    <div style={{ flex: 1, fontSize: 11, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#3a3530" }}>
                      {a.client?.name || "—"}
                    </div>
                    <Badge label="editar" bg="#FEF3DC" color="#B07A1A" />
                  </div>
                ))}
              </>
            )}

            {alerts.preWedding.length > 0 && (
              <>
                <div style={{ ...MINI_TITLE, marginBottom: 6, marginTop: (alerts.payments.length > 0 || alerts.editTasks.length > 0 || alerts.deliverTasks.length > 0) ? 10 : 0 }}>Pré-Wedding</div>
                {alerts.preWedding.slice(0, 3).map((a, i) => (
                  <div
                    key={i}
                    onClick={() => a.client && navigate(`/clients/${a.client.id}`)}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: 8, background: "#FAFAF8", marginBottom: 4, cursor: "pointer" }}
                  >
                    <AlertDot color="#7C3AED" />
                    <div style={{ flex: 1, fontSize: 11, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#3a3530" }}>
                      {a.client?.name || "—"}
                    </div>
                    <Badge label="agendar" bg="#F3EFFB" color="#7C3AED" />
                  </div>
                ))}
              </>
            )}
            {alerts.deliverTasks.length > 0 && (
              <>
                <div style={{ ...MINI_TITLE, marginBottom: 6, marginTop: (alerts.payments.length > 0 || alerts.editTasks.length > 0) ? 10 : 0 }}>Entregas</div>
                {alerts.deliverTasks.slice(0, 4).map((a, i) => (
                  <div
                    key={i}
                    onClick={() => a.client && navigate(`/clients/${a.client.id}`)}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: 8, background: "#FAFAF8", marginBottom: 4, cursor: "pointer" }}
                  >
                    <AlertDot color="#1E3A5F" />
                    <div style={{ flex: 1, fontSize: 11, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#3a3530" }}>
                      {a.client?.name || "—"}
                    </div>
                    <Badge label="entregar" bg="#E8EEF6" color="#1E3A5F" />
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Produção atual */}
          <div style={{ ...CARD_SM }}>
            <div style={{ ...MINI_TITLE, marginBottom: 12 }}>Produção Atual</div>
            {productionStages.length === 0 ? (
              <div style={{ textAlign: "center", padding: "14px 0", color: "#9A9590", fontSize: 12 }}>
                Nenhum projeto em produção
              </div>
            ) : (
              productionStages.map(s => (
                <div
                  key={s.key}
                  onClick={() => setModal({ title: `Projetos — ${s.label}`, clients: s.clients, type: "delivered" })}
                  style={{ marginBottom: 10, cursor: "pointer" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                    <span style={{ fontSize: 11, fontWeight: 500, color: "#3a3530" }}>{s.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.clients.length}</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: "#F0EDE8", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${(s.clients.length / maxProd) * 100}%`,
                      background: s.color,
                      borderRadius: 3,
                      transition: "width .3s",
                    }} />
                  </div>
                </div>
              ))
            )}
          </div>

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
          customData={modal.customData}
        />
      )}
    </div>
  );
}
