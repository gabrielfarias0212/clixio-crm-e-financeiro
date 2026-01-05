import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Client } from "@/utils/types";
import { updateClient } from "@/utils/supabase/client-update";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface PreWeddingCompleteActionProps {
  client: Client;
  onStatusUpdate?: () => void;
}

export function PreWeddingCompleteAction({ client, onStatusUpdate }: PreWeddingCompleteActionProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleMarkAsCompleted = async (checked: boolean) => {
    if (!checked || isUpdating) return;
    
    setIsUpdating(true);
    
    try {
      // Set preWeddingCompleted to true and keep preWeddingDate as today if not set
      const today = new Date().toISOString().split('T')[0];
      
      await updateClient(client.id, {
        preWeddingCompleted: true,
        preWeddingDate: client.preWeddingDate || today,
      });
      
      setIsCompleted(true);
      toast.success(`Pré-wedding de ${client.name} marcado como realizado!`);
      
      // Refresh the alerts list
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error) {
      console.error("Erro ao atualizar pré-wedding:", error);
      toast.error("Erro ao atualizar status do pré-wedding");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="flex items-center gap-2 mt-2 text-xs text-green-600">
        <Checkbox checked disabled className="h-4 w-4" />
        <span className="font-medium">Pré-wedding marcado como realizado</span>
      </div>
    );
  }

  return (
    <div 
      className="flex items-center gap-2 mt-2" 
      onClick={(e) => e.stopPropagation()}
    >
      {isUpdating ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Atualizando...</span>
        </div>
      ) : (
        <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <Checkbox 
            id={`prewedding-complete-${client.id}`}
            checked={false}
            onCheckedChange={handleMarkAsCompleted}
            className="h-4 w-4"
          />
          <span className="text-xs text-muted-foreground font-medium">
            Marcar pré-wedding como realizado
          </span>
        </label>
      )}
    </div>
  );
}
