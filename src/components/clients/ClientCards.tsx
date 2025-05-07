
import React from "react";
import { useNavigate } from "react-router-dom";
import { Client } from "@/utils/types";
import { ClientCard } from "@/components/ClientCard";
import { CheckCircle } from "lucide-react";

interface ClientCardsProps {
  clients: Client[];
}

export function ClientCards({ clients }: ClientCardsProps) {
  const navigate = useNavigate();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {clients.map((client) => (
        <div key={client.id} className="relative">
          <ClientCard 
            client={client} 
            onClick={() => navigate(`/clients/${client.id}`)}
          />
          {client.status === "pago" && (
            <div 
              className="absolute -top-2 -right-2 bg-green-100 rounded-full p-1 border border-green-200"
              aria-label="Trabalho Entregue"
            >
              <CheckCircle className="text-green-600 h-4 w-4" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
