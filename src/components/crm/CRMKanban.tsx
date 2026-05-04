// src/components/crm/CRMKanban.tsx

import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Client, SalesFunnelStage, ClientStatus } from "@/utils/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Users, Send, MessageCircle, FileCheck, Archive, XCircle,
  Phone, Mail, Calendar, AlertCircle,
} from "lucide-react";
import { useContractClosed } from "@/hooks/useContractClosed";
import { ContractClosedDialog } from "@/components/ContractClosedDialog";
import { useClients } from "@/contexts/ClientsContext";
import { toast } from "sonner";
import { WhatsAppMessageDialog } from "@/components/crm/WhatsAppMessageDialog";

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
    statusMapping: ["primeiro_contato"],
  },
  {
    key: "orcamento_enviado",
    label: "Orçamento Enviado",
    icon: Send,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    statusMapping: ["orçamento enviado"],
  },
  {
    key: "negociacao",
    label: "Follow-up",
    icon: MessageCircle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    statusMapping: ["negociacao"],
  },
  {
    key: "contrato_fechado",
    label: "Contrato Fechado",
    icon: FileCheck,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    statusMapping: ["fechado"],
  },
  {
    key: "projeto_finalizado",
    label: "Projeto Finalizado",
    icon: Archive,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    statusMapping: ["projeto_finalizado"],
  },
];

export function CRMKanban({ clients }: CRMKanbanProps) {
  const { updateClient } = useClients();
  const {
    openContractDialog,
    dialogOpen,
    pendingClient,
    handleConfirm,
    handleLater,
    handleCancel,
  } = useContractClosed();

  // Estado do dialog de mensagem
  const [messageDialogClient, setMessageDialogClient] = useState<Client | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const getClientsInStage = (stage: SalesFunnelStage) =>
    clients.filter((c) => c.salesFunnelStage === stage);

  const getTotalValue = (clientsInStage: Client[]) =>
    clientsInStage.reduce((t, c) => t + (c.contractValue || 0), 0);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });

  const mapFunnelStageToStatus = (stage: SalesFunnelStage): ClientStatus => {
    switch (stage) {
      case "primeiro_contato": return "primeiro_contato";
      case "orcamento_enviado": return "orçamento enviado";
      case "negociacao": return "negociacao";
      case "contrato_fechado": return "fechado";
      case "projeto_finalizado": return "projeto_finalizado";
      case "contrato_perdido": return "contrato_perdido";
      default: return "primeiro_contato";
    }
  };

  const hasPendingRegistration = (client: Client) =>
    client.notes?.includes("⚠️ CADASTRO PENDENTE") ?? false;

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const clientId = draggableId;
    const newStage = destination.droppableId as SalesFunnelStage;
    const newStatus = mapFunnelStageToStatus(newStage);

    if (newStage === "contrato_fechado") {
      const dialogOpened = openContractDialog(clientId);
      if (dialogOpened) return;
    }

    try {
      const success = await updateClient(clientId, {
        salesFunnelStage: newStage,
        status: newStatus,
      });
      if (success) {
        toast.success(
          `Cliente movido para ${funnelStages.find((s) => s.key === newStage)?.label}`
        );
      } else {
        toast.error("Erro ao mover cliente");
      }
    } catch (error) {
      console.error("Error updating client stage:", error);
      toast.error("Erro ao mover cliente");
    }
  };

  return (
    <>
      <div className="space-y-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="w-full">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              {funnelStages.map((stage) => {
                const clientsInStage = getClientsInStage(stage.key);
                const totalValue = getTotalValue(clientsInStage);
                const Icon = stage.icon;

                return (
                  <div key={stage.key} className="min-w-0">
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
                                {clientsInStage.length} cliente
                                {clientsInStage.length !== 1 ? "s" : ""}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-lg font-bold">
                          <span className={stage.color}>{formatCurrency(totalValue)}</span>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <Droppable droppableId={stage.key}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`min-h-40 overflow-y-auto space-y-3 p-3 rounded-lg transition-all duration-200 ${
                                snapshot.isDraggingOver
                                  ? `${stage.bgColor} border-2 ${stage.borderColor} border-dashed`
                                  : "bg-gray-50/50"
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
                                        snapshot.isDragging
                                          ? "shadow-lg rotate-1 scale-105"
                                          : ""
                                      } ${
                                        stage.key === "contrato_perdido"
                                          ? "border-red-200 bg-red-50"
                                          : "border-gray-200"
                                      }`}
                                    >
                                      <div className="p-4 space-y-3">
                                        {/* Badge cadastro pendente */}
                                        {hasPendingRegistration(client) && (
                                          <div className="flex items-center gap-1 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-1">
                                            <AlertCircle className="h-3 w-3 shrink-0" />
                                            Cadastro pendente
                                          </div>
                                        )}

                                        {/* Nome + categoria */}
                                        <div className="flex items-start justify-between">
                                          <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                              <AvatarImage
                                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${client.name}`}
                                              />
                                              <AvatarFallback className="text-xs">
                                                {client.name
                                                  .split(" ")
                                                  .map((n) => n[0])
                                                  .join("")
                                                  .slice(0, 2)}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                              <h4
                                                className={`font-semibold text-sm truncate ${
                                                  stage.key === "contrato_perdido"
                                                    ? "text-red-700"
                                                    : "text-gray-900"
                                                }`}
                                              >
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
                                            variant={
                                              stage.key === "contrato_perdido"
                                                ? "destructive"
                                                : "secondary"
                                            }
                                            className="text-xs shrink-0"
                                          >
                                            {client.eventCategory}
                                          </Badge>
                                        </div>

                                        {/* Valor + data */}
                                        <div className="flex items-center justify-between">
                                          <span
                                            className={`text-sm font-bold ${
                                              stage.key === "contrato_perdido"
                                                ? "text-red-600"
                                                : "text-green-600"
                                            }`}
                                          >
                                            {formatCurrency(client.contractValue)}
                                          </span>
                                          {client.weddingDate && (
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                              <Calendar className="h-3 w-3" />
                                              {formatDate(client.weddingDate)}
                                            </div>
                                          )}
                                        </div>

                                        {/* Telefone + email */}
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
                                              <span className="truncate">
                                                {client.email.split("@")[0]}
                                              </span>
                                            </div>
                                          )}
                                        </div>

                                        {/* ── Botão WhatsApp com mensagem ─── */}
                                        {client.phone && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setMessageDialogClient(client);
                                            }}
                                          >
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              width="14"
                                              height="14"
                                              viewBox="0 0 24 24"
                                              fill="currentColor"
                                              className="mr-1.5 shrink-0"
                                            >
                                              <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                                              <path d="M9 10a1 1 0 0 0 1 1c1 0 2.5-2.5 2.5-2.5s1.5 2.5 2.5 2.5 1-1 1-1v3c0 1-1 2-3 2s-3-1-3-2v-3" />
                                            </svg>
                                            Enviar mensagem
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                              {clientsInStage.length === 0 && (
                                <div className="text-center text-muted-foreground text-sm py-12 border-2 border-dashed border-gray-200 rounded-lg">
                                  <Icon
                                    className={`h-8 w-8 mx-auto mb-2 ${stage.color} opacity-50`}
                                  />
                                  <p>
                                    {stage.key === "contrato_perdido"
                                      ? "Nenhum contrato perdido"
                                      : "Arraste leads aqui"}
                                  </p>
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

        {/* ── Seção Arquivados (Contrato Perdido) ── */}
        {(() => {
          const archivedClients = clients.filter(c => c.salesFunnelStage === "contrato_perdido" || c.status === "contrato_perdido");
          const archivedTotal = getTotalValue(archivedClients);
          return (
            <div className="mt-6 border border-red-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowArchived(v => !v)}
                className="w-full flex items-center justify-between px-5 py-3 bg-red-50 hover:bg-red-100 transition-colors text-red-700"
              >
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  <span className="font-semibold text-sm">Arquivados — Contratos Perdidos</span>
                  <span className="ml-2 bg-red-200 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {archivedClients.length}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-red-600">{formatCurrency(archivedTotal)}</span>
                  {showArchived ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>

              {showArchived && (
                <div className="p-4 bg-white">
                  {archivedClients.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-6">Nenhum contrato perdido</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {archivedClients.map(client => (
                        <div key={client.id} className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2 opacity-80">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${client.name}`} />
                                <AvatarFallback className="text-xs">{client.name.split(" ").map(n => n[0]).join("").slice(0,2)}</AvatarFallback>
                              </Avatar>
                              <span className="font-semibold text-sm text-red-700 truncate">{client.name}</span>
                            </div>
                            <Badge variant="destructive" className="text-xs shrink-0">{client.eventCategory}</Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="font-bold text-red-600">{formatCurrency(client.contractValue)}</span>
                            {client.weddingDate && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(client.weddingDate)}
                              </div>
                            )}
                          </div>
                          {client.phone && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                              onClick={() => setMessageDialogClient(client)}
                            >
                              Enviar mensagem
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Dialog de cadastro ao fechar contrato */}
      {pendingClient && (
        <ContractClosedDialog
          open={dialogOpen}
          client={pendingClient}
          onConfirm={handleConfirm}
          onLater={handleLater}
          onCancel={handleCancel}
        />
      )}

      {/* Dialog de mensagem WhatsApp */}
      {messageDialogClient && (
        <WhatsAppMessageDialog
          open={!!messageDialogClient}
          onOpenChange={(open) => { if (!open) setMessageDialogClient(null); }}
          client={messageDialogClient}
        />
      )}
    </>
  );
}
