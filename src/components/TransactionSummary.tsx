import { useEffect, useState } from "react";
import { Transaction } from "@/utils/types";
import {
  ArrowDownCircle, ArrowUpCircle, TrendingDown, TrendingUp,
  ChevronDown, ChevronUp, Target, Hash, BarChart2,
} from "lucide-react";
import { isTransactionInWeek, WeekInfo } from "@/utils/dates/weekUtils";
import { fetchCompanySettings, CompanySettings } from "@/utils/supabase/settings";
import { PeriodType } from "@/hooks/useWeeklyFilter";

const C = {
  text:      "#1a1a1a",
  textSub:   "#9A9590",
  divider:   "#F0EDE8",
  itemBg:    "#FAFAF8",
  navy:      "#1E3A5F",
  navyBg:    "#E8EEF6",
  success:   "#52C97A",
  successBg: "#E6F9EE",
  danger:    "#E05252",
  dangerBg:  "#FEE8E8",
  amber:     "#E8A838",
  amberBg:   "#FEF3DC",
  border:    "#E8E4DE",
};

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(v);

const fmtShort = (v: number) => {
  if (Math.abs(v) >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}k`;
  return fmt(v);
};

interface TransactionSummaryProps {
  transactions: Transaction[];
  className?: string;
  periodType?: PeriodType;
  currentWeek?: WeekInfo;
  onWeeklyBalanceChange?: (balance: number) => void;
}

export function TransactionSummary({
  transactions,
  className,
  periodType = "monthly",
  currentWeek,
  onWeeklyBalanceChange,
}: TransactionSummaryProps) {
  const [goals, setGoals] = useState<CompanySettings | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [summary, setSummary] = useState({
    totalIncome: 0, totalExpenses: 0,
    periodIncome: 0, periodExpenses: 0,
    periodIncomeCount: 0,
  });

  useEffect(() => {
    const now = new Date();
    const totals = transactions.reduce((acc, t) => {
      const amount = Number(t.amount);
      if (isNaN(amount)) return acc;
      let d: Date;
      try {
        d = t.date.includes("/")
          ? (() => { const [dd, mm, yy] = t.date.split("/").map(Number); return new Date(yy, mm - 1, dd); })()
          : new Date(t.date);
        if (isNaN(d.getTime())) return acc;
      } catch { return acc; }

      let inPeriod = false;
      if (periodType === "monthly") {
        inPeriod = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      } else if (periodType === "weekly" && currentWeek) {
        inPeriod = isTransactionInWeek(t.date, currentWeek);
      }

      if (t.type === "entrada") {
        acc.totalIncome += amount;
        if (inPeriod) { acc.periodIncome += amount; acc.periodIncomeCount += 1; }
      } else if (t.type === "saída") {
        acc.totalExpenses += amount;
        if (inPeriod) acc.periodExpenses += amount;
      }
      return acc;
    }, { totalIncome: 0, totalExpenses: 0, periodIncome: 0, periodExpenses: 0, periodIncomeCount: 0 });

    setSummary(totals);
    const periodBalance = totals.periodIncome - totals.periodExpenses;
    if (periodType === "weekly" && onWeeklyBalanceChange) onWeeklyBalanceChange(periodBalance);
  }, [transactions, periodType, currentWeek, onWeeklyBalanceChange]);

  useEffect(() => { fetchCompanySettings().then(d => setGoals(d)).catch(() => {}); }, []);

  const periodLabel = periodType === "monthly" ? "do Mês" : "da Semana";
  const periodBalance = summary.periodIncome - summary.periodExpenses;
  const totalBalance  = summary.totalIncome - summary.totalExpenses;

  const avgTicket = summary.periodIncomeCount > 0
    ? summary.periodIncome / summary.periodIncomeCount
    : 0;

  // Meta mensal
  const goal = goals?.monthly_revenue_goal ? Number(goals.monthly_revenue_goal) : null;
  const goalPct = goal && periodType === "monthly" ? Math.min(100, (summary.periodIncome / goal) * 100) : null;
  const goalBarColor = goalPct !== null
    ? goalPct >= 100 ? C.success : goalPct >= 70 ? C.amber : C.danger
    : C.navy;

  // % de lucratividade do período
  const marginPct = summary.periodIncome > 0
    ? ((periodBalance / summary.periodIncome) * 100)
    : null;

  return (
    <div
      className={className}
      style={{
        background: "#FFFFFF",
        borderRadius: 14,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 6px 20px rgba(0,0,0,0.07)",
        overflow: "hidden",
      }}
    >
      {/* ── Bloco 1: 3 KPIs principais do período ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        borderBottom: `1px solid ${C.divider}`,
      }}>
        {/* Receita */}
        <div style={{ padding: "20px 20px 16px", borderRight: `1px solid ${C.divider}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase" as const, color: C.textSub }}>
              Receita {periodLabel}
            </span>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.successBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ArrowUpCircle style={{ width: 14, height: 14, color: C.success }} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.success, lineHeight: 1.1, marginBottom: 4 }}>
            {fmt(summary.periodIncome)}
          </div>
          <div style={{ fontSize: 11, color: C.textSub }}>
            {summary.periodIncomeCount} recebimento{summary.periodIncomeCount !== 1 ? "s" : ""} no período
          </div>
        </div>

        {/* Despesas */}
        <div style={{ padding: "20px 20px 16px", borderRight: `1px solid ${C.divider}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase" as const, color: C.textSub }}>
              Despesas {periodLabel}
            </span>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.dangerBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ArrowDownCircle style={{ width: 14, height: 14, color: C.danger }} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.danger, lineHeight: 1.1, marginBottom: 4 }}>
            {fmt(summary.periodExpenses)}
          </div>
          <div style={{ fontSize: 11, color: C.textSub }}>
            {summary.periodIncome > 0
              ? `${((summary.periodExpenses / summary.periodIncome) * 100).toFixed(0)}% da receita do período`
              : "Sem receita no período"}
          </div>
        </div>

        {/* Lucro Líquido */}
        <div style={{ padding: "20px 20px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase" as const, color: C.textSub }}>
              Lucro Líquido {periodLabel}
            </span>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: periodBalance >= 0 ? C.navyBg : C.dangerBg,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {periodBalance >= 0
                ? <TrendingUp style={{ width: 14, height: 14, color: C.navy }} />
                : <TrendingDown style={{ width: 14, height: 14, color: C.danger }} />}
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: periodBalance >= 0 ? C.navy : C.danger, lineHeight: 1.1, marginBottom: 4 }}>
            {periodBalance >= 0 ? "" : "-"}{fmt(Math.abs(periodBalance))}
          </div>
          <div style={{ fontSize: 11, color: C.textSub }}>
            {marginPct !== null
              ? `${marginPct.toFixed(0)}% de margem líquida`
              : periodBalance >= 0 ? "Período positivo ✓" : "Período negativo"}
          </div>
        </div>
      </div>

      {/* ── Bloco 2: Métricas secundárias + meta ── */}
      <div style={{
        padding: "14px 20px",
        display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap",
        borderBottom: `1px solid ${C.divider}`,
      }}>
        {/* Ticket médio */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: C.navyBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BarChart2 style={{ width: 13, height: 13, color: C.navy }} />
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: C.textSub }}>
              Ticket Médio
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
              {avgTicket > 0 ? fmt(avgTicket) : "—"}
            </div>
          </div>
        </div>

        {/* Divisor */}
        <div style={{ width: 1, height: 32, background: C.divider }} />

        {/* Número de entradas */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: C.successBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Hash style={{ width: 13, height: 13, color: C.success }} />
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: C.textSub }}>
              Entradas
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
              {summary.periodIncomeCount}
            </div>
          </div>
        </div>

        {/* Meta mensal — só no modo mensal */}
        {periodType === "monthly" && goal && goalPct !== null && (
          <>
            <div style={{ width: 1, height: 32, background: C.divider }} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                <Target style={{ width: 12, height: 12, color: goalBarColor }} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: C.textSub }}>
                  Meta Mensal
                </span>
                <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: goalBarColor }}>
                  {fmt(summary.periodIncome)} / {fmt(goal)}
                </span>
              </div>
              <div style={{ width: "100%", height: 6, background: C.itemBg, borderRadius: 999, overflow: "hidden" }}>
                <div style={{
                  height: 6, borderRadius: 999, background: goalBarColor,
                  width: `${goalPct.toFixed(1)}%`, transition: "width 0.4s",
                }} />
              </div>
              <div style={{ fontSize: 11, color: goalBarColor, marginTop: 3, fontWeight: 600 }}>
                {goalPct >= 100 ? `✓ Meta batida (${goalPct.toFixed(0)}%)` : `${goalPct.toFixed(0)}% atingido`}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Bloco 3: Histórico geral (colapsável) ── */}
      <div>
        <button
          onClick={() => setHistoryOpen(o => !o)}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 20px", background: "none", border: "none", cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: C.textSub }}>
            Histórico geral acumulado
          </span>
          {historyOpen
            ? <ChevronUp style={{ width: 14, height: 14, color: C.textSub }} />
            : <ChevronDown style={{ width: 14, height: 14, color: C.textSub }} />}
        </button>

        {historyOpen && (
          <div style={{
            borderTop: `1px solid ${C.divider}`,
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          }}>
            {[
              { label: "Faturamento Total", value: fmt(summary.totalIncome), color: C.success },
              { label: "Despesas Totais",   value: fmt(summary.totalExpenses), color: C.danger },
              { label: "Saldo Acumulado",   value: fmt(totalBalance), color: totalBalance >= 0 ? C.navy : C.danger },
            ].map((item, i) => (
              <div
                key={item.label}
                style={{
                  padding: "12px 20px",
                  borderRight: i < 2 ? `1px solid ${C.divider}` : "none",
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: C.textSub, marginBottom: 4 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: item.color }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
