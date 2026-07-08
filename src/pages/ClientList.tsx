import React, { useState, useCallback, useMemo, Suspense } from "react";
import Layout from "@/components/Layout";
import { ClientHeader } from "@/components/clients/ClientHeader";
import { OptimizedClientCards } from "@/components/clients/OptimizedClientCards";
import { ClientTable } from "@/components/clients/ClientTable";
import { ClientFilters } from "@/components/clients/ClientFilters";
import { EmptyClientState } from "@/components/clients/EmptyClientState";
import { ClientListSkeleton } from "@/components/clients/ClientListSkeleton";
import { ClientPagination } from "@/components/clients/ClientPagination";
import { useOptimizedClients } from "@/hooks/useOptimizedClients";
import { useClients } from "@/contexts/ClientsContext";
import { ClientStatus } from "@/utils/types";
import { Archive, Users, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

const C = {
  navy:    "#1E3A5F",
  navyBg:  "#E8EEF6",
  text:    "#1a1a1a",
  textSub: "#9A9590",
  divider: "#F0EDE8",
  itemBg:  "#FAFAF8",
  border:  "#E8E4DE",
};

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(v);

type TabKey = "active" | "archived";

export default function ClientList() {
  const [activeTab, setActiveTab] = useState<TabKey>("active");
  const [clearingData, setClearingData] = useState(false);

  // Active tab state
  const [activeSearch, setActiveSearch] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState<ClientStatus | "all">("all");
  const [activeViewMode, setActiveViewMode] = useState<"cards" | "table">("table");
  const [activeSortBy, setActiveSortBy] = useState<"name" | "date" | "value" | "status">("name");
  const [activeSortOrder, setActiveSortOrder] = useState<"asc" | "desc">("asc");

  // Archived tab state
  const [archivedSearch, setArchivedSearch] = useState("");
  const [archivedStatusFilter, setArchivedStatusFilter] = useState<ClientStatus | "all">("all");
  const [archivedViewMode, setArchivedViewMode] = useState<"cards" | "table">("table");
  const [archivedSortBy, setArchivedSortBy] = useState<"name" | "date" | "value" | "status">("name");
  const [archivedSortOrder, setArchivedSortOrder] = useState<"asc" | "desc">("asc");

  const { clients: allClientsFromContext } = useClients();

  // Active clients hook
  const activeData = useOptimizedClients({
    pageSize: 50,
    searchTerm: activeSearch,
    statusFilter: activeStatusFilter,
    sortBy: activeSortBy,
    sortOrder: activeSortOrder,
    mode: "active",
  });

  // Archived clients hook
  const archivedData = useOptimizedClients({
    pageSize: 50,
    searchTerm: archivedSearch,
    statusFilter: archivedStatusFilter,
    sortBy: archivedSortBy,
    sortOrder: archivedSortOrder,
    mode: "archived",
  });

  const handleClearData = async () => {
    setClearingData(true);
    try {
      toast.success("Dados limpos com sucesso");
    } catch {
      toast.error("Erro ao limpar dados");
    } finally {
      setClearingData(false);
    }
  };

  // Active tab handlers
  const handleActiveFiltersChange = useCallback((search: string, status: string) => {
    setActiveSearch(search);
    setActiveStatusFilter(status as ClientStatus | "all");
    activeData.pagination.resetPage();
  }, [activeData.pagination]);

  const clearActiveFilters = () => {
    setActiveSearch("");
    setActiveStatusFilter("all");
    activeData.pagination.resetPage();
  };

  // Archived tab handlers
  const handleArchivedFiltersChange = useCallback((search: string, status: string) => {
    setArchivedSearch(search);
    setArchivedStatusFilter(status as ClientStatus | "all");
    archivedData.pagination.resetPage();
  }, [archivedData.pagination]);

  const clearArchivedFilters = () => {
    setArchivedSearch("");
    setArchivedStatusFilter("all");
    archivedData.pagination.resetPage();
  };

  // Archived stats
  const archivedStats = useMemo(() => {
    const all = archivedData.allClients;
    const finalized = all.filter(c => c.status === "projeto_finalizado");
    const lost = all.filter(c => c.status === "contrato_perdido");
    const totalRevenue = finalized.reduce((sum, c) => sum + (c.contractValue || 0), 0);
    return { finalized: finalized.length, lost: lost.length, totalRevenue };
  }, [archivedData.allClients]);

  const hasActiveActiveFilters = activeSearch.trim() !== "" || activeStatusFilter !== "all";
  const hasActiveArchivedFilters = archivedSearch.trim() !== "" || archivedStatusFilter !== "all";

  const loading = activeData.loading || archivedData.loading;

  return (
    <Layout>
      <div className="container mx-auto px-3 py-4 md:px-4 md:py-8 space-y-6">

        {/* Header */}
        <Suspense fallback={<div className="h-16 bg-gray-100 rounded animate-pulse" />}>
          <ClientHeader
            clients={allClientsFromContext}
            deliveredWorksCount={archivedStats.finalized}
            onClearData={handleClearData}
            clearingData={clearingData}
          />
        </Suspense>

        {/* Custom Tab Bar */}
        <div style={{
          display: "flex",
          gap: 0,
          borderBottom: `2px solid ${C.divider}`,
        }}>
          {/* Active tab */}
          <button
            onClick={() => setActiveTab("active")}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 20px",
              background: "none", border: "none", cursor: "pointer",
              borderBottom: activeTab === "active" ? `2px solid ${C.navy}` : "2px solid transparent",
              marginBottom: -2,
              color: activeTab === "active" ? C.navy : C.textSub,
              transition: "all 0.15s",
            }}
          >
            <Users style={{ width: 15, height: 15 }} />
            <span style={{ fontSize: 14, fontWeight: activeTab === "active" ? 700 : 500 }}>
              Clientes Ativos
            </span>
            <span style={{
              fontSize: 11, fontWeight: 700,
              padding: "2px 7px", borderRadius: 99,
              background: activeTab === "active" ? C.navy : C.divider,
              color: activeTab === "active" ? "#fff" : C.textSub,
              minWidth: 22, textAlign: "center" as const,
            }}>
              {activeData.allClients.length}
            </span>
          </button>

          {/* Archived tab */}
          <button
            onClick={() => setActiveTab("archived")}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 20px",
              background: "none", border: "none", cursor: "pointer",
              borderBottom: activeTab === "archived" ? `2px solid #8A7F6E` : "2px solid transparent",
              marginBottom: -2,
              color: activeTab === "archived" ? "#5C5245" : C.textSub,
              transition: "all 0.15s",
            }}
          >
            <Archive style={{ width: 15, height: 15 }} />
            <span style={{ fontSize: 14, fontWeight: activeTab === "archived" ? 700 : 500 }}>
              Arquivados
            </span>
            <span style={{
              fontSize: 11, fontWeight: 700,
              padding: "2px 7px", borderRadius: 99,
              background: activeTab === "archived" ? "#8A7F6E" : C.divider,
              color: activeTab === "archived" ? "#fff" : C.textSub,
              minWidth: 22, textAlign: "center" as const,
            }}>
              {archivedData.allClients.length}
            </span>
          </button>
        </div>

        {/* ── ACTIVE TAB ── */}
        {activeTab === "active" && (
          <div className="space-y-6">
            <Suspense fallback={<div className="h-20 bg-gray-100 rounded animate-pulse" />}>
              <ClientFilters
                searchQuery={activeSearch}
                setSearchQuery={s => handleActiveFiltersChange(s, activeStatusFilter)}
                statusFilter={activeStatusFilter}
                setStatusFilter={s => handleActiveFiltersChange(activeSearch, s)}
                viewMode={activeViewMode === "cards" ? "card" : "list"}
                setViewMode={m => setActiveViewMode(m === "card" ? "cards" : "table")}
                sortBy={activeSortBy}
                setSortBy={setActiveSortBy}
                sortOrder={activeSortOrder}
                setSortOrder={setActiveSortOrder}
                clearFilters={clearActiveFilters}
                hasActiveFilters={hasActiveActiveFilters}
                mode="active"
              />
            </Suspense>

            {loading ? (
              <ClientListSkeleton count={12} variant={activeViewMode} />
            ) : activeData.allClients.length === 0 ? (
              <EmptyClientState hasFilters={hasActiveActiveFilters} />
            ) : activeData.clients.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Nenhum cliente encontrado com os filtros aplicados.</p>
              </div>
            ) : (
              <>
                {activeViewMode === "cards" ? (
                  <OptimizedClientCards clients={activeData.clients} />
                ) : (
                  <ClientTable
                    clients={activeData.clients}
                    sortBy={activeSortBy}
                    setSortBy={setActiveSortBy}
                    sortOrder={activeSortOrder}
                    setSortOrder={setActiveSortOrder}
                    isArchived={false}
                  />
                )}
                <ClientPagination
                  currentPage={activeData.pagination.currentPage}
                  totalPages={activeData.pagination.totalPages}
                  totalItems={activeData.pagination.totalItems}
                  startIndex={activeData.pagination.startIndex}
                  endIndex={activeData.pagination.endIndex}
                  hasNextPage={activeData.pagination.hasNextPage}
                  hasPrevPage={activeData.pagination.hasPrevPage}
                  onPageChange={activeData.pagination.goToPage}
                  onNextPage={activeData.pagination.nextPage}
                  onPrevPage={activeData.pagination.prevPage}
                />
              </>
            )}
          </div>
        )}

        {/* ── ARCHIVED TAB ── */}
        {activeTab === "archived" && (
          <div className="space-y-6">

            {/* Archived stats banner */}
            {archivedData.allClients.length > 0 && (
              <div style={{
                display: "flex", gap: 12, flexWrap: "wrap" as const,
              }}>
                <div style={{
                  flex: 1, minWidth: 160,
                  background: "#F0FAF4", border: "1px solid #C6E8D4",
                  borderRadius: 12, padding: "14px 18px",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <CheckCircle style={{ width: 22, height: 22, color: "#52C97A", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#1A5C32", lineHeight: 1 }}>
                      {archivedStats.finalized}
                    </div>
                    <div style={{ fontSize: 12, color: "#4A9B6A", marginTop: 2 }}>
                      Projetos Finalizados
                    </div>
                  </div>
                </div>

                <div style={{
                  flex: 1, minWidth: 160,
                  background: "#FDF2F2", border: "1px solid #F5C6C6",
                  borderRadius: 12, padding: "14px 18px",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <XCircle style={{ width: 22, height: 22, color: "#E05252", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#7A1A1A", lineHeight: 1 }}>
                      {archivedStats.lost}
                    </div>
                    <div style={{ fontSize: 12, color: "#9B4A4A", marginTop: 2 }}>
                      Contratos Perdidos
                    </div>
                  </div>
                </div>

                <div style={{
                  flex: 2, minWidth: 200,
                  background: "#F5F3F0", border: "1px solid #E0DDD8",
                  borderRadius: 12, padding: "14px 18px",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <TrendingUp style={{ width: 22, height: 22, color: "#8A7F6E", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#3D3530", lineHeight: 1 }}>
                      {fmt(archivedStats.totalRevenue)}
                    </div>
                    <div style={{ fontSize: 12, color: "#7A6E62", marginTop: 2 }}>
                      Receita Total Entregue
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Suspense fallback={<div className="h-20 bg-gray-100 rounded animate-pulse" />}>
              <ClientFilters
                searchQuery={archivedSearch}
                setSearchQuery={s => handleArchivedFiltersChange(s, archivedStatusFilter)}
                statusFilter={archivedStatusFilter}
                setStatusFilter={s => handleArchivedFiltersChange(archivedSearch, s)}
                viewMode={archivedViewMode === "cards" ? "card" : "list"}
                setViewMode={m => setArchivedViewMode(m === "card" ? "cards" : "table")}
                sortBy={archivedSortBy}
                setSortBy={setArchivedSortBy}
                sortOrder={archivedSortOrder}
                setSortOrder={setArchivedSortOrder}
                clearFilters={clearArchivedFilters}
                hasActiveFilters={hasActiveArchivedFilters}
                mode="archived"
              />
            </Suspense>

            {loading ? (
              <ClientListSkeleton count={12} variant={archivedViewMode} />
            ) : archivedData.allClients.length === 0 ? (
              <div style={{
                textAlign: "center" as const, padding: "48px 24px",
                background: "#FAFAF8", borderRadius: 14,
                border: `1px dashed ${C.border}`,
              }}>
                <Archive style={{ width: 40, height: 40, color: C.divider, margin: "0 auto 12px" }} />
                <p style={{ fontSize: 14, color: C.textSub, fontWeight: 500 }}>
                  Nenhum contrato arquivado ainda
                </p>
                <p style={{ fontSize: 12, color: C.textSub, marginTop: 4 }}>
                  Projetos finalizados e contratos perdidos aparecerão aqui
                </p>
              </div>
            ) : archivedData.clients.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Nenhum resultado com os filtros aplicados.</p>
              </div>
            ) : (
              <>
                {archivedViewMode === "cards" ? (
                  <OptimizedClientCards clients={archivedData.clients} />
                ) : (
                  <ClientTable
                    clients={archivedData.clients}
                    sortBy={archivedSortBy}
                    setSortBy={setArchivedSortBy}
                    sortOrder={archivedSortOrder}
                    setSortOrder={setArchivedSortOrder}
                    isArchived={true}
                  />
                )}
                <ClientPagination
                  currentPage={archivedData.pagination.currentPage}
                  totalPages={archivedData.pagination.totalPages}
                  totalItems={archivedData.pagination.totalItems}
                  startIndex={archivedData.pagination.startIndex}
                  endIndex={archivedData.pagination.endIndex}
                  hasNextPage={archivedData.pagination.hasNextPage}
                  hasPrevPage={archivedData.pagination.hasPrevPage}
                  onPageChange={archivedData.pagination.goToPage}
                  onNextPage={archivedData.pagination.nextPage}
                  onPrevPage={archivedData.pagination.prevPage}
                />
              </>
            )}
          </div>
        )}

      </div>
    </Layout>
  );
}
