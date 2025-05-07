
import { useState } from "react";
import { Client } from "@/utils/types";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast"; 
import { useClients } from "@/contexts/ClientsContext";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";

interface DeliveryWorkflowProps {
  client: Client;
}

export function DeliveryWorkflow({ client }: DeliveryWorkflowProps) {
  const { updateClient } = useClients();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  // Only show for wedding events
  if (client.eventCategory !== "Casamento") {
    return (
      <div className="p-4 text-center text-gray-500">
        O fluxo de entrega está disponível apenas para eventos de casamento.
      </div>
    );
  }

  const updateWorkflowStatus = async (field: string, value: boolean) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    
    try {
      const updates = { [field]: value };
      const result = await updateClient(client.id, updates);
      
      if (result) {
        toast({
          title: "Status atualizado",
          description: `O status foi atualizado com sucesso.`,
        });
      } else {
        throw new Error("Falha ao atualizar o status");
      }
    } catch (error) {
      console.error("Error updating workflow status:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o status. Tente novamente.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Calculate progress
  const totalSteps = 9; // Total number of checkboxes
  const completedSteps = [
    client.preWeddingScheduled,
    client.preWeddingCompleted,
    client.preWeddingDelivered,
    client.weddingPhotographed,
    client.inEditing,
    client.linkSent,
    client.boxDelivered,
    client.albumDesigned,
    client.albumApprovedDelivered
  ].filter(Boolean).length;
  
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

  const CheckboxItem = ({ 
    label, 
    checked, 
    onChange,
    field
  }: { 
    label: string, 
    checked?: boolean, 
    onChange: (checked: boolean) => void,
    field: string
  }) => (
    <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
      <Checkbox 
        id={field}
        checked={checked} 
        onCheckedChange={onChange} 
        disabled={isUpdating}
      />
      <Label 
        htmlFor={field}
        className="text-sm font-medium leading-none cursor-pointer"
      >
        {label}
      </Label>
    </div>
  );

  return (
    <div className="space-y-6 py-4">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Progresso de Entrega</span>
          <span className="text-sm font-medium">{progressPercentage}%</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      <Card className="p-4">
        <h3 className="text-md font-medium mb-4">Fluxo de Entrega</h3>
        
        <div className="space-y-1">
          <CheckboxItem
            label="Pré-wedding agendado?"
            checked={client.preWeddingScheduled}
            onChange={(checked) => updateWorkflowStatus('preWeddingScheduled', checked)}
            field="pre_wedding_scheduled"
          />
          
          <CheckboxItem
            label="Pré-wedding feito?"
            checked={client.preWeddingCompleted}
            onChange={(checked) => updateWorkflowStatus('preWeddingCompleted', checked)}
            field="pre_wedding_completed"
          />
          
          <CheckboxItem
            label="Pré-wedding entregue?"
            checked={client.preWeddingDelivered}
            onChange={(checked) => updateWorkflowStatus('preWeddingDelivered', checked)}
            field="pre_wedding_delivered"
          />
          
          <CheckboxItem
            label="Casamento fotografado?"
            checked={client.weddingPhotographed}
            onChange={(checked) => updateWorkflowStatus('weddingPhotographed', checked)}
            field="wedding_photographed"
          />
          
          <CheckboxItem
            label="Em edição?"
            checked={client.inEditing}
            onChange={(checked) => updateWorkflowStatus('inEditing', checked)}
            field="in_editing"
          />
          
          <CheckboxItem
            label="Link enviado?"
            checked={client.linkSent}
            onChange={(checked) => updateWorkflowStatus('linkSent', checked)}
            field="link_sent"
          />
          
          <CheckboxItem
            label="Caixinha entregue? (se aplicável)"
            checked={client.boxDelivered}
            onChange={(checked) => updateWorkflowStatus('boxDelivered', checked)}
            field="box_delivered"
          />
          
          <CheckboxItem
            label="Album diagramado? (se aplicável)"
            checked={client.albumDesigned}
            onChange={(checked) => updateWorkflowStatus('albumDesigned', checked)}
            field="album_designed"
          />
          
          <CheckboxItem
            label="Álbum aprovado e entregue? (se aplicável)"
            checked={client.albumApprovedDelivered}
            onChange={(checked) => updateWorkflowStatus('albumApprovedDelivered', checked)}
            field="album_approved_delivered"
          />
        </div>
      </Card>
    </div>
  );
}
