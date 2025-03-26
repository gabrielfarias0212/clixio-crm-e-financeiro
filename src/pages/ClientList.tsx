
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { clients } from "@/utils/mockData";
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
import { ChevronDown, Search, X } from "lucide-react";

export default function ClientList() {
  const navigate = useNavigate();
  const [filteredClients, setFilteredClients] = useState<Client[]>(clients);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "all">("all");

  // Apply filters when search or status changes
  useEffect(() => {
    let result = [...clients];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        client =>
          client.name.toLowerCase().includes(query) ||
          client.email.toLowerCase().includes(query) ||
          client.phone.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter(client => client.status === statusFilter);
    }

    setFilteredClients(result);
  }, [searchQuery, statusFilter]);

  // Set page title
  useEffect(() => {
    document.title = "Clientes | Wedding CRM";
  }, []);

  // Clear filters
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  return (
    <Layout>
      <div className="max-w-screen-2xl mx-auto px-4 py-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold">Clientes</h1>
          <Button 
            onClick={() => navigate("/clients/add")}
          >
            Adicionar Cliente
          </Button>
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
        {filteredClients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredClients.map((client) => (
              <ClientCard 
                key={client.id} 
                client={client} 
                onClick={() => navigate(`/clients/${client.id}`)}
              />
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
