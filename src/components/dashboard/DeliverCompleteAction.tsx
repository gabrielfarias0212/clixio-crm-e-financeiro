import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Client } from "@/utils/types";
import { useClients } from "@/contexts/ClientsContext";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeliverCompleteActionProps {
  client: Client;
  onStatusUpdate?: () => void;
}

export function DeliverCompleteAction({ client, onStatusUpdate }: DeliverCompleteActionProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const { updateClient } = useClients();

  const handleMarkAsDelivered = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    
    try {
      // Mark the work as delivered and finalized
      // Update workflow-related fields and status
      // IMPORTANT: Use null (not undefined) to clear nextAction field in database
      const result = await updateClient(client.id, {
        // Clear next action (use null to actually remove the value in DB)
        nextAction: null as any,
        // Mark as delivered in workflow
        linkSent: true,
        boxDelivered: true,
        albumApprovedDelivered: true,
        // Set workflow stage to finalized
        workflowStage: 'projeto_finalizado',
        // Update status to finalized
        status: 'projeto_finalizado'
      });
      
      if (result) {
        setIsCompleted(true);
        toast.success(`Trabalho de ${client.name} marcado como entregue e finalizado!`);
        setShowDialog(false);
        
        // Refresh the alerts list
        if (onStatusUpdate) {
          onStatusUpdate();
        }
      }
    } catch (error) {
      console.error("Erro ao marcar como entregue:", error);
      toast.error("Erro ao atualizar status do trabalho");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="flex items-center gap-2 mt-2 text-xs text-green-600">
        <CheckCircle2 className="h-4 w-4" />
        <span className="font-medium">Trabalho marcado como entregue e finalizado</span>
      </div>
    );
  }

  return (
    <div 
      className="flex items-center gap-2 mt-2" 
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        size="sm"
        variant="outline"
        onClick={() => setShowDialog(true)}
        disabled={isUpdating}
        className="text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800"
      >
        {isUpdating ? (
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        ) : (
          <CheckCircle2 className="h-3 w-3 mr-1" />
        )}
        Marcar como Entregue
      </Button>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marcar Trabalho como Entregue</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja marcar o trabalho de <strong>{client.name}</strong> como entregue?
              <br /><br />
              Esta ação irá:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Marcar o trabalho como entregue</li>
                <li>Atualizar o status para "Projeto Finalizado"</li>
                <li>Atualizar o fluxo de trabalho para a etapa final</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleMarkAsDelivered} 
              disabled={isUpdating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Confirmar Entrega
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
