
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
import { CheckCircle } from "lucide-react";
import { formatDate } from "@/utils/clientUtils";

interface ClientTableProps {
  clients: Client[];
}

export function ClientTable({ clients }: ClientTableProps) {
  const navigate = useNavigate();

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
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow 
              key={client.id} 
              onClick={() => navigate(`/clients/${client.id}`)}
              className="cursor-pointer hover:bg-gray-50"
            >
              <TableCell className="font-medium">
                <div className="flex items-center">
                  {client.name}
                  {client.status === "pago" && (
                    <span className="ml-2" aria-label="Trabalho Entregue">
                      <CheckCircle className="text-green-600 h-4 w-4" />
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {formatWeddingDate(client.weddingDate)}
              </TableCell>
              <TableCell>
                <span className={client.status === "orçamento enviado" || client.status === "follow-up" ? "text-gray-400 italic" : "font-medium"}>
                  {formatCurrency(client.contractValue)}
                </span>
              </TableCell>
              <TableCell>
                <StatusBadge status={client.status} />
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <div>{client.email}</div>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <div>{client.phone}</div>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
