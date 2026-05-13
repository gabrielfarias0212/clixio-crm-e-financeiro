import { useState, useRef, KeyboardEvent } from "react";
import { CheckCircle2, Trash2, Plus, AlertTriangle, Clock, Wallet, ListTodo, Circle } from "lucide-react";
import { useDashboardAlerts, FollowUpAlert, BillAlert, DashboardTask } from "@/hooks/useDashboardAlerts";

// ── Design tokens (alinhados ao novo dashboard) ───────────────────────────────

const COLORS = {
  text:        "#1a1a1a",
  textSub:     "#9A9590",
  divider:     "#F0EDE8",
  itemBg:      "#FAFAF8",
  inputBorder: "#E8E4DE",
  primary:     "#1E3A5F",
  warning:     "#E8A838",
  danger:      "#E05252",
  success:     "#52C97A",
  dangerBg:    "#FEE8E8",
  warningBg:   "#FEF3DC",
  successBg:   "#E6F9EE",
};

const MINI_TITLE: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.10em",
  textTransform: "uppercase" as const,
  color: COLORS.textSub,
  marginBottom: 8,
  display: "flex",
  alignItems: "center",
  gap: 5,
};

function fmtCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function parseDateLocal(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function fmtDateBR(str: string) {
  return parseDateLocal(str).toLocaleDateString("pt-BR");
}

// ── Empty state ───────────────────────────────────────────────────────────────

function Empty({ text }: { text: string }) {
  return (
    <div style={{ fontSize: 12, color: COLORS.textSub, padding: "3px 0", fontStyle: "italic" }}>
      {text}
    </div>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────

function Divider() {
  return <div style={{ height: 1, background: COLORS.divider }} />;
}

// ── Follow-ups ────────────────────────────────────────────────────────────────

function FollowUpsSection({ items, onComplete }: { items: FollowUpAlert[]; onComplete: (id: string) => void }) {
  return (
    <div>
      <div style={MINI_TITLE}>
        <Clock size={11} color={COLORS.textSub} />
        Follow-ups
        {items.length > 0 && (
          <span style={{ background: COLORS.warningBg, color: "#B07A1A", borderRadius: 999, padding: "1px 6px", fontSize: 9, fontWeight: 700 }}>
            {items.length}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <Empty text="Nenhum follow-up pendente para hoje" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {items.map((f) => (
            <div key={f.id} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 10px", borderRadius: 8,
              background: f.daysOverdue > 0 ? COLORS.dangerBg : COLORS.itemBg,
              border: `1px solid ${f.daysOverdue > 0 ? "#FECDCD" : COLORS.divider}`,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12, fontWeight: 600, color: COLORS.text,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {f.clientName}
                </div>
                {f.description && (
                  <div style={{
                    fontSize: 11, color: COLORS.textSub, marginTop: 1,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {f.description}
                  </div>
                )}
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, whiteSpace: "nowrap",
                color: f.daysOverdue > 0 ? COLORS.danger : COLORS.warning,
                background: f.daysOverdue > 0 ? COLORS.dangerBg : COLORS.warningBg,
                padding: "2px 7px", borderRadius: 20,
              }}>
                {fmtDateBR(f.scheduledDate)}
              </span>
              <button
                onClick={() => onComplete(f.id)}
                title="Marcar como feito"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 2, flexShrink: 0 }}
              >
                <CheckCircle2 size={15} color={f.daysOverdue > 0 ? COLORS.danger : COLORS.success} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Contas a Vencer ───────────────────────────────────────────────────────────

function BillsSection({ items }: { items: BillAlert[] }) {
  return (
    <div>
      <div style={MINI_TITLE}>
        <Wallet size={11} color={COLORS.textSub} />
        Contas a Vencer
        {items.length > 0 && (
          <span style={{ background: COLORS.dangerBg, color: COLORS.danger, borderRadius: 999, padding: "1px 6px", fontSize: 9, fontWeight: 700 }}>
            {items.length}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <Empty text="Nenhuma conta nos próximos 7 dias" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {items.map((b) => {
            const isToday = b.daysUntilDue === 0;
            const isUrgent = b.daysUntilDue <= 3;
            return (
              <div key={b.id} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 10px", borderRadius: 8,
                background: isToday ? COLORS.dangerBg : isUrgent ? COLORS.warningBg : COLORS.itemBg,
                border: `1px solid ${isToday ? "#FECDCD" : isUrgent ? "#F8DCAA" : COLORS.divider}`,
              }}>
                {isToday
                  ? <AlertTriangle size={12} color={COLORS.danger} style={{ flexShrink: 0 }} />
                  : <Wallet size={12} color={COLORS.warning} style={{ flexShrink: 0 }} />
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 12, fontWeight: 500, color: COLORS.text,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {b.description}
                  </div>
                  <div style={{ fontSize: 10, color: COLORS.textSub, marginTop: 1 }}>
                    {b.source === "business" ? "Empresa" : "Pessoal"} · dia {b.dueDayOfMonth}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.text }}>
                    {fmtCurrency(b.amount)}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: isToday ? COLORS.danger : COLORS.warning }}>
                    {isToday ? "Hoje" : `${b.daysUntilDue}d`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Tarefas ───────────────────────────────────────────────────────────────────

function TasksSection({
  tasks, onAdd, onToggle, onDelete,
}: {
  tasks: DashboardTask[];
  onAdd: (text: string) => void;
  onToggle: (id: string, done: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    onAdd(text);
  };

  const pending = tasks.filter((t) => !t.completed);
  const done    = tasks.filter((t) => t.completed);

  return (
    <div>
      <div style={MINI_TITLE}>
        <ListTodo size={11} color={COLORS.textSub} />
        Tarefas
        {pending.length > 0 && (
          <span style={{ background: COLORS.itemBg, color: COLORS.textSub, borderRadius: 999, padding: "1px 6px", fontSize: 9, fontWeight: 700, border: `1px solid ${COLORS.divider}` }}>
            {pending.length}
          </span>
        )}
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleAdd()}
          placeholder="Nova tarefa..."
          style={{
            flex: 1, fontSize: 12, padding: "7px 10px",
            border: `1.5px dashed ${COLORS.inputBorder}`,
            borderRadius: 8, background: COLORS.itemBg,
            color: COLORS.text, outline: "none",
          }}
        />
        <button
          onClick={handleAdd}
          style={{
            padding: "7px 10px", borderRadius: 8, border: "none",
            background: COLORS.primary, color: "#FFFFFF",
            cursor: "pointer", display: "flex", alignItems: "center",
            flexShrink: 0,
          }}
        >
          <Plus size={14} />
        </button>
      </div>

      {pending.length === 0 && done.length === 0 && (
        <Empty text="Adicione uma tarefa acima" />
      )}

      {/* Pending tasks */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {pending.map((t) => (
          <div key={t.id} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "7px 10px", borderRadius: 8, background: COLORS.itemBg,
          }}>
            <button
              onClick={() => onToggle(t.id, true)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}
            >
              <Circle size={15} color={COLORS.inputBorder} />
            </button>
            <span style={{ flex: 1, fontSize: 12, color: COLORS.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {t.text}
            </span>
            <button
              onClick={() => onDelete(t.id)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0, opacity: 0.3 }}
            >
              <Trash2 size={12} color={COLORS.textSub} />
            </button>
          </div>
        ))}

        {/* Done tasks (max 3) */}
        {done.slice(0, 3).map((t) => (
          <div key={t.id} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "7px 10px", borderRadius: 8, opacity: 0.45,
          }}>
            <button
              onClick={() => onToggle(t.id, false)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}
            >
              <CheckCircle2 size={15} color={COLORS.primary} />
            </button>
            <span style={{
              flex: 1, fontSize: 12, color: COLORS.textSub,
              textDecoration: "line-through",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {t.text}
            </span>
            <button
              onClick={() => onDelete(t.id)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}
            >
              <Trash2 size={12} color={COLORS.textSub} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Painel principal ──────────────────────────────────────────────────────────

export function DashboardAlertsPanel() {
  const { followUps, bills, tasks, loading, addTask, toggleTask, deleteTask, completeFollowUp } = useDashboardAlerts();

  const pendingTasks = tasks.filter((t) => !t.completed).length;
  const totalAlerts  = followUps.length + bills.length + pendingTasks;

  return (
    <div style={{
      background: "#FFFFFF",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 6px 20px rgba(0,0,0,0.07)",
      borderRadius: 14, padding: "18px 20px",
      display: "flex", flexDirection: "column", gap: 16,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>Meu Dia</span>
        {!loading && totalAlerts > 0 && (
          <span style={{
            background: COLORS.dangerBg, color: COLORS.danger,
            borderRadius: 999, padding: "2px 8px", fontSize: 10, fontWeight: 700,
          }}>
            {totalAlerts} pendente{totalAlerts > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ fontSize: 12, color: COLORS.textSub, textAlign: "center", padding: 12 }}>
          Carregando...
        </div>
      ) : (
        <>
          <FollowUpsSection items={followUps} onComplete={completeFollowUp} />
          <Divider />
          <BillsSection items={bills} />
          <Divider />
          <TasksSection tasks={tasks} onAdd={addTask} onToggle={toggleTask} onDelete={deleteTask} />
        </>
      )}
    </div>
  );
}
