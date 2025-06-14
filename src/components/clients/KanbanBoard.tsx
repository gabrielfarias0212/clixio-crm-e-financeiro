
import React from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Client, SalesFunnelStage, ClientStatus } from "@/utils/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Send, MessageCircle, FileCheck, Archive } from "lucide-react";
import { useClients } from "@/contexts/ClientsContext";
import { toast } from "sonner";

interface KanbanBoardProps {
  clients: Client[];
}

const funnelStages: Array<{
  key: SalesFunnelStage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  statusMapping: ClientStatus[];
}> = [
  {
    key: "primeiro_contato",
    label: "Primeiro Contato",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    statusMapping: ["orçamento enviado"]
  },
  {
    key: "orcamento_enviado",
    label: "Orçamento Enviado",
    icon: Send,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    statusMapping: ["orçamento enviado"]
  },
  {
    key: "negociacao",
    label: "Negociação",
    icon: MessageCircle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    statusMapping: ["follow-up"]
  },
  {
    key: "contrato_fechado",
    label: "Contrato Fechado",
    icon: FileCheck,
    color: "text-green-600",
    bgColor: "bg-green-50",
    statusMapping: ["fechado", "em andamento", "pago"]
  },
  {
    key: "projeto_finalizado",
    label: "Projeto Finalizado",
    icon: Archive,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    statusMapping: ["entregue"]
  }
];

export function KanbanBoard({ clients }: KanbanBoardProps) {
  const { updateClient } = useClients();

  const getClientsInStage = (stage: SalesFunnelStage) => {
    return clients.filter(client => client.salesFunnelStage === stage);
  };

  const getTotalValue = (clientsInStage: Client[]) => {
    return clientsInStage.reduce((total, client) => total + (client.contractValue || 0), 0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const mapFunnelStageToStatus = (stage: SalesFunnelStage): ClientStatus => {
    const stageConfig = funnelStages.find(s => s.key === stage);
    return stageConfig?.statusMapping[0] || "orçamento enviado";
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const clientId = draggableId;
    const newStage = destination.droppableId as SalesFunnelStage;
    const newStatus = mapFunnelStageToStatus(newStage);

    try {
      const success = await updateClient(clientId, {
        salesFunnelStage: newStage,
        status: newStatus
      });

      if (success) {
        toast.success(`Cliente movido para ${funnelStages.find(s => s.key === newStage)?.label}`);
      } else {
        toast.error("Erro ao mover cliente");
      }
    } catch (error) {
      console.error("Error updating client stage:", error);
      toast.error("Erro ao mover cliente");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Funil de Vendas - Kanban</h2>
        <Badge variant="outline" className="text-sm">
          {clients.length} clientes totais
        </Badge>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Container principal com scroll horizontal */}
        <div className="w-full overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {funnelStages.map((stage) => {
              const clientsInStage = getClientsInStage(stage.key);
              const totalValue = getTotalValue(clientsInStage);
              const Icon = stage.icon;
              
              return (
                <div key={stage.key} className="flex-none w-72">
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-lg ${stage.bgColor}`}>
                          <Icon className={`h-4 w-4 ${stage.color}`} />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {clientsInStage.length}
                        </Badge>
                      </div>
                      <CardTitle className="text-sm font-medium text-gray-900">
                        {stage.label}
                      </CardTitle>
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(totalValue)}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <Droppable droppableId={stage.key}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`min-h-32 max-h-96 overflow-y-auto space-y-2 p-2 rounded-lg transition-colors ${
                              snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-blue-200 border-dashed' : 'bg-gray-50'
                            }`}
                          >
                            {clientsInStage.map((client, index) => (
                              <Draggable
                                key={client.id}
                                draggableId={client.id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`mb-2 p-3 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-move ${
                                      snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                                    }`}
                                  >
                                    <div className="space-y-1">
                                      <h4 className="font-medium text-sm text-gray-900 truncate">
                                        {client.name}
                                      </h4>
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-green-600">
                                          {formatCurrency(client.contractValue)}
                                        </span>
                                        <Badge variant="outline" className="text-xs">
                                          {client.eventCategory}
                                        </Badge>
                                      </div>
                                      {client.weddingDate && (
                                        <div className="text-xs text-gray-500">
                                          {new Date(client.weddingDate).toLocaleDateString('pt-BR')}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            {clientsInStage.length === 0 && (
                              <div className="text-center text-gray-400 text-sm py-8">
                                Arraste clientes aqui
                              </div>
                            )}
                          </div>
                        )}
                      </Droppable>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </DragDropContext>

      {/* Métricas de Conversão */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Métricas de Conversão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {((getClientsInStage("orcamento_enviado").length / Math.max(getClientsInStage("primeiro_contato").length, 1)) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Taxa de Orçamento</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {((getClientsInStage("negociacao").length / Math.max(getClientsInStage("orcamento_enviado").length, 1)) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Taxa de Negociação</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {((getClientsInStage("contrato_fechado").length / Math.max(getClientsInStage("negociacao").length, 1)) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Taxa de Fechamento</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {((getClientsInStage("projeto_finalizado").length / Math.max(getClientsInStage("contrato_fechado").length, 1)) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Taxa de Finalização</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
