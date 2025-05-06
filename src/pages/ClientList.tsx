
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { ClientCard } from "@/components/ClientCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Client, ClientStatus } from "@/utils/types";
import { ChevronDown, Search, Trash2, X, CheckCircle, Upload } from "lucide-react";
import { useClients } from "@/contexts/ClientsContext";
import { clearAllData } from "@/utils/supabaseUtils";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ClientList() {
  const navigate = useNavigate();
  const { clients, loading, refreshClients } = useClients();
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "all">("all");
  const [clearingData, setClearingData] = useState(false);
  const [showDeliveredAlert, setShowDeliveredAlert] = useState(false);
  
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

  // Count delivered works
  const deliveredWorksCount = clients.filter(client => client.status === "pago").length;

  return (
    <Layout>
      <div className="max-w-screen-2xl mx-auto px-4 py-8 animate-fade-in">
        {showDeliveredAlert && (
          <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              Trabalho marcado como entregue com sucesso! Total de trabalhos entregues: {deliveredWorksCount}.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Clientes</h1>
            {deliveredWorksCount > 0 && (
              <div className="flex items-center gap-1 mt-1 text-sm text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span>{deliveredWorksCount} {deliveredWorksCount === 1 ? 'trabalho entregue' : 'trabalhos entregues'}</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            {clients && clients.length > 0 && (
              <Button 
                variant="outline" 
                onClick={handleClearData}
                disabled={clearingData}
                className="flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                {clearingData ? "Limpando..." : "Limpar Dados"}
              </Button>
            )}
            <Button 
              variant="outline"
              onClick={() => navigate("/clients/import")}
              className="flex items-center gap-1"
            >
              <Upload className="h-4 w-4" />
              Importar Clientes
            </Button>
            <Button 
              onClick={() => navigate("/clients/add")}
            >
              Adicionar Cliente
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-3">
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
                <DropdownMenuRadioItem value="orçamento enviado">Orçamento enviado</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="follow-up">Follow-up</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="fechado">Fechado</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="em andamento">Em andamento</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="pago">Pago</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {(searchQuery || statusFilter !== "all") && (
            <Button 
              variant="ghost" 
              onClick={clearFilters}
              className="sm:ml-auto w-full sm:w-auto"
            >
              Limpar filtros
            </Button>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <p>Carregando clientes...</p>
          </div>
        ) : filteredClients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredClients.map((client) => (
              <div key={client.id} className="relative">
                <ClientCard 
                  client={client} 
                  onClick={() => navigate(`/clients/${client.id}`)}
                />
                {client.status === "pago" && (
                  <div 
                    className="absolute -top-2 -right-2 bg-green-100 rounded-full p-1 border border-green-200"
                    title="Trabalho Entregue"
                  >
                    <CheckCircle className="text-green-600 h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Nenhum cliente encontrado</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || statusFilter !== "all" 
                ? "Tente ajustar seus filtros ou adicione um novo cliente." 
                : "Comece adicionando seu primeiro cliente."}
            </p>
            <Button onClick={() => navigate("/clients/add")}>
              Adicionar Cliente
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
