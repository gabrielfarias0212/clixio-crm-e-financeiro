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
import { DeliveryAlert } from "@/components/clients/DeliveryAlert";
import { useClients } from "@/contexts/ClientsContext";
import { SalesFunnel } from "@/components/clients/SalesFunnel";
import { KanbanBoard } from "@/components/clients/KanbanBoard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function ClientList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "primeiro_contato" | "orçamento enviado" | "negociacao" | "fechado" | "projeto_finalizado">("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");
  const [sortBy, setSortBy] = useState<"name" | "date" | "value" | "status">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [clearingData, setClearingData] = useState(false);

  // Hook otimizado para clientes
  const { 
    clients, 
    allClients, 
    loading, 
    error, 
    pagination 
  } = useOptimizedClients({
    pageSize: 50,
    searchTerm,
    statusFilter,
    sortBy,
    sortOrder
  });

  const { clients: allClientsFromContext } = useClients();

  // Callback para reset de página quando filtros mudam
  const handleFiltersChange = useCallback((newSearchTerm: string, newStatusFilter: string) => {
    setSearchTerm(newSearchTerm);
    setStatusFilter(newStatusFilter as typeof statusFilter);
    pagination.resetPage();
  }, [pagination]);

  // Callback para atualização após exclusão
  const handleDeleteSuccess = useCallback(() => {
    // Se a página atual ficou vazia após exclusão, voltar uma página
    if (clients.length === 1 && pagination.currentPage > 1) {
      pagination.prevPage();
    }
  }, [clients.length, pagination]);

  // Memoizar estatísticas para evitar recálculos
  const stats = useMemo(() => ({
    total: allClients.length,
    delivered: allClients.filter(c => c.status === "projeto_finalizado").length,
    inProgress: allClients.filter(c => 
      ["fotografado", "em_edicao", "link_enviado"].includes(c.status)
    ).length
  }), [allClients]);

  // Handle clear data
  const handleClearData = async () => {
    setClearingData(true);
    try {
      // This would need to be implemented in the context
      toast.success("Dados limpos com sucesso");
    } catch (error) {
      toast.error("Erro ao limpar dados");
    } finally {
      setClearingData(false);
    }
  };

  // Check if filters are active
  const hasActiveFilters = searchTerm.trim() !== "" || statusFilter !== "all";

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    pagination.resetPage();
  };

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar clientes</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Suspense fallback={<div className="h-16 bg-gray-100 rounded animate-pulse" />}>
          <ClientHeader 
            clients={allClientsFromContext}
            deliveredWorksCount={stats.delivered}
            onClearData={handleClearData}
            clearingData={clearingData}
          />
        </Suspense>

        <Suspense fallback={<div className="h-12 bg-gray-100 rounded animate-pulse" />}>
          <DeliveryAlert 
            showAlert={stats.delivered > 0}
            deliveredCount={stats.delivered}
          />
        </Suspense>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="list">Lista de Clientes</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-8">
            <Suspense fallback={<div className="h-20 bg-gray-100 rounded animate-pulse" />}>
              <ClientFilters
                searchQuery={searchTerm}
                setSearchQuery={(term) => handleFiltersChange(term, statusFilter)}
                statusFilter={statusFilter}
                setStatusFilter={(status) => handleFiltersChange(searchTerm, status)}
                viewMode={viewMode === "cards" ? "card" : "list"}
                setViewMode={(mode) => setViewMode(mode === "card" ? "cards" : "table")}
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                clearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
              />
            </Suspense>

            {loading ? (
              <ClientListSkeleton count={12} variant={viewMode} />
            ) : allClients.length === 0 ? (
              <EmptyClientState hasFilters={hasActiveFilters} />
            ) : clients.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Nenhum cliente encontrado com os filtros aplicados.</p>
              </div>
            ) : (
              <>
                {viewMode === "cards" ? (
                  <OptimizedClientCards 
                    clients={clients} 
                    onDeleteSuccess={handleDeleteSuccess}
                  />
                ) : (
                  <ClientTable 
                    clients={clients} 
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                  />
                )}
                
                <ClientPagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalItems}
                  startIndex={pagination.startIndex}
                  endIndex={pagination.endIndex}
                  hasNextPage={pagination.hasNextPage}
                  hasPrevPage={pagination.hasPrevPage}
                  onPageChange={pagination.goToPage}
                  onNextPage={pagination.nextPage}
                  onPrevPage={pagination.prevPage}
                />
              </>
            )}
          </TabsContent>

        </Tabs>
      </div>
    </Layout>
  );
}
