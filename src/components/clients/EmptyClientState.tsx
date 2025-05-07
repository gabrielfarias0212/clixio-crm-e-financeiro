
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface EmptyClientStateProps {
  hasFilters: boolean;
}

export function EmptyClientState({ hasFilters }: EmptyClientStateProps) {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-medium mb-2">Nenhum cliente encontrado</h3>
      <p className="text-gray-500 mb-6">
        {hasFilters
          ? "Tente ajustar seus filtros ou adicione um novo cliente."
          : "Comece adicionando seu primeiro cliente."}
      </p>
      <Button onClick={() => navigate("/clients/add")}>
        Adicionar Cliente
      </Button>
    </div>
  );
}
