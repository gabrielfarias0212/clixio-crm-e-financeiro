
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Search, X, ChevronDown, List, LayoutGrid, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { ClientStatus } from "@/utils/types";
import { cn } from "@/lib/utils";

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
  hasActiveFilters
}: ClientFiltersProps) {

  const getSortLabel = (sort: string) => {
    switch (sort) {
      case 'name': return 'Nome';
      case 'date': return 'Data';
      case 'value': return 'Valor';
      case 'status': return 'Status';
      default: return 'Nome';
    }
  };
  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar clientes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-8 focus:ring-1 focus:ring-black dark:focus:ring-white transition-shadow"
        />
        {searchQuery && (
          <button 
            className="absolute right-3 top-1/2 -translate-y-1/2"
            onClick={() => setSearchQuery("")}
            aria-label="Clear search"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto min-w-[150px] justify-between">
            {statusFilter === "all" ? "Todos os status" : statusFilter}
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuRadioGroup value={statusFilter} onValueChange={(value) => setStatusFilter(value as ClientStatus | "all")}>
            <DropdownMenuRadioItem value="all">Todos os status</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="primeiro_contato">Primeiro Contato</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="orçamento enviado">Orçamento Enviado</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="negociacao">Follow-up</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="fechado">Fechado</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="projeto_finalizado">Projeto Finalizado</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <div className="flex">
        <Button 
          variant="outline" 
          size="icon"
          className={cn("rounded-r-none", viewMode === "list" && "bg-gray-100")}
          onClick={() => setViewMode("list")}
          aria-label="View as list"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          className={cn("rounded-l-none border-l-0", viewMode === "card" && "bg-gray-100")}
          onClick={() => setViewMode("card")}
          aria-label="View as cards"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
      </div>
      
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            onClick={clearFilters}
            className="sm:ml-auto w-full sm:w-auto"
          >
            Limpar filtros
          </Button>
        )}
      </div>
      
      {/* Controles de ordenação */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <span className="text-sm font-medium text-muted-foreground">Ordenar por:</span>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto min-w-[120px] justify-between">
              {getSortLabel(sortBy)}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
              <DropdownMenuRadioItem value="name">Nome</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="date">Data</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="value">Valor</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="status">Status</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="w-full sm:w-auto"
          title={sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
        >
          {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
