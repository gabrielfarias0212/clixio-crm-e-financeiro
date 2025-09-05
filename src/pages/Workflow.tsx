import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Plus, Search, X } from "lucide-react";
import { useState } from "react";
import { WorkflowKanban } from "@/components/workflow/WorkflowKanban";
import { QuickProjectForm } from "@/components/workflow/QuickProjectForm";
import { SearchInput } from "@/components/SearchInput";
import { useClients } from "@/contexts/ClientsContext";
import { useWorkflowSearch } from "@/hooks/useWorkflowSearch";

export default function Workflow() {
  const [showQuickForm, setShowQuickForm] = useState(false);
  const { clients, loading } = useClients();

  // Filtrar apenas clientes com projetos em andamento (fechado mas não finalizado)
  const workflowClients = clients.filter(client => 
    client.status === "fechado" || client.status === "projeto_finalizado"
  );

  // Hook de pesquisa
  const {
    searchTerm,
    setSearchTerm,
    filteredClients,
    clearSearch,
    totalResults
  } = useWorkflowSearch(workflowClients);

  const handleQuickSubmit = (data: any) => {
    // Implementar criação rápida de projeto
    console.log("Quick project data:", data);
    setShowQuickForm(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fluxo de Trabalho</h1>
            <p className="text-gray-600 mt-1">
              Acompanhe o progresso de todos os seus projetos
            </p>
          </div>
          <Button onClick={() => setShowQuickForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Projeto
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="max-w-md">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Pesquisar por nome, casal, categoria..."
              className="w-full"
            />
          </div>
          {searchTerm && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-600">
                {totalResults} resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="h-6 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Limpar
              </Button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-600">Projetos Ativos</p>
            <p className="text-2xl font-bold text-gray-900">
              {workflowClients.filter(c => c.status === "fechado").length}
            </p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-600">Em Edição</p>
            <p className="text-2xl font-bold text-blue-600">
              {workflowClients.filter(c => c.inEditing).length}
            </p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-600">Links Enviados</p>
            <p className="text-2xl font-bold text-green-600">
              {workflowClients.filter(c => c.linkSent).length}
            </p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-600">Finalizados</p>
            <p className="text-2xl font-bold text-purple-600">
              {workflowClients.filter(c => c.status === "projeto_finalizado").length}
            </p>
          </div>
        </div>

        {/* Kanban Board */}
        <WorkflowKanban clients={filteredClients} />

        {/* Quick Project Form Modal */}
        {showQuickForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <QuickProjectForm
                onSubmit={handleQuickSubmit}
                onCancel={() => setShowQuickForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}