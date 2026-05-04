import React, { useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Copy, Shield, Palette, Edit3, Link, Send, Package, CheckCircle, Loader2, HardDrive } from "lucide-react";
import { Client, WorkflowStage } from "@/utils/types";
import { useClients } from "@/contexts/ClientsContext";
import { ProjectDetailDialog } from "./ProjectDetailDialog";

import { toast } from "sonner";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WorkflowKanbanProps {
  clients: Client[];
}

interface OptimisticUpdate {
  clientId: string;
  fromStage: WorkflowStage;
  toStage: WorkflowStage;
  timestamp: number;
}

const workflowStages = [
  {
    id: 'evento_ensaio',
    title: 'Evento/Ensaio',
    icon: Camera,
    color: 'bg-gray-100 border-gray-300',
    headerColor: 'bg-gray-50'
  },
  {
    id: 'copia',
    title: 'Cópia',
    icon: Copy,
    color: 'bg-blue-100 border-blue-300',
    headerColor: 'bg-blue-50'
  },
  {
    id: 'backup',
    title: 'Backup',
    icon: Shield,
    color: 'bg-green-100 border-green-300',
    headerColor: 'bg-green-50'
  },
  {
    id: 'curadoria',
    title: 'Curadoria',
    icon: Palette,
    color: 'bg-purple-100 border-purple-300',
    headerColor: 'bg-purple-50'
  },
  {
    id: 'edicao',
    title: 'Edição',
    icon: Edit3,
    color: 'bg-yellow-100 border-yellow-300',
    headerColor: 'bg-yellow-50'
  },
  {
    id: 'link_pronto',
    title: 'Link Pronto',
    icon: Link,
    color: 'bg-indigo-100 border-indigo-300',
    headerColor: 'bg-indigo-50'
  },
  {
    id: 'link_enviado',
    title: 'Link Enviado',
    icon: Send,
    color: 'bg-cyan-100 border-cyan-300',
    headerColor: 'bg-cyan-50'
  },
  {
    id: 'entrega_fisica',
    title: 'Entrega Física',
    icon: Package,
    color: 'bg-orange-100 border-orange-300',
    headerColor: 'bg-orange-50'
  },
  {
    id: 'projeto_finalizado',
    title: 'Finalizado',
    icon: CheckCircle,
    color: 'bg-green-100 border-green-300',
    headerColor: 'bg-green-50'
  }
];

export function WorkflowKanban({ clients }: WorkflowKanbanProps) {
  const { updateClient } = useClients();
  const [optimisticUpdates, setOptimisticUpdates] = useState<OptimisticUpdate[]>([]);
  const [loadingClients, setLoadingClients] = useState<Set<string>>(new Set());
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Mapear cliente para estágio do workflow baseado nos campos boolean
  const getClientWorkflowStage = useCallback((client: Client): WorkflowStage => {
    // Check for optimistic updates first
    const optimisticUpdate = optimisticUpdates.find(update => 
      update.clientId === client.id && 
      Date.now() - update.timestamp < 10000 // 10 seconds timeout
    );
    
    if (optimisticUpdate) {
      return optimisticUpdate.toStage;
    }

    // Use the database workflow_stage field as primary source
    if (client.workflowStage) {
      return client.workflowStage;
    }

    // Fallback to boolean field logic for backwards compatibility
    if (client.status === 'projeto_finalizado') return 'projeto_finalizado';
    if (client.boxDelivered || client.albumApprovedDelivered) return 'entrega_fisica';
    if (client.linkSent) return 'link_enviado';
    if (client.linkReady) return 'link_pronto';
    if (client.inEditing) return 'edicao';
    if (client.curationCompleted) return 'curadoria';
    if (client.backupCompleted) return 'backup';
    if (client.weddingPhotographed) return 'copia';
    return 'evento_ensaio';
  }, [optimisticUpdates]);

  // Clean up expired optimistic updates
  React.useEffect(() => {
    const interval = setInterval(() => {
      setOptimisticUpdates(prev => 
        prev.filter(update => Date.now() - update.timestamp < 10000)
      );
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, []);

  // Agrupar clientes por estágio
  const getClientsInStage = useCallback((stageId: WorkflowStage) => {
    const stageClients = clients.filter(client => getClientWorkflowStage(client) === stageId);
    
    // Ordenação especial para a etapa evento/ensaio
    if (stageId === 'evento_ensaio') {
      const now = new Date();
      
      return stageClients.sort((a, b) => {
        const dateA = a.weddingDate ? new Date(a.weddingDate) : null;
        const dateB = b.weddingDate ? new Date(b.weddingDate) : null;
        
        // Clientes sem data vão para o final
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        
        // Calcular distância absoluta em relação à data atual (proximidade)
        const distanceA = Math.abs(dateA.getTime() - now.getTime());
        const distanceB = Math.abs(dateB.getTime() - now.getTime());
        
        // Ordenar por proximidade: mais próximos (menor distância) primeiro
        return distanceA - distanceB;
      });
    }
    
    // Para outras etapas, manter ordenação padrão
    return stageClients;
  }, [clients, getClientWorkflowStage]);

  // Atualizar campos boolean baseado no estágio
  const updateClientStage = async (client: Client, newStage: WorkflowStage) => {
    const updates: Partial<Client> = { ...client };

    // CRITICAL: Update the workflow_stage field in database
    updates.workflowStage = newStage;

    // Reset all workflow flags
    updates.weddingPhotographed = false;
    updates.backupCompleted = false;
    updates.curationCompleted = false;
    updates.inEditing = false;
    updates.linkReady = false;
    updates.linkSent = false;
    updates.boxDelivered = false;
    updates.albumApprovedDelivered = false;

    // Set appropriate flags based on stage
    switch (newStage) {
      case 'evento_ensaio':
        // All flags remain false for initial stage
        break;
      case 'copia':
        updates.weddingPhotographed = true;
        // Set nextAction to "editar" for workflow stages that require editing
        updates.nextAction = "editar";
        break;
      case 'backup':
        updates.weddingPhotographed = true;
        updates.backupCompleted = true;
        // Set nextAction to "editar" for workflow stages that require editing
        updates.nextAction = "editar";
        break;
      case 'curadoria':
        updates.weddingPhotographed = true;
        updates.backupCompleted = true;
        updates.curationCompleted = true;
        // Set nextAction to "editar" for workflow stages that require editing
        updates.nextAction = "editar";
        break;
      case 'edicao':
        updates.weddingPhotographed = true;
        updates.backupCompleted = true;
        updates.curationCompleted = true;
        updates.inEditing = true;
        // Set nextAction to "editar" for workflow stages that require editing
        updates.nextAction = "editar";
        break;
      case 'link_pronto':
        updates.weddingPhotographed = true;
        updates.backupCompleted = true;
        updates.curationCompleted = true;
        updates.inEditing = true;
        updates.linkReady = true;
        // Set nextAction to "entregar" for delivery stages
        updates.nextAction = "entregar";
        break;
      case 'link_enviado':
        updates.weddingPhotographed = true;
        updates.backupCompleted = true;
        updates.curationCompleted = true;
        updates.inEditing = true;
        updates.linkReady = true;
        updates.linkSent = true;
        // Set nextAction to "entregar" for delivery stages
        updates.nextAction = "entregar";
        break;
      case 'entrega_fisica':
        updates.weddingPhotographed = true;
        updates.backupCompleted = true;
        updates.curationCompleted = true;
        updates.inEditing = true;
        updates.linkReady = true;
        updates.linkSent = true;
        updates.boxDelivered = true;
        // Set nextAction to "entregar" for delivery stages
        updates.nextAction = "entregar";
        break;
      case 'projeto_finalizado':
        updates.weddingPhotographed = true;
        updates.backupCompleted = true;
        updates.curationCompleted = true;
        updates.inEditing = true;
        updates.linkReady = true;
        updates.linkSent = true;
        // Só marca entrega física se o projeto não for somente digital
        if (!client.semEntregaFisica) updates.boxDelivered = true;
        updates.albumApprovedDelivered = true;
        updates.status = 'projeto_finalizado';
        // Set nextAction to "nenhuma" when project is finalized
        updates.nextAction = "nenhuma";
        break;
    }

    console.log('Updating client workflow stage:', { 
      clientId: client.id, 
      fromStage: client.workflowStage, 
      toStage: newStage,
      currentNextAction: client.nextAction,
      newNextAction: updates.nextAction,
      updates: Object.keys(updates).filter(key => updates[key as keyof Client] !== client[key as keyof Client])
    });

    return updates;
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const clientId = draggableId;
    const newStage = destination.droppableId as WorkflowStage;
    const oldStage = source.droppableId as WorkflowStage;
    const client = clients.find(c => c.id === clientId);

    if (!client) {
      toast.error("Cliente não encontrado");
      return;
    }

    console.log('Drag end initiated:', { 
      clientId, 
      clientName: client.name,
      fromStage: oldStage, 
      toStage: newStage 
    });

    // Add optimistic update
    const optimisticUpdate: OptimisticUpdate = {
      clientId,
      fromStage: oldStage,
      toStage: newStage,
      timestamp: Date.now()
    };
    
    setOptimisticUpdates(prev => [...prev.filter(u => u.clientId !== clientId), optimisticUpdate]);
    setLoadingClients(prev => new Set(prev).add(clientId));

    try {
      const updates = await updateClientStage(client, newStage);
      
      console.log('Sending client update to database:', { 
        clientId: client.id,
        updates: updates
      });
      
      const updatedClient = await updateClient(client.id, updates);
      
      if (updatedClient) {
        console.log('Client updated successfully:', {
          clientId: updatedClient.id,
          newWorkflowStage: updatedClient.workflowStage,
          newNextAction: updatedClient.nextAction,
          weddingPhotographed: updatedClient.weddingPhotographed,
          allWorkflowFields: {
            workflowStage: updatedClient.workflowStage,
            nextAction: updatedClient.nextAction,
            weddingPhotographed: updatedClient.weddingPhotographed,
            backupCompleted: updatedClient.backupCompleted,
            curationCompleted: updatedClient.curationCompleted,
            inEditing: updatedClient.inEditing,
            linkReady: updatedClient.linkReady,
            linkSent: updatedClient.linkSent,
            boxDelivered: updatedClient.boxDelivered,
            albumApprovedDelivered: updatedClient.albumApprovedDelivered
          }
        });
        
        // Remove optimistic update on success
        setOptimisticUpdates(prev => prev.filter(u => u.clientId !== clientId));
        
        
        toast.success(`${client.name} movido para ${workflowStages.find(s => s.id === newStage)?.title}`);
      } else {
        throw new Error('Failed to update client - no response from server');
      }
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      
      // Rollback optimistic update
      setOptimisticUpdates(prev => prev.filter(u => u.clientId !== clientId));
      
      toast.error("Erro ao atualizar o progresso do projeto. Tente novamente.");
    } finally {
      setLoadingClients(prev => {
        const newSet = new Set(prev);
        newSet.delete(clientId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Data não definida";
    try {
      return formatDistanceToNow(parseISO(dateString), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch {
      return "Data inválida";
    }
  };

  const handleCardClick = (client: Client, e: React.MouseEvent) => {
    // Prevent opening dialog when dragging
    if (e.defaultPrevented) return;
    setSelectedClient(client);
    setIsDetailDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedClient(null);
  };

  return (
    <div className="overflow-x-auto">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 min-w-max pb-4">
          {workflowStages.map((stage) => {
            const stageClients = getClientsInStage(stage.id as WorkflowStage);
            const StageIcon = stage.icon;
            
            return (
              <div key={stage.id} className="flex-shrink-0 w-80">
                <div className={`rounded-lg border-2 ${stage.color} h-[32rem] flex flex-col`}>
                  {/* Header */}
                  <div className={`${stage.headerColor} p-4 rounded-t-lg border-b-2 border-current flex-shrink-0`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StageIcon className="h-5 w-5" />
                        <h3 className="font-semibold text-sm">{stage.title}</h3>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {stageClients.length}
                      </Badge>
                    </div>
                  </div>

                  {/* Droppable area */}
                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`p-3 space-y-3 flex-1 overflow-y-auto custom-scrollbar ${
                          snapshot.isDraggingOver ? 'bg-white bg-opacity-50' : ''
                        }`}
                      >
                        {stageClients.map((client, index) => (
                          <Draggable
                            key={client.id}
                            draggableId={client.id}
                            index={index}
                          >
                            {(provided, snapshot) => {
                              const isLoading = loadingClients.has(client.id);
                              
                              return (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={(e) => handleCardClick(client, e)}
                                  className={`cursor-pointer transition-all hover:shadow-md ${
                                    snapshot.isDragging ? 'shadow-lg rotate-3' : ''
                                  } ${isLoading ? 'opacity-75' : ''}`}
                                >
                                  <CardContent className="p-3">
                                    <div className="space-y-2">
                                      <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                          <h4 className="font-medium text-sm leading-tight">
                                            {client.name}
                                          </h4>
                                          {isLoading && (
                                            <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                                          )}
                                        </div>
                                        <Badge 
                                          variant="outline" 
                                          className="text-xs ml-2 flex-shrink-0"
                                        >
                                          {client.eventCategory}
                                        </Badge>
                                      </div>
                                    
                                    {client.weddingDate && (
                                      <p className="text-xs text-gray-600">
                                        📅 {formatDate(client.weddingDate)}
                                      </p>
                                    )}
                                    
                                    {client.contractValue > 0 && (
                                      <p className="text-xs font-medium text-green-600">
                                        R$ {client.contractValue.toLocaleString('pt-BR')}
                                      </p>
                                    )}

                                    {client.coupleName && (
                                      <p className="text-xs text-gray-500">
                                        {client.coupleName}
                                      </p>
                                    )}

                                    {client.storageLocation && (
                                      <div className="flex items-center gap-1 text-xs text-blue-600">
                                        <HardDrive className="h-3 w-3" />
                                        <span>{client.storageLocation}</span>
                                      </div>
                                    )}
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            }}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Modal de detalhes do projeto */}
      <ProjectDetailDialog
        client={selectedClient}
        isOpen={isDetailDialogOpen}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
