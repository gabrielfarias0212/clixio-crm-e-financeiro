
import { useState } from "react";
import { Client } from "@/utils/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast"; 
import { useClients } from "@/contexts/ClientsContext";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { isWorkDelivered, isFullyPaid } from "@/utils/clientUtils";
import { CheckCircle, Package, Truck } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface DeliveryWorkflowProps {
  client: Client;
}

export function DeliveryWorkflow({ client: initialClient }: DeliveryWorkflowProps) {
  const { updateClient } = useClients();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [client, setClient] = useState(initialClient);

  // Mostrar para eventos de casamento e aniversário
  if (client.eventCategory !== "Casamento" && client.eventCategory !== "Aniversario") {
    return (
      <div className="p-4 text-center text-gray-500">
        O fluxo de entrega está disponível apenas para eventos de casamento e aniversário.
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
        // Atualiza o estado local imediatamente
        const updatedClient = {
          ...client,
          [field]: value
        };
        setClient(updatedClient);
        
        // Check if work is now delivered and update status automatically
        if (isWorkDelivered(updatedClient) && isFullyPaid(updatedClient) && updatedClient.status !== "projeto_finalizado") {
          await updateClient(client.id, { status: "projeto_finalizado" });
          setClient(prev => ({ ...prev, status: "projeto_finalizado" }));
        }
        
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

  const markAsDelivered = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    
    try {
      const updates = { 
        isDelivered: true,
        status: "projeto_finalizado" as const
      };
      const result = await updateClient(client.id, updates);
      
      if (result) {
        setClient(prev => ({ ...prev, ...updates }));
        
        toast({
          title: "Trabalho marcado como entregue",
          description: "O cliente foi marcado como trabalho entregue e concluído.",
        });
      } else {
        throw new Error("Falha ao marcar como entregue");
      }
    } catch (error) {
      console.error("Error marking as delivered:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível marcar como entregue. Tente novamente.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Calculate progress
  const needsPreWedding = client.hasPreWedding !== false;
  const semEntregaFisica = client.semEntregaFisica ?? false;
  // totalSteps: pré-wedding (3) + etapas principais (8), descontando entrega física se digital
  const baseSteps = semEntregaFisica ? 7 : 8;
  const totalSteps = needsPreWedding ? baseSteps + 3 : baseSteps;
  
  // Count completed steps, excluding pre-wedding steps if not needed
  const completedSteps = [
    // Only count pre-wedding steps if needed
    ...(needsPreWedding ? [
      client.preWeddingScheduled,
      client.preWeddingCompleted,
      client.preWeddingDelivered,
    ] : []),
    // Always count these steps
    client.weddingPhotographed,
    client.backupCompleted,
    client.curationCompleted,
    client.inEditing,
    client.linkSent,
    // Entrega física só conta se não for digital
    ...(semEntregaFisica ? [] : [client.boxDelivered]),
    client.albumDesigned,
    client.albumApprovedDelivered
  ].filter(Boolean).length;
  
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);
  const workFullyDelivered = isWorkDelivered(client);
  const fullyPaid = isFullyPaid(client);
  const canMarkAsDelivered = workFullyDelivered && fullyPaid && client.status !== "projeto_finalizado";

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
          {needsPreWedding && (
            <>
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
            </>
          )}
          
          <CheckboxItem
            label="Evento fotografado?"
            checked={client.weddingPhotographed}
            onChange={(checked) => updateWorkflowStatus('weddingPhotographed', checked)}
            field="wedding_photographed"
          />
          
          <CheckboxItem
            label="Cópia/Backup feito?"
            checked={client.backupCompleted}
            onChange={(checked) => updateWorkflowStatus('backupCompleted', checked)}
            field="backup_completed"
          />
          
          <CheckboxItem
            label="Curadoria feita?"
            checked={client.curationCompleted}
            onChange={(checked) => updateWorkflowStatus('curationCompleted', checked)}
            field="curation_completed"
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
          
          {!semEntregaFisica && (
            <CheckboxItem
              label="Caixinha entregue? (se aplicável)"
              checked={client.boxDelivered}
              onChange={(checked) => updateWorkflowStatus('boxDelivered', checked)}
              field="box_delivered"
            />
          )}

          {/* Toggle: entrega somente digital */}
          <div className="flex items-center justify-between p-2 mt-2 rounded border border-dashed border-gray-200">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Sem entrega física</p>
                <p className="text-xs text-muted-foreground">Entrega somente digital</p>
              </div>
            </div>
            <Switch
              checked={semEntregaFisica}
              onCheckedChange={(value) => updateWorkflowStatus('semEntregaFisica', value)}
            />
          </div>
          
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

        {/* Final delivery section */}
        {workFullyDelivered && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-green-700">
                  Todas as etapas principais foram concluídas
                </span>
              </div>
              
              {canMarkAsDelivered && (
                <Button 
                  onClick={markAsDelivered}
                  disabled={isUpdating}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Package className="h-4 w-4 mr-1" />
                  Marcar como Entregue
                </Button>
              )}
            </div>
            
            {client.status === "projeto_finalizado" && (
              <div className="mt-2 text-sm text-green-600">
                ✅ Trabalho marcado como entregue e concluído
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
