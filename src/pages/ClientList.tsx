import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import { Client, ClientStatus } from "@/utils/types";
import { useClients } from "@/contexts/ClientsContext";
import { clearAllData } from "@/utils/supabaseUtils";
import { toast } from "sonner";

// Import our new component files
import { ClientHeader } from "@/components/clients/ClientHeader";
import { ClientFilters } from "@/components/clients/ClientFilters";
import { ClientTable } from "@/components/clients/ClientTable";
import { ClientCards } from "@/components/clients/ClientCards";
import { EmptyClientState } from "@/components/clients/EmptyClientState";
import { DeliveryAlert } from "@/components/clients/DeliveryAlert";

export default function ClientList() {
  const { clients, loading, refreshClients } = useClients();
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "all">("all");
  const [clearingData, setClearingData] = useState(false);
  const [showDeliveredAlert, setShowDeliveredAlert] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [deliveryFilter, setDeliveryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Check if there are any newly delivered clients
  useEffect(() => {
    const hasDeliveredClients = sessionStorage.getItem('hasDeliveredWork');
    if (hasDeliveredClients === 'true') {
      setShowDeliveredAlert(true);
      // Clear the flag after showing the alert
      setTimeout(() => {
        setShowDeliveredAlert(false);
        sessionStorage.removeItem('hasDeliveredWork');
      }, 5000); // Hide after 5 seconds
    }
  }, []);

  // Apply filters when search or status changes
  useEffect(() => {
    if (!clients) return;
    
    let result = [...clients];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        client =>
          client.name.toLowerCase().includes(query) ||
          (client.email && client.email.toLowerCase().includes(query)) ||
          (client.phone && client.phone.toLowerCase().includes(query))
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter(client => client.status === statusFilter);
    }

    setFilteredClients(result);
  }, [searchQuery, statusFilter, clients]);

  // Set page title
  useEffect(() => {
    document.title = "Clientes | Wedding CRM";
  }, []);

  // Clear filters
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const handleClearData = async () => {
    if (window.confirm("Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.")) {
      setClearingData(true);
      try {
        const success = await clearAllData();
        if (success) {
          toast.success("Todos os dados foram excluídos com sucesso");
          await refreshClients();
        } else {
          toast.error("Erro ao limpar dados");
        }
      } catch (error) {
        console.error("Error clearing data:", error);
        toast.error("Erro ao limpar dados");
      } finally {
        setClearingData(false);
      }
    }
  };

  // Count delivered works - only count clients with status "entregue"
  const deliveredWorksCount = clients.filter(client => client.status === "entregue").length;
  
  // Check if filters are active
  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all";

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      // Status filter
      if (statusFilter !== "all" && statusFilter !== client.status) {
        return false;
      }

      // Delivery filter
      if (deliveryFilter === "delivered") {
        return client.status === "todas as entregas finalizadas";
      } else if (deliveryFilter === "pending") {
        return client.status !== "todas as entregas finalizadas";
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          client.name.toLowerCase().includes(searchLower) ||
          client.email.toLowerCase().includes(searchLower) ||
          client.phone.toLowerCase().includes(searchLower) ||
          client.status.toLowerCase().includes(searchLower) ||
          client.eventCategory.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [clients, statusFilter, deliveryFilter, searchTerm]);

  return (
    <Layout>
      <div className="max-w-screen-2xl mx-auto px-4 py-8 animate-fade-in">
        <DeliveryAlert 
          showAlert={showDeliveredAlert} 
          deliveredCount={deliveredWorksCount} 
        />
        
        <ClientHeader
          clients={clients}
          deliveredWorksCount={deliveredWorksCount}
          onClearData={handleClearData}
          clearingData={clearingData}
        />
        
        <ClientFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          viewMode={viewMode}
          setViewMode={setViewMode}
          clearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
          deliveryFilter={deliveryFilter}
          setDeliveryFilter={setDeliveryFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <p>Carregando clientes...</p>
          </div>
        ) : filteredClients.length > 0 ? (
          viewMode === "list" ? (
            <ClientTable clients={filteredClients} />
          ) : (
            <ClientCards clients={filteredClients} />
          )
        ) : (
          <EmptyClientState hasFilters={hasActiveFilters} />
        )}
      </div>
    </Layout>
  );
}
