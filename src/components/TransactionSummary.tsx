import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Transaction } from "@/utils/types";
import { ArrowDownCircle, ArrowUpCircle, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { isTransactionInWeek, WeekInfo } from "@/utils/dates/weekUtils";
import { fetchCompanySettings, CompanySettings } from "@/utils/supabase/settings";
import { PeriodType } from "@/hooks/useWeeklyFilter";

// ── Design tokens ──────────────────────────────────────────────────────────

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
  gray:      "#9A9590",
};

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(v);

// ──────────────────────────────────────────────────────────────────────────

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
  const isMobile = useIsMobile();
  const [goals, setGoals] = useState<CompanySettings | null>(null);
  const [summary, setSummary] = useState({
    totalIncome: 0, totalExpenses: 0, balance: 0,
    periodIncome: 0, periodExpenses: 0, periodBalance: 0,
  });

  useEffect(() => {
    const now = new Date();
    const totals = transactions.reduce((acc, t) => {
      const amount = Number(t.amount);
      if (isNaN(amount)) return acc;
      let transactionDate: Date;
      try {
        if (t.date.includes("/")) {
          const [day, month, year] = t.date.split("/").map(Number);
          transactionDate = new Date(year, month - 1, day);
        } else {
          transactionDate = new Date(t.date);
        }
        if (isNaN(transactionDate.getTime())) return acc;
      } catch { return acc; }

      let isInPeriod = false;
      if (periodType === "monthly") {
        isInPeriod = transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear();
      } else if (periodType === "weekly" && currentWeek) {
        isInPeriod = isTransactionInWeek(t.date, currentWeek);
      }

      if (t.type === "entrada") {
        acc.totalIncome += amount;
        if (isInPeriod) acc.periodIncome += amount;
      } else if (t.type === "saída") {
        acc.totalExpenses += amount;
        if (isInPeriod) acc.periodExpenses += amount;
      }
      return acc;
    }, { totalIncome: 0, totalExpenses: 0, periodIncome: 0, periodExpenses: 0 });

    const next = {
      ...totals,
      balance: totals.totalIncome - totals.totalExpenses,
      periodBalance: totals.periodIncome - totals.periodExpenses,
    };
    setSummary(next);
    if (periodType === "weekly" && onWeeklyBalanceChange) onWeeklyBalanceChange(next.periodBalance);
  }, [transactions, periodType, currentWeek, onWeeklyBalanceChange]);

  useEffect(() => { fetchCompanySettings().then(d => setGoals(d)).catch(() => {}); }, []);

  const periodLabel = periodType === "monthly" ? "Mês Atual" : "Período Selecionado";

  const kpis = [
    {
      label: "Entradas Totais",
      value: fmt(summary.totalIncome),
      sub: `${periodLabel}: ${fmt(summary.periodIncome)}`,
      icon: ArrowUpCircle,
      accent: C.success,
      accentBg: C.successBg,
    },
    {
      label: "Saídas Totais",
      value: fmt(summary.totalExpenses),
      sub: `${periodLabel}: ${fmt(summary.periodExpenses)}`,
      icon: ArrowDownCircle,
      accent: C.danger,
      accentBg: C.dangerBg,
    },
    {
      label: "Saldo Geral",
      value: fmt(summary.balance),
      sub: `${summary.periodBalance >= 0 ? "+" : ""}${fmt(summary.periodBalance)} no período`,
      icon: summary.balance >= 0 ? TrendingUp : TrendingDown,
      accent: summary.balance >= 0 ? C.success : C.danger,
      accentBg: summary.balance >= 0 ? C.successBg : C.dangerBg,
    },
    {
      label: `Saldo do ${periodLabel}`,
      value: fmt(summary.periodBalance),
      sub: summary.periodBalance >= 0 ? "Período positivo ✓" : "Período negativo",
      icon: Wallet,
      accent: summary.periodBalance >= 0 ? C.navy : C.danger,
      accentBg: summary.periodBalance >= 0 ? C.navyBg : C.dangerBg,
    },
  ];

  // compute revenue goal progress
  const goal = goals?.monthly_revenue_goal ? Number(goals.monthly_revenue_goal) : null;
  const goalPct = goal ? Math.min(100, (summary.periodIncome / goal) * 100) : null;
  const goalBarColor = goalPct !== null
    ? goalPct >= 100 ? C.success : goalPct >= 70 ? C.amber : C.danger
    : C.gray;

  return (
    <div
      className={className}
      style={{
        background: "#FFFFFF",
        borderRadius: 14,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 6px 20px rgba(0,0,0,0.07)",
        padding: isMobile ? "14px 12px" : "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* KPI grid */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, minmax(0,1fr))", gap: isMobile ? 8 : 12 }}>
        {kpis.map(k => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              style={{
                background: C.itemBg,
                borderRadius: 10,
                borderTop: `3px solid ${k.accent}`,
                padding: isMobile ? "10px 10px" : "12px 14px",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: C.textSub, marginBottom: 4 }}>
                  {k.label}
                </div>
                <div style={{ fontSize: isMobile ? 15 : 20, fontWeight: 800, color: k.accent, lineHeight: 1.1, marginBottom: 3 }}>
                  {k.value}
                </div>
                <div style={{ fontSize: 11, color: C.textSub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                  {k.sub}
                </div>
              </div>
              {!isMobile && (
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: k.accentBg,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Icon style={{ width: 15, height: 15, color: k.accent }} />
              </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Goal progress */}
      {periodType === "monthly" && goal !== null && goalPct !== null && (
        <div style={{ borderTop: `1px solid ${C.divider}`, paddingTop: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: C.textSub, marginBottom: 8 }}>
            Progresso da Meta
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 12, color: C.textSub }}>Receita do mês</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>
              {fmt(summary.periodIncome)} / {fmt(goal)}
            </span>
          </div>
          <div style={{ width: "100%", height: 6, background: C.itemBg, borderRadius: 999, overflow: "hidden" }}>
            <div style={{ height: 6, borderRadius: 999, background: goalBarColor, width: `${goalPct.toFixed(1)}%`, transition: "width 0.4s" }} />
          </div>
          <div style={{ fontSize: 11, color: C.textSub, marginTop: 4 }}>
            {goalPct.toFixed(0)}% da meta mensal atingida
          </div>
        </div>
      )}
    </div>
  );
}
