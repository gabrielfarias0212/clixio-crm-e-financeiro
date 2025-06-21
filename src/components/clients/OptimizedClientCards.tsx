
import React, { memo } from "react";
import { useNavigate } from "react-router-dom";
import { Client } from "@/utils/types";
import { ClientCard } from "@/components/ClientCard";
import { CheckCircle, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteClientDialog } from "@/components/client-detail/DeleteClientDialog";
import { useClients } from "@/contexts/ClientsContext";
import { toast } from "sonner";

interface OptimizedClientCardsProps {
  clients: Client[];
  onDeleteSuccess?: () => void;
}

// Memoizar o item individual do card para evitar re-renders desnecessários
const ClientCardItem = memo(({ client, onDelete }: { client: Client; onDelete: (id: string) => Promise<void> }) => {
  const navigate = useNavigate();

  return (
    <div className="relative">
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/clients/edit/${client.id}`);
          }}
          className="h-8 w-8 p-0 bg-white/80 text-gray-600 hover:text-blue-600 hover:bg-white rounded-full shadow-sm"
        >
          <Edit className="h-3.5 w-3.5" />
          <span className="sr-only">Editar cliente</span>
        </Button>
        
        <DeleteClientDialog onDelete={() => onDelete(client.id)}>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 bg-white/80 text-gray-600 hover:text-red-600 hover:bg-white rounded-full shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Excluir cliente</span>
          </Button>
        </DeleteClientDialog>
      </div>
      
      <ClientCard 
        client={client} 
        onClick={() => navigate(`/clients/${client.id}`)}
      />
      {client.status === "projeto_finalizado" && (
        <div 
          className="absolute -top-2 -right-2 bg-green-100 rounded-full p-1 border border-green-200"
          aria-label="Trabalho Entregue"
        >
          <CheckCircle className="text-green-600 h-4 w-4" />
        </div>
      )}
    </div>
  );
});

ClientCardItem.displayName = 'ClientCardItem';

export const OptimizedClientCards = memo(({ clients, onDeleteSuccess }: OptimizedClientCardsProps) => {
  const { removeClient } = useClients();

  const handleDelete = async (clientId: string): Promise<void> => {
    try {
      const success = await removeClient(clientId);
      if (success) {
        toast.success("Cliente excluído com sucesso");
        onDeleteSuccess?.();
      } else {
        toast.error("Erro ao excluir cliente");
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Erro ao excluir cliente");
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {clients.map((client) => (
        <ClientCardItem 
          key={client.id} 
          client={client} 
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
});

OptimizedClientCards.displayName = 'OptimizedClientCards';
