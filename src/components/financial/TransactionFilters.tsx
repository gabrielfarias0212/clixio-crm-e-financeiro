
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TransactionType } from "@/utils/types";
import { SearchInput } from "@/components/SearchInput";
import { MonthFilter } from "@/components/financial/MonthFilter";

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
  onMonthChange
}: TransactionFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Barra de pesquisa */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Pesquisar por descrição, categoria ou cliente..."
            className="w-full"
          />
        </div>
      </div>

      {/* Filtro mensal */}
      <MonthFilter
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={onMonthChange}
      />

      {/* Filtros de tipo */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={typeFilter === "all" ? "default" : "outline"}
          onClick={() => onTypeFilterChange("all")}
          size="sm"
        >
          Todas
        </Button>
        <Button
          variant={typeFilter === "entrada" ? "default" : "outline"}
          onClick={() => onTypeFilterChange("entrada")}
          size="sm"
          className="text-green-700 bg-green-100 hover:bg-green-200 border-green-200"
        >
          Entradas
        </Button>
        <Button
          variant={typeFilter === "saída" ? "default" : "outline"}
          onClick={() => onTypeFilterChange("saída")}
          size="sm"
          className="text-red-700 bg-red-100 hover:bg-red-200 border-red-200"
        >
          Saídas
        </Button>
      </div>
    </div>
  );
}
