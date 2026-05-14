import { useEffect, useRef, useState, useCallback } from "react";
import { Bell, X, Calendar, Wallet, ListTodo, Clock, CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDashboardAlerts } from "@/hooks/useDashboardAlerts";
import { useClients } from "@/contexts/ClientsContext";
import { fetchCompanySettings } from "@/utils/supabase/settings";
import { differenceInDays } from "date-fns";
import { stringToDate } from "@/utils/dates";

// ── helpers ──────────────────────────────────────────────────────────────────
function fmtCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

// ── Seção com título ──────────────────────────────────────────────────────────
function Section({ icon, label, color, children }: {
  icon: React.ReactNode; label: string; color: string; children: React.ReactNode;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px 6px" }}>
        {icon}
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color }}>
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

// ── Item clicável ─────────────────────────────────────────────────────────────
function NotifItem({ message, sub, onClick, accent = "#374151" }: {
  message: string; sub?: string; onClick?: () => void; accent?: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "8px 14px", cursor: onClick ? "pointer" : "default",
        background: hover && onClick ? "#F9FAFB" : "transparent",
        display: "flex", alignItems: "flex-start", gap: 8, transition: "background .1s",
      }}
    >
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: accent, flexShrink: 0, marginTop: 6 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: "#1F2937", lineHeight: 1.4 }}>{message}</div>
        {sub && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{sub}</div>}
      </div>
      {onClick && <ChevronRight size={13} color="#D1D5DB" style={{ flexShrink: 0, marginTop: 4 }} />}
    </div>
  );
}

// ── Task item com checkbox ─────────────────────────────────────────────────────
function TaskItem({ text, completed, onToggle }: {
  text: string; completed: boolean; onToggle: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      style={{
        padding: "6px 14px", display: "flex", alignItems: "center", gap: 8,
        background: hover ? "#F9FAFB" : "transparent", transition: "background .1s",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button onClick={onToggle} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}>
        {completed
          ? <CheckCircle2 size={15} color="#10B981" />
          : <Circle size={15} color="#9CA3AF" />}
      </button>
      <span style={{
        fontSize: 12, color: completed ? "#9CA3AF" : "#1F2937",
        textDecoration: completed ? "line-through" : "none", flex: 1,
      }}>
        {text}
      </span>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [reminderDays, setReminderDays] = useState(90);
  const ref = useRef<HTMLDivElement>(null);
  const { clients } = useClients();
  const { followUps, bills, tasks, toggleTask } = useDashboardAlerts();

  // Fechar ao clicar fora
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fechar com Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Carregar prazo configurado
  useEffect(() => {
    fetchCompanySettings().then(s => {
      if (s?.pre_wedding_reminder_days) setReminderDays(s.pre_wedding_reminder_days);
    }).catch(() => {});
  }, []);

  // Pré-weddings não agendados
  const now = new Date();
  const preWeddingAlerts = clients.filter(c => {
    if (c.status !== "fechado") return false;
    if (c.preWeddingCompleted) return false;
    if (c.preWeddingDate) return false;
    if (!c.hasPreWedding) return false;
    const d = c.weddingDate ? stringToDate(c.weddingDate) : null;
    const diff = d ? differenceInDays(d, now) : null;
    return diff === null || diff <= reminderDays;
  });

  const pendingTasks = tasks.filter(t => !t.completed);
  const totalCount = followUps.length + bills.length + pendingTasks.length + preWeddingAlerts.length;
  const hasNew = totalCount > 0;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Botão sino */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 36, height: 36, borderRadius: 10, border: "none", cursor: "pointer",
          background: open ? "#F3F4F6" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", transition: "background .15s",
        }}
        title="Notificações"
      >
        <Bell size={16} strokeWidth={1.6} color={hasNew ? "#1F2937" : "#9CA3AF"} style={{
          animation: hasNew && !open ? "bellRing 2s ease-in-out infinite" : "none",
        }} />
        {hasNew && (
          <span style={{
            position: "absolute", top: 5, right: 5,
            width: 8, height: 8, borderRadius: "50%",
            background: "#EF4444", border: "2px solid white",
          }} />
        )}
      </button>

      {/* Painel */}
      {open && (
        <div style={{
          position: "fixed", top: 0, left: 56, bottom: 0,
          width: 340, background: "white",
          borderRight: "1px solid #E5E7EB",
          boxShadow: "4px 0 24px rgba(0,0,0,.08)",
          zIndex: 100, overflowY: "auto",
          display: "flex", flexDirection: "column",
        }}>
          {/* Header */}
          <div style={{
            padding: "16px 14px 12px",
            borderBottom: "1px solid #F3F4F6",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            position: "sticky", top: 0, background: "white", zIndex: 1,
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Notificações</div>
              {hasNew && (
                <div style={{ fontSize: 11, color: "#6B7280", marginTop: 1 }}>
                  {totalCount} {totalCount === 1 ? "pendência" : "pendências"}
                </div>
              )}
            </div>
            <button onClick={() => setOpen(false)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
              <X size={15} color="#9CA3AF" />
            </button>
          </div>

          {!hasNew && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "#9CA3AF", padding: 32 }}>
              <Bell size={32} strokeWidth={1} color="#D1D5DB" />
              <span style={{ fontSize: 13 }}>Tudo em dia! 🎉</span>
            </div>
          )}

          {/* Follow-ups */}
          {followUps.length > 0 && (
            <Section icon={<Clock size={12} color="#7C3AED" />} label="Follow-ups de hoje" color="#7C3AED">
              {followUps.map(f => (
                <NotifItem
                  key={f.id}
                  accent="#7C3AED"
                  message={`Você tem follow-up para fazer hoje com ${f.clientName}`}
                  sub={f.description || undefined}
                  onClick={() => { setOpen(false); navigate("/crm"); }}
                />
              ))}
              <div style={{ height: 1, background: "#F3F4F6", margin: "4px 0" }} />
            </Section>
          )}

          {/* Pré-wedding */}
          {preWeddingAlerts.length > 0 && (
            <Section icon={<Calendar size={12} color="#D97706" />} label="Ensaios para agendar" color="#D97706">
              {preWeddingAlerts.map(c => {
                const d = c.weddingDate ? stringToDate(c.weddingDate) : null;
                const diff = d ? differenceInDays(d, now) : null;
                return (
                  <NotifItem
                    key={c.id}
                    accent="#D97706"
                    message={`Não esqueça, você precisa agendar o ensaio de ${c.name}`}
                    sub={diff !== null ? `Casamento em ${diff} dias` : undefined}
                    onClick={() => { setOpen(false); navigate(`/clients/${c.id}`); }}
                  />
                );
              })}
              <div style={{ height: 1, background: "#F3F4F6", margin: "4px 0" }} />
            </Section>
          )}

          {/* Contas a vencer */}
          {bills.length > 0 && (
            <Section icon={<Wallet size={12} color="#DC2626" />} label="Contas a vencer" color="#DC2626">
              {bills.map(b => (
                <NotifItem
                  key={b.id}
                  accent={b.daysUntilDue === 0 ? "#DC2626" : b.daysUntilDue <= 3 ? "#F59E0B" : "#6B7280"}
                  message={
                    b.daysUntilDue === 0
                      ? `Fica ligado, ${b.description} vence hoje!`
                      : `Fica ligado, ${b.description} vence em ${b.daysUntilDue} ${b.daysUntilDue === 1 ? "dia" : "dias"}`
                  }
                  sub={`${fmtCurrency(b.amount)} · ${b.source === "business" ? "Empresa" : "Pessoal"}`}
                  onClick={() => { setOpen(false); navigate(b.source === "business" ? "/cash-flow" : "/personal"); }}
                />
              ))}
              <div style={{ height: 1, background: "#F3F4F6", margin: "4px 0" }} />
            </Section>
          )}

          {/* Tarefas */}
          {tasks.length > 0 && (
            <Section icon={<ListTodo size={12} color="#2563EB" />} label="Suas tarefas do dia" color="#2563EB">
              {pendingTasks.length === 0
                ? <div style={{ padding: "6px 14px 10px", fontSize: 12, color: "#9CA3AF", fontStyle: "italic" }}>Todas as tarefas concluídas!</div>
                : pendingTasks.map(t => (
                    <TaskItem key={t.id} text={t.text} completed={t.completed} onToggle={() => toggleTask(t.id, !t.completed)} />
                  ))
              }
              {tasks.filter(t => t.completed).slice(0, 2).map(t => (
                <TaskItem key={t.id} text={t.text} completed={t.completed} onToggle={() => toggleTask(t.id, !t.completed)} />
              ))}
            </Section>
          )}

        </div>
      )}

      {/* Animação sino */}
      <style>{`
        @keyframes bellRing {
          0%, 100% { transform: rotate(0deg); }
          10%, 30% { transform: rotate(-12deg); }
          20%, 40% { transform: rotate(12deg); }
          50% { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
