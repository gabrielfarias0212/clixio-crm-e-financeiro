import { useState, useRef, KeyboardEvent } from "react";
import { CheckCircle2, Circle, Trash2, Plus, AlertTriangle, Clock, Wallet, ListTodo } from "lucide-react";
import { useDashboardAlerts, FollowUpAlert, BillAlert, DashboardTask } from "@/hooks/useDashboardAlerts";

// ── helpers ──────────────────────────────────────────────────────────────────

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

// ── Sub-componentes ───────────────────────────────────────────────────────────

function SectionTitle({ icon, label, count }: { icon: React.ReactNode; label: string; count: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
      {icon}
      <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--color-text-secondary)" }}>
        {label}
      </span>
      {count > 0 && (
        <span style={{ background: "var(--color-border-secondary)", borderRadius: 999, padding: "1px 7px", fontSize: 10, fontWeight: 600, color: "var(--color-text-secondary)" }}>
          {count}
        </span>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div style={{ fontSize: 12, color: "var(--color-text-secondary)", padding: "4px 0", fontStyle: "italic" }}>{text}</div>;
}

// ── Follow-ups ────────────────────────────────────────────────────────────────

function FollowUpsSection({ items, onComplete }: { items: FollowUpAlert[]; onComplete: (id: string) => void }) {
  return (
    <div>
      <SectionTitle icon={<Clock size={13} color="var(--color-text-secondary)" />} label="Follow-ups" count={items.length} />
      {items.length === 0 ? (
        <Empty text="Nenhum follow-up pendente para hoje" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {items.map((f) => (
            <div key={f.id} style={{
              display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 8px", borderRadius: 6,
              background: f.daysOverdue > 0 ? "#FEF2F2" : "#F0FDF4",
              border: `1px solid ${f.daysOverdue > 0 ? "#FECACA" : "#BBF7D0"}`,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.clientName}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 1 }}>{f.description}</div>
                <div style={{ fontSize: 10, marginTop: 2, color: f.daysOverdue > 0 ? "#DC2626" : "#16A34A", fontWeight: 500 }}>
                  {f.daysOverdue === 0 ? "Hoje" : `${f.daysOverdue} dia${f.daysOverdue > 1 ? "s" : ""} atrás`} · {fmtDateBR(f.scheduledDate)}
                </div>
              </div>
              <button onClick={() => onComplete(f.id)} title="Marcar como feito"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 2, flexShrink: 0, marginTop: 2 }}>
                <CheckCircle2 size={16} color={f.daysOverdue > 0 ? "#DC2626" : "#16A34A"} />
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
      <SectionTitle icon={<Wallet size={13} color="var(--color-text-secondary)" />} label="Contas a Vencer" count={items.length} />
      {items.length === 0 ? (
        <Empty text="Nenhuma conta nos próximos 7 dias" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {items.map((b) => (
            <div key={b.id} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", borderRadius: 6,
              background: b.daysUntilDue === 0 ? "#FEF2F2" : b.daysUntilDue <= 3 ? "#FFF7ED" : "#F8FAFC",
              border: `1px solid ${b.daysUntilDue === 0 ? "#FECACA" : b.daysUntilDue <= 3 ? "#FED7AA" : "var(--color-border-tertiary)"}`,
            }}>
              {b.daysUntilDue === 0
                ? <AlertTriangle size={12} color="#DC2626" style={{ flexShrink: 0 }} />
                : <Wallet size={12} color="#F59E0B" style={{ flexShrink: 0 }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.description}</div>
                <div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>
                  {b.source === "business" ? "Empresa" : "Pessoal"} · dia {b.dueDayOfMonth}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{fmtCurrency(b.amount)}</div>
                <div style={{ fontSize: 10, color: b.daysUntilDue === 0 ? "#DC2626" : "#F59E0B", fontWeight: 500 }}>
                  {b.daysUntilDue === 0 ? "Hoje" : `${b.daysUntilDue}d`}
                </div>
              </div>
            </div>
          ))}
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
  const done = tasks.filter((t) => t.completed);

  return (
    <div>
      <SectionTitle icon={<ListTodo size={13} color="var(--color-text-secondary)" />} label="Tarefas" count={pending.length} />
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleAdd()}
          placeholder="Nova tarefa..."
          style={{
            flex: 1, fontSize: 12, padding: "5px 8px",
            border: "1px solid var(--color-border-secondary)", borderRadius: 6,
            background: "var(--color-background-primary)", color: "var(--color-text-primary)", outline: "none",
          }}
        />
        <button onClick={handleAdd} style={{
          padding: "5px 8px", borderRadius: 6, border: "none",
          background: "var(--color-text-primary)", color: "var(--color-background-primary)",
          cursor: "pointer", display: "flex", alignItems: "center",
        }}>
          <Plus size={14} />
        </button>
      </div>

      {pending.length === 0 && done.length === 0 && <Empty text="Adicione uma tarefa acima" />}

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {pending.map((t) => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0" }}>
            <button onClick={() => onToggle(t.id, true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}>
              <Circle size={15} color="var(--color-text-secondary)" />
            </button>
            <span style={{ flex: 1, fontSize: 12 }}>{t.text}</span>
            <button onClick={() => onDelete(t.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, opacity: 0.35, flexShrink: 0 }}>
              <Trash2 size={12} color="var(--color-text-secondary)" />
            </button>
          </div>
        ))}
        {done.slice(0, 3).map((t) => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", opacity: 0.45 }}>
            <button onClick={() => onToggle(t.id, false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}>
              <CheckCircle2 size={15} color="var(--color-text-secondary)" />
            </button>
            <span style={{ flex: 1, fontSize: 12, textDecoration: "line-through", color: "var(--color-text-secondary)" }}>{t.text}</span>
            <button onClick={() => onDelete(t.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}>
              <Trash2 size={12} color="var(--color-text-secondary)" />
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
  const totalAlerts = followUps.length + bills.length + pendingTasks;

  return (
    <div style={{
      background: "#FFFFFF",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 6px 20px rgba(0,0,0,0.07)",
      borderRadius: 14, padding: "18px 20px",
      display: "flex", flexDirection: "column", gap: 18,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>Meu Dia</span>
        {!loading && totalAlerts > 0 && (
          <span style={{ background: "#FEF2F2", color: "#DC2626", borderRadius: 999, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
            {totalAlerts} pendente{totalAlerts > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)", textAlign: "center", padding: 12 }}>Carregando...</div>
      ) : (
        <>
          <FollowUpsSection items={followUps} onComplete={completeFollowUp} />
          <div style={{ borderTop: "1px solid var(--color-border-tertiary)" }} />
          <BillsSection items={bills} />
          <div style={{ borderTop: "1px solid var(--color-border-tertiary)" }} />
          <TasksSection tasks={tasks} onAdd={addTask} onToggle={toggleTask} onDelete={deleteTask} />
        </>
      )}
    </div>
  );
}
