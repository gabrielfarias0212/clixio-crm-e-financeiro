import { ChevronLeft, ChevronRight, Calendar, TrendingUp } from "lucide-react";
import { PeriodType, WeekInfo } from "@/hooks/useWeeklyFilter";

const C = {
  text:    "#1a1a1a",
  textSub: "#9A9590",
  divider: "#F0EDE8",
  itemBg:  "#FAFAF8",
  navy:    "#1E3A5F",
  navyBg:  "#E8EEF6",
  border:  "#E8E4DE",
};

interface WeeklyControlsProps {
  periodType: PeriodType;
  currentWeek: WeekInfo;
  onTogglePeriod: () => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
}

export function WeeklyControls({
  periodType,
  currentWeek,
  onTogglePeriod,
  onPreviousWeek,
  onNextWeek,
  onCurrentWeek,
}: WeeklyControlsProps) {
  return (
    <div style={{
      background: "#FFFFFF",
      borderRadius: 14,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 6px 20px rgba(0,0,0,0.07)",
      padding: "12px 18px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap" as const,
      gap: 10,
      marginBottom: 16,
    }}>
      {/* Toggle period */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={onTogglePeriod}
          style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "7px 12px", borderRadius: 8,
            border: periodType === "monthly" ? "none" : `1px solid ${C.border}`,
            background: periodType === "monthly" ? C.navy : C.itemBg,
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            color: periodType === "monthly" ? "#FFFFFF" : C.textSub,
          }}
        >
          <Calendar style={{ width: 13, height: 13 }} />
          {periodType === "monthly" ? "Mensal" : "Semanal"}
        </button>

        {periodType === "weekly" && (
          <button
            onClick={onCurrentWeek}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "7px 12px", borderRadius: 8,
              border: `1px solid ${C.border}`, background: C.itemBg,
              fontSize: 12, fontWeight: 600, color: C.textSub, cursor: "pointer",
            }}
          >
            <TrendingUp style={{ width: 13, height: 13 }} />
            Semana Atual
          </button>
        )}
      </div>

      {/* Week navigation */}
      {periodType === "weekly" && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            onClick={onPreviousWeek}
            style={{
              width: 30, height: 30, borderRadius: 8,
              border: `1px solid ${C.border}`, background: C.itemBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <ChevronLeft style={{ width: 14, height: 14, color: C.textSub }} />
          </button>

          <div style={{
            padding: "5px 12px", borderRadius: 8,
            background: C.navyBg,
            fontSize: 12, fontWeight: 600, color: C.navy,
            whiteSpace: "nowrap" as const,
          }}>
            {currentWeek.label}
          </div>

          <button
            onClick={onNextWeek}
            style={{
              width: 30, height: 30, borderRadius: 8,
              border: `1px solid ${C.border}`, background: C.itemBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <ChevronRight style={{ width: 14, height: 14, color: C.textSub }} />
          </button>
        </div>
      )}
    </div>
  );
}
