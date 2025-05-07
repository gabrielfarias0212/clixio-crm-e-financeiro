
import React from "react";
import { useNavigate } from "react-router-dom";
import { Client } from "@/utils/types";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { CheckCircle, Edit, Trash2 } from "lucide-react";
import { formatDate } from "@/utils/clientUtils";
import { Button } from "@/components/ui/button";
import { DeleteClientDialog } from "@/components/client-detail/DeleteClientDialog";
import { useClients } from "@/contexts/ClientsContext";
import { toast } from "sonner";

interface ClientTableProps {
  clients: Client[];
}

export function ClientTable({ clients }: ClientTableProps) {
  const navigate = useNavigate();
  const { removeClient } = useClients();

  // Format contract value to Brazilian currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  // Function to format the wedding date 
  const formatWeddingDate = (date: Date | null) => {
    if (!date) return "Não definida";
    
    // Create a new date at noon to avoid timezone issues
    const weddingDateObj = new Date(date);
    const localDate = new Date(
      weddingDateObj.getFullYear(),
      weddingDateObj.getMonth(),
      weddingDateObj.getDate(),
      12, 0, 0
    );
    
    return formatDate(localDate);
  };

  const handleDelete = async (clientId: string) => {
    try {
      const success = await removeClient(clientId);
      if (success) {
        toast.success("Cliente excluído com sucesso");
      } else {
        toast.error("Erro ao excluir cliente");
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Erro ao excluir cliente");
    }
  };

  const handleRowClick = (clientId: string) => {
    navigate(`/clients/${clientId}`);
  };

  return (
    <div className="bg-white rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow 
              key={client.id} 
              className="hover:bg-gray-50"
            >
              <TableCell 
                className="font-medium cursor-pointer" 
                onClick={() => handleRowClick(client.id)}
              >
                <div className="flex items-center">
                  {client.name}
                  {client.status === "pago" && (
                    <span className="ml-2" aria-label="Trabalho Entregue">
                      <CheckCircle className="text-green-600 h-4 w-4" />
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell 
                className="cursor-pointer" 
                onClick={() => handleRowClick(client.id)}
              >
                {formatWeddingDate(client.weddingDate)}
              </TableCell>
              <TableCell 
                className="cursor-pointer" 
                onClick={() => handleRowClick(client.id)}
              >
                <span className={client.status === "orçamento enviado" || client.status === "follow-up" ? "text-gray-400 italic" : "font-medium"}>
                  {formatCurrency(client.contractValue)}
                </span>
              </TableCell>
              <TableCell 
                className="cursor-pointer" 
                onClick={() => handleRowClick(client.id)}
              >
                <StatusBadge status={client.status} />
              </TableCell>
              <TableCell 
                className="cursor-pointer" 
                onClick={() => handleRowClick(client.id)}
              >
                <div className="text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <div>{client.email}</div>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <div>{client.phone}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/clients/edit/${client.id}`);
                    }}
                    className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Editar cliente</span>
                  </Button>
                  
                  <TableClientDeleteButton 
                    clientId={client.id} 
                    clientName={client.name}
                    onDelete={() => handleDelete(client.id)}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Helper component for delete button with confirmation dialog
function TableClientDeleteButton({ 
  clientId, 
  clientName,
  onDelete 
}: { 
  clientId: string;
  clientName: string;
  onDelete: () => Promise<void>;
}) {
  return (
    <DeleteClientDialog onDelete={onDelete}>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Excluir cliente</span>
      </Button>
    </DeleteClientDialog>
  );
}
