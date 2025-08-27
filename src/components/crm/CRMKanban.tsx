import React from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Client, SalesFunnelStage, ClientStatus } from "@/utils/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Send, MessageCircle, FileCheck, Archive, XCircle, Phone, Mail, Calendar } from "lucide-react";
import { useClients } from "@/contexts/ClientsContext";
import { toast } from "sonner";

interface CRMKanbanProps {
  clients: Client[];
}

const funnelStages: Array<{
  key: SalesFunnelStage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  statusMapping: ClientStatus[];
}> = [
  {
    key: "primeiro_contato",
    label: "Primeiro Contato",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    statusMapping: ["primeiro_contato"]
  },
  {
    key: "orcamento_enviado",
    label: "Orçamento Enviado",
    icon: Send,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    statusMapping: ["orçamento enviado"]
  },
  {
    key: "negociacao",
    label: "Negociação",
    icon: MessageCircle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    statusMapping: ["negociacao"]
  },
  {
    key: "contrato_fechado",
    label: "Contrato Fechado",
    icon: FileCheck,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    statusMapping: ["fechado"]
  },
  {
    key: "projeto_finalizado",
    label: "Projeto Finalizado",
    icon: Archive,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    statusMapping: ["projeto_finalizado"]
  },
  {
    key: "contrato_perdido",
    label: "Perdidos",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    statusMapping: ["contrato_perdido"]
  }
];

export function CRMKanban({ clients }: CRMKanbanProps) {
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

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const mapFunnelStageToStatus = (stage: SalesFunnelStage): ClientStatus => {
    switch (stage) {
      case "primeiro_contato":
        return "primeiro_contato";
      case "orcamento_enviado":
        return "orçamento enviado";
      case "negociacao":
        return "negociacao";
      case "contrato_fechado":
        return "fechado";
      case "projeto_finalizado":
        return "projeto_finalizado";
      case "contrato_perdido":
        return "contrato_perdido";
      default:
        return "primeiro_contato";
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

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
    <div className="space-y-6">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="w-full overflow-x-auto pb-4">
          <div className="flex gap-6 min-w-max">
            {funnelStages.map((stage) => {
              const clientsInStage = getClientsInStage(stage.key);
              const totalValue = getTotalValue(clientsInStage);
              const Icon = stage.icon;
              
              return (
                <div key={stage.key} className="flex-none w-80">
                  <Card className={`h-full border-t-4 ${stage.borderColor}`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${stage.bgColor}`}>
                            <Icon className={`h-5 w-5 ${stage.color}`} />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-semibold text-gray-900">
                              {stage.label}
                            </CardTitle>
                            <div className="text-xs text-muted-foreground">
                              {clientsInStage.length} cliente{clientsInStage.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-bold">
                        {stage.key === "contrato_perdido" ? (
                          <span className="text-red-600">
                            {formatCurrency(totalValue)}
                          </span>
                        ) : (
                          <span className={stage.color}>
                            {formatCurrency(totalValue)}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <Droppable droppableId={stage.key}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`min-h-40 max-h-96 overflow-y-auto space-y-3 p-3 rounded-lg transition-all duration-200 ${
                              snapshot.isDraggingOver 
                                ? `${stage.bgColor} border-2 ${stage.borderColor} border-dashed` 
                                : 'bg-gray-50/50'
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
                                    className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 cursor-move ${
                                      snapshot.isDragging ? 'shadow-lg rotate-1 scale-105' : ''
                                    } ${stage.key === "contrato_perdido" ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}
                                  >
                                    <div className="p-4 space-y-3">
                                      {/* Client Header */}
                                      <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                          <Avatar className="h-8 w-8">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${client.name}`} />
                                            <AvatarFallback className="text-xs">
                                              {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div className="min-w-0 flex-1">
                                            <h4 className={`font-semibold text-sm truncate ${
                                              stage.key === "contrato_perdido" ? 'text-red-700' : 'text-gray-900'
                                            }`}>
                                              {client.name}
                                            </h4>
                                            {client.coupleName && (
                                              <p className="text-xs text-muted-foreground truncate">
                                                & {client.coupleName}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                        <Badge 
                                          variant={stage.key === "contrato_perdido" ? "destructive" : "secondary"} 
                                          className="text-xs shrink-0"
                                        >
                                          {client.eventCategory}
                                        </Badge>
                                      </div>

                                      {/* Contract Value */}
                                      <div className="flex items-center justify-between">
                                        <span className={`text-sm font-bold ${
                                          stage.key === "contrato_perdido" ? 'text-red-600' : 'text-green-600'
                                        }`}>
                                          {formatCurrency(client.contractValue)}
                                        </span>
                                        {client.weddingDate && (
                                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(client.weddingDate)}
                                          </div>
                                        )}
                                      </div>

                                      {/* Contact Info */}
                                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        {client.phone && (
                                          <div className="flex items-center gap-1">
                                            <Phone className="h-3 w-3" />
                                            <span className="truncate">{client.phone}</span>
                                          </div>
                                        )}
                                        {client.email && (
                                          <div className="flex items-center gap-1">
                                            <Mail className="h-3 w-3" />
                                            <span className="truncate">{client.email.split('@')[0]}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            {clientsInStage.length === 0 && (
                              <div className="text-center text-muted-foreground text-sm py-12 border-2 border-dashed border-gray-200 rounded-lg">
                                <Icon className={`h-8 w-8 mx-auto mb-2 ${stage.color} opacity-50`} />
                                <p>{stage.key === "contrato_perdido" ? "Nenhum contrato perdido" : "Arraste leads aqui"}</p>
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
    </div>
  );
}