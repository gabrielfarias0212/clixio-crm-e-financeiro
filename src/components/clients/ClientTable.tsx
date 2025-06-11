
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
                  {client.status === "todas as entregas finalizadas" && (
                    <span className="ml-2" aria-label="Trabalho Entregue">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>{client.weddingDate || "Não definida"}</TableCell>
              <TableCell>{formatCurrency(client.contractValue)}</TableCell>
              <TableCell>
                <StatusBadge status={client.status} />
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {client.email}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/clients/edit/${client.id}`);
                    }}
                  >
                    <Edit className="h-4 w-4 text-gray-500" />
                  </Button>
                  <DeleteClientDialog 
                    onDelete={() => handleDelete(client.id)}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </DeleteClientDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
