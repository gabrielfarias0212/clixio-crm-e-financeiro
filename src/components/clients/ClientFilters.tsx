import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, X, ChevronDown, List, LayoutGrid, ArrowUp, ArrowDown } from "lucide-react";
import { ClientStatus } from "@/utils/types";

interface ClientFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: ClientStatus | "all";
  setStatusFilter: (status: ClientStatus | "all") => void;
  viewMode: "list" | "card";
  setViewMode: (mode: "list" | "card") => void;
  sortBy: "name" | "date" | "value" | "status";
  setSortBy: (sort: "name" | "date" | "value" | "status") => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

const C = {
  navy:    "#1E3A5F",
  navyBg:  "#E8EEF6",
  text:    "#1a1a1a",
  textSub: "#9A9590",
  divider: "#F0EDE8",
  itemBg:  "#FAFAF8",
  border:  "#E8E4DE",
};

const STATUS_LABELS: Record<string, string> = {
  all:                "Todos os status",
  primeiro_contato:   "Primeiro Contato",
  "orçamento enviado":"Orçamento Enviado",
  negociacao:         "Follow-up",
  fechado:            "Fechado",
  projeto_finalizado: "Projeto Finalizado",
};

const SORT_LABELS: Record<string, string> = {
  name:   "Nome",
  date:   "Data",
  value:  "Valor",
  status: "Status",
};

export function ClientFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  clearFilters,
  hasActiveFilters,
}: ClientFiltersProps) {
  return (
    <div style={{
      background: "#FFFFFF",
      borderRadius: 14,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 6px 20px rgba(0,0,0,0.07)",
      padding: "16px 20px",
      display: "flex",
      flexDirection: "column" as const,
      gap: 12,
    }}>
      {/* Row 1: search + status + view toggle */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, alignItems: "center" }}>

        {/* Search */}
        <div style={{ position: "relative" as const, flex: 1, minWidth: 200 }}>
          <Search style={{
            position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
            width: 14, height: 14, color: C.textSub,
          }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar clientes..."
            style={{
              width: "100%", boxSizing: "border-box" as const,
              padding: "8px 32px 8px 32px",
              border: `1.5px solid ${C.border}`, borderRadius: 8,
              background: C.itemBg, fontSize: 13, color: C.text, outline: "none",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", padding: 0,
              }}
            >
              <X style={{ width: 13, height: 13, color: C.textSub }} />
            </button>
          )}
        </div>

        {/* Status filter dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 12px", borderRadius: 8,
              border: `1.5px solid ${hasActiveFilters && statusFilter !== "all" ? C.navy : C.border}`,
              background: hasActiveFilters && statusFilter !== "all" ? C.navyBg : C.itemBg,
              fontSize: 12, fontWeight: 600,
              color: hasActiveFilters && statusFilter !== "all" ? C.navy : C.text,
              cursor: "pointer", whiteSpace: "nowrap" as const, minWidth: 140,
            }}>
              {STATUS_LABELS[statusFilter] ?? statusFilter}
              <ChevronDown style={{ width: 12, height: 12, flexShrink: 0 }} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52">
            <DropdownMenuRadioGroup
              value={statusFilter}
              onValueChange={v => setStatusFilter(v as ClientStatus | "all")}
            >
              <DropdownMenuRadioItem value="all">Todos os status</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="primeiro_contato">Primeiro Contato</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="orçamento enviado">Orçamento Enviado</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="negociacao">Follow-up</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="fechado">Fechado</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="projeto_finalizado">Projeto Finalizado</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View toggle */}
        <div style={{ display: "flex", borderRadius: 8, border: `1.5px solid ${C.border}`, overflow: "hidden", flexShrink: 0 }}>
          <button
            onClick={() => setViewMode("list")}
            title="Visualização em lista"
            style={{
              padding: "7px 10px", border: "none", cursor: "pointer",
              background: viewMode === "list" ? C.navyBg : C.itemBg,
              color: viewMode === "list" ? C.navy : C.textSub,
              borderRight: `1px solid ${C.border}`,
            }}
          >
            <List style={{ width: 14, height: 14 }} />
          </button>
          <button
            onClick={() => setViewMode("card")}
            title="Visualização em cards"
            style={{
              padding: "7px 10px", border: "none", cursor: "pointer",
              background: viewMode === "card" ? C.navyBg : C.itemBg,
              color: viewMode === "card" ? C.navy : C.textSub,
            }}
          >
            <LayoutGrid style={{ width: 14, height: 14 }} />
          </button>
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            style={{
              padding: "8px 12px", borderRadius: 8,
              border: `1px solid ${C.divider}`, background: "none",
              fontSize: 12, color: C.textSub, cursor: "pointer",
              whiteSpace: "nowrap" as const,
            }}
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Row 2: sort controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: C.textSub }}>
          Ordenar por:
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "6px 10px", borderRadius: 8,
              border: `1.5px solid ${C.border}`, background: C.itemBg,
              fontSize: 12, fontWeight: 600, color: C.text,
              cursor: "pointer",
            }}>
              {SORT_LABELS[sortBy]}
              <ChevronDown style={{ width: 11, height: 11 }} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40">
            <DropdownMenuRadioGroup value={sortBy} onValueChange={v => setSortBy(v as typeof sortBy)}>
              <DropdownMenuRadioItem value="name">Nome</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="date">Data</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="value">Valor</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="status">Status</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          title={sortOrder === "asc" ? "Crescente" : "Decrescente"}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 30, height: 30, borderRadius: 8,
            border: `1.5px solid ${C.border}`, background: C.itemBg,
            cursor: "pointer",
          }}
        >
          {sortOrder === "asc"
            ? <ArrowUp style={{ width: 13, height: 13, color: C.navy }} />
            : <ArrowDown style={{ width: 13, height: 13, color: C.navy }} />}
        </button>
      </div>
    </div>
  );
}
