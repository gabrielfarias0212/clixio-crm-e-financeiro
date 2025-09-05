import React from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Copy, Shield, Palette, Edit3, Link, Send, Package, CheckCircle } from "lucide-react";
import { Client, WorkflowStage } from "@/utils/types";
import { useClients } from "@/contexts/ClientsContext";
import { toast } from "sonner";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WorkflowKanbanProps {
  clients: Client[];
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

  // Mapear cliente para estágio do workflow baseado nos campos boolean
  const getClientWorkflowStage = (client: Client): WorkflowStage => {
    if (client.status === 'projeto_finalizado') return 'projeto_finalizado';
    if (client.boxDelivered || client.albumApprovedDelivered) return 'entrega_fisica';
    if (client.linkSent) return 'link_enviado';
    if (client.linkReady) return 'link_pronto';
    if (client.inEditing) return 'edicao';
    if (client.curationCompleted) return 'curadoria';
    if (client.backupCompleted) return 'backup';
    if (client.weddingPhotographed) return 'copia';
    return 'evento_ensaio';
  };

  // Agrupar clientes por estágio
  const getClientsInStage = (stageId: WorkflowStage) => {
    return clients.filter(client => getClientWorkflowStage(client) === stageId);
  };

  // Atualizar campos boolean baseado no estágio
  const updateClientStage = async (client: Client, newStage: WorkflowStage) => {
    const updates: Partial<Client> = { ...client };

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
      case 'copia':
        updates.weddingPhotographed = true;
        break;
      case 'backup':
        updates.weddingPhotographed = true;
        updates.backupCompleted = true;
        break;
      case 'curadoria':
        updates.weddingPhotographed = true;
        updates.backupCompleted = true;
        updates.curationCompleted = true;
        break;
      case 'edicao':
        updates.weddingPhotographed = true;
        updates.backupCompleted = true;
        updates.curationCompleted = true;
        updates.inEditing = true;
        break;
      case 'link_pronto':
        updates.weddingPhotographed = true;
        updates.backupCompleted = true;
        updates.curationCompleted = true;
        updates.inEditing = true;
        updates.linkReady = true;
        break;
      case 'link_enviado':
        updates.weddingPhotographed = true;
        updates.backupCompleted = true;
        updates.curationCompleted = true;
        updates.inEditing = true;
        updates.linkReady = true;
        updates.linkSent = true;
        break;
      case 'entrega_fisica':
        updates.weddingPhotographed = true;
        updates.backupCompleted = true;
        updates.curationCompleted = true;
        updates.inEditing = true;
        updates.linkReady = true;
        updates.linkSent = true;
        updates.boxDelivered = true;
        break;
      case 'projeto_finalizado':
        updates.weddingPhotographed = true;
        updates.backupCompleted = true;
        updates.curationCompleted = true;
        updates.inEditing = true;
        updates.linkReady = true;
        updates.linkSent = true;
        updates.boxDelivered = true;
        updates.albumApprovedDelivered = true;
        updates.status = 'projeto_finalizado';
        break;
    }

    return updates;
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const clientId = draggableId;
    const newStage = destination.droppableId as WorkflowStage;
    const client = clients.find(c => c.id === clientId);

    if (!client) return;

    try {
      const updates = await updateClientStage(client, newStage);
      await updateClient(client.id, updates);
      
      toast.success(`${client.name} movido para ${workflowStages.find(s => s.id === newStage)?.title}`);
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      toast.error("Erro ao atualizar o progresso do projeto");
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

  return (
    <div className="overflow-x-auto">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 min-w-max pb-4">
          {workflowStages.map((stage) => {
            const stageClients = getClientsInStage(stage.id as WorkflowStage);
            const StageIcon = stage.icon;
            
            return (
              <div key={stage.id} className="flex-shrink-0 w-80">
                <div className={`rounded-lg border-2 ${stage.color} min-h-[600px]`}>
                  {/* Header */}
                  <div className={`${stage.headerColor} p-4 rounded-t-lg border-b-2 border-current`}>
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
                        className={`p-3 space-y-3 min-h-[500px] ${
                          snapshot.isDraggingOver ? 'bg-white bg-opacity-50' : ''
                        }`}
                      >
                        {stageClients.map((client, index) => (
                          <Draggable
                            key={client.id}
                            draggableId={client.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`cursor-move transition-shadow hover:shadow-md ${
                                  snapshot.isDragging ? 'shadow-lg rotate-3' : ''
                                }`}
                              >
                                <CardContent className="p-3">
                                  <div className="space-y-2">
                                    <div className="flex items-start justify-between">
                                      <h4 className="font-medium text-sm leading-tight">
                                        {client.name}
                                      </h4>
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
                                  </div>
                                </CardContent>
                              </Card>
                            )}
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
    </div>
  );
}