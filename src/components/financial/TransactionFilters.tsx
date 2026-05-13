import { TransactionType } from "@/utils/types";
import { SearchInput } from "@/components/SearchInput";
import { MonthFilter } from "@/components/financial/MonthFilter";

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
  border:    "#E8E4DE",
};

interface TransactionFiltersProps {
  typeFilter: TransactionType | "all";
  onTypeFilterChange: (filter: TransactionType | "all") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedMonth: string;
  selectedYear: number;
  onMonthChange: (month: string, year: number) => void;
}

export function TransactionFilters({
  typeFilter,
  onTypeFilterChange,
  searchQuery,
  onSearchChange,
  selectedMonth,
  selectedYear,
  onMonthChange,
}: TransactionFiltersProps) {
  const types = [
    { key: "all",    label: "Todas",   color: C.navy,    bg: C.navyBg    },
    { key: "entrada",label: "Entradas",color: C.success, bg: C.successBg },
    { key: "saída",  label: "Saídas",  color: C.danger,  bg: C.dangerBg  },
  ] as const;

  return (
    <div style={{
      background: "#FFFFFF",
      borderRadius: 14,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 6px 20px rgba(0,0,0,0.07)",
      padding: "14px 18px",
      display: "flex",
      flexDirection: "column" as const,
      gap: 10,
    }}>
      {/* Search + month */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const, alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Pesquisar por descrição, categoria ou cliente..."
            className="w-full"
          />
        </div>
        <MonthFilter
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={onMonthChange}
        />
      </div>

      {/* Type filter pills */}
      <div style={{ display: "flex", gap: 6 }}>
        {types.map(t => {
          const active = typeFilter === t.key;
          return (
            <button
              key={t.key}
              onClick={() => onTypeFilterChange(t.key)}
              style={{
                padding: "6px 14px", borderRadius: 8,
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                border: active ? `1px solid ${t.color}40` : `1px solid ${C.border}`,
                background: active ? t.bg : C.itemBg,
                color: active ? t.color : C.textSub,
                transition: "all 0.1s",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
