// src/components/crm/CRMKanban.tsx

import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Client, SalesFunnelStage, ClientStatus } from "@/utils/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, ChevronUp, Bell } from "lucide-react";
import {
  Users, Send, MessageCircle, FileCheck, Archive, XCircle,
  Phone, Mail, Calendar, AlertCircle,
} from "lucide-react";
import { useContractClosed } from "@/hooks/useContractClosed";
import { scheduleAutoFollowup } from "@/utils/supabase/crm-activities";
import { ContractClosedDialog } from "@/components/ContractClosedDialog";
import { useClients } from "@/contexts/ClientsContext";
import { toast } from "sonner";
import { WhatsAppMessageDialog } from "@/components/crm/WhatsAppMessageDialog";
import { CRMClientDialog } from "@/components/crm/CRMClientDialog";
import { CRMActivityPanel } from "@/components/crm/CRMActivityPanel";

// ── Design tokens ─────────────────────────────────────────────────────────────

const C = {
  text:       "#1a1a1a",
  textSub:    "#9A9590",
  divider:    "#F0EDE8",
  itemBg:     "#FAFAF8",
  navy:       "#1E3A5F",
  navyBg:     "#E8EEF6",
  amber:      "#E8A838",
  amberBg:    "#FEF3DC",
  success:    "#52C97A",
  successBg:  "#E6F9EE",
  danger:     "#E05252",
  dangerBg:   "#FEE8E8",
  gray:       "#9A9590",
  grayBg:     "#F0EDE8",
};

const CARD_SHADOW = "0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.06)";

// ── Stage definitions ─────────────────────────────────────────────────────────

interface StageConfig {
  key: SalesFunnelStage;
  label: string;
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  accent: string;
  accentBg: string;
  statusMapping: ClientStatus[];
}

const funnelStages: StageConfig[] = [
  {
    key: "primeiro_contato",
    label: "Primeiro Contato",
    icon: Users,
    accent: C.navy,
    accentBg: C.navyBg,
    statusMapping: ["primeiro_contato"],
  },
  {
    key: "orcamento_enviado",
    label: "Orçamento Enviado",
    icon: Send,
    accent: C.amber,
    accentBg: C.amberBg,
    statusMapping: ["orçamento enviado"],
  },
  {
    key: "negociacao",
    label: "Follow-up",
    icon: MessageCircle,
    accent: C.amber,
    accentBg: C.amberBg,
    statusMapping: ["negociacao"],
  },
  {
    key: "contrato_fechado",
    label: "Contrato Fechado",
    icon: FileCheck,
    accent: C.success,
    accentBg: C.successBg,
    statusMapping: ["fechado"],
  },
  {
    key: "projeto_finalizado",
    label: "Projeto Finalizado",
    icon: Archive,
    accent: C.gray,
    accentBg: C.grayBg,
    statusMapping: ["projeto_finalizado"],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

interface CRMKanbanProps {
  clients: Client[];
}

export function CRMKanban({ clients }: CRMKanbanProps) {
  const { updateClient } = useClients();
  const { openContractDialog, dialogOpen, pendingClient, handleConfirm, handleLater, handleCancel } = useContractClosed();

  const [messageDialogClient, setMessageDialogClient] = useState<Client | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientDialogOpen, setClientDialogOpen] = useState(false);

  const toggleCardExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCards(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const getClientsInStage = (stage: SalesFunnelStage) =>
    clients.filter((c) => c.salesFunnelStage === stage);

  const getTotalValue = (list: Client[]) =>
    list.reduce((t, c) => t + (c.contractValue || 0), 0);

  const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

  const formatDate = (date: string | Date): string => {
    const str = typeof date === "string" ? date : date.toISOString().slice(0, 10);
    if (str.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [y, m, d] = str.split("-");
      return `${d}/${m}/${y.slice(2)}`;
    }
    if (str.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [d, m, y] = str.split("/");
      return `${d}/${m}/${y.slice(2)}`;
    }
    return str;
  };

  const daysSinceContact = (dateStr?: string | null): number => {
    if (!dateStr) return 0;
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  };

  const contactBadgeColors = (days: number) => {
    if (days <= 3)  return { color: C.success, bg: C.successBg };
    if (days <= 7)  return { color: C.amber,   bg: C.amberBg };
    if (days <= 14) return { color: "#D07820", bg: "#FEF3DC" };
    return                 { color: C.danger,  bg: C.dangerBg };
  };

  const mapFunnelStageToStatus = (stage: SalesFunnelStage): ClientStatus => {
    switch (stage) {
      case "primeiro_contato":   return "primeiro_contato";
      case "orcamento_enviado":  return "orçamento enviado";
      case "negociacao":         return "negociacao";
      case "contrato_fechado":   return "fechado";
      case "projeto_finalizado": return "projeto_finalizado";
      case "contrato_perdido":   return "contrato_perdido";
      default: return "primeiro_contato";
    }
  };

  const hasPendingRegistration = (client: Client) =>
    client.notes?.includes("⚠️ CADASTRO PENDENTE") ?? false;

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStage = destination.droppableId as SalesFunnelStage;
    const newStatus = mapFunnelStageToStatus(newStage);

    if (newStage === "contrato_fechado") {
      const dialogOpened = openContractDialog(draggableId);
      if (dialogOpened) return;
    }

    try {
      const success = await updateClient(draggableId, { salesFunnelStage: newStage, status: newStatus });
      if (success) {
        toast.success(`Cliente movido para ${funnelStages.find((s) => s.key === newStage)?.label}`);
        if (newStage === "primeiro_contato" || newStage === "orcamento_enviado") {
          const desc = newStage === "orcamento_enviado" ? "Follow-up do orçamento enviado" : "Primeiro follow-up do lead";
          scheduleAutoFollowup(draggableId, desc).catch(() => {});
        }
      } else {
        toast.error("Erro ao mover cliente");
      }
    } catch {
      toast.error("Erro ao mover cliente");
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const archivedClients = clients.filter(c => c.salesFunnelStage === "contrato_perdido" || c.status === "contrato_perdido");

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Kanban columns ── */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div style={{ width: "100%", overflowX: "auto", paddingBottom: 8 }}>
            <div style={{ display: "flex", gap: 12, minWidth: `${funnelStages.length * 270}px` }}>

              {funnelStages.map((stage) => {
                const clientsInStage = getClientsInStage(stage.key);
                const totalValue = getTotalValue(clientsInStage);
                const Icon = stage.icon;

                return (
                  <div
                    key={stage.key}
                    style={{ flex: 1, minWidth: 250, maxWidth: 300, display: "flex", flexDirection: "column" }}
                  >
                    {/* Column card */}
                    <div style={{
                      background: "#FFFFFF",
                      borderRadius: 14,
                      boxShadow: CARD_SHADOW,
                      borderTop: `3px solid ${stage.accent}`,
                      display: "flex",
                      flexDirection: "column",
                      height: "calc(100vh - 280px)",
                      minHeight: 400,
                      overflow: "hidden",
                    }}>
                      {/* Column header */}
                      <div style={{ padding: "14px 14px 10px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: 8,
                            background: stage.accentBg,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                          }}>
                            <Icon style={{ width: 13, height: 13, color: stage.accent }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: C.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {stage.label}
                          </span>
                          <span style={{
                            fontSize: 10, fontWeight: 700,
                            background: stage.accentBg, color: stage.accent,
                            borderRadius: 999, padding: "2px 7px",
                          }}>
                            {clientsInStage.length}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: stage.accent, marginTop: 6 }}>
                          {fmt(totalValue)}
                        </div>
                      </div>

                      {/* Droppable area */}
                      <Droppable droppableId={stage.key}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            style={{
                              flex: 1,
                              overflowY: "auto",
                              padding: "6px 10px 10px",
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                              minHeight: 120,
                              background: snapshot.isDraggingOver ? stage.accentBg : "transparent",
                              borderRadius: snapshot.isDraggingOver ? "0 0 14px 14px" : undefined,
                              transition: "background 0.15s",
                            }}
                          >
                            {clientsInStage.map((client, index) => (
                              <Draggable key={client.id} draggableId={client.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      ...provided.draggableProps.style,
                                      background: "#FFFFFF",
                                      borderRadius: 10,
                                      border: `1px solid ${C.divider}`,
                                      boxShadow: snapshot.isDragging
                                        ? "0 8px 24px rgba(0,0,0,0.12)"
                                        : "0 1px 3px rgba(0,0,0,0.04)",
                                      transform: snapshot.isDragging
                                        ? `${provided.draggableProps.style?.transform} rotate(1deg)`
                                        : provided.draggableProps.style?.transform,
                                      cursor: "grab",
                                      transition: snapshot.isDragging ? undefined : "box-shadow 0.15s",
                                    }}
                                    onClick={() => {
                                      if (!snapshot.isDragging) {
                                        setSelectedClient(client);
                                        setClientDialogOpen(true);
                                      }
                                    }}
                                  >
                                    <div style={{ padding: "10px 12px" }}>

                                      {/* Pending registration alert */}
                                      {hasPendingRegistration(client) && (
                                        <div style={{
                                          display: "flex", alignItems: "center", gap: 5,
                                          fontSize: 11, color: "#A07010",
                                          background: C.amberBg, border: `1px solid #F8DCAA`,
                                          borderRadius: 6, padding: "4px 8px", marginBottom: 8,
                                        }}>
                                          <AlertCircle style={{ width: 11, height: 11, flexShrink: 0 }} />
                                          Cadastro pendente
                                        </div>
                                      )}

                                      {/* Avatar + name */}
                                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                        <Avatar style={{ width: 34, height: 34, flexShrink: 0 }}>
                                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${client.name}`} />
                                          <AvatarFallback style={{ fontSize: 11, fontWeight: 700 }}>
                                            {client.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div style={{ minWidth: 0 }}>
                                          <div style={{
                                            fontSize: 13, fontWeight: 600, color: C.text,
                                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                          }}>
                                            {client.name}
                                          </div>
                                          {client.coupleName && (
                                            <div style={{
                                              fontSize: 11, color: C.textSub,
                                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                            }}>
                                              & {client.coupleName}
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Days since contact badge */}
                                      {["primeiro_contato", "orcamento_enviado", "negociacao"].includes(stage.key) && (() => {
                                        const days = daysSinceContact(client.createdAt);
                                        const bc = contactBadgeColors(days);
                                        return (
                                          <div style={{
                                            display: "flex", alignItems: "center", justifyContent: "space-between",
                                            background: bc.bg, borderRadius: 6,
                                            padding: "4px 8px", marginBottom: 8,
                                          }}>
                                            <span style={{ fontSize: 11, fontWeight: 600, color: bc.color }}>
                                              {days === 0 ? "Hoje" : days === 1 ? "1 dia atrás" : `${days} dias atrás`}
                                            </span>
                                            <span style={{ fontSize: 10, color: bc.color, opacity: 0.75 }}>
                                              {new Date(client.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                                            </span>
                                          </div>
                                        );
                                      })()}

                                      {/* Contact info */}
                                      <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 8 }}>
                                        {client.email && (
                                          <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>
                                            <Mail style={{ width: 11, height: 11, color: C.textSub, flexShrink: 0 }} />
                                            <span style={{ fontSize: 11, color: C.textSub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                              {client.email}
                                            </span>
                                          </div>
                                        )}
                                        {client.phone && (
                                          <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>
                                            <Phone style={{ width: 11, height: 11, color: C.textSub, flexShrink: 0 }} />
                                            <span style={{ fontSize: 11, color: C.textSub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                              {client.phone}
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Footer: value + date + category */}
                                      <div style={{
                                        display: "flex", alignItems: "center", justifyContent: "space-between",
                                        paddingTop: 8, borderTop: `1px solid ${C.divider}`, gap: 6,
                                      }}>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: stage.accent, flexShrink: 0 }}>
                                          {fmt(client.contractValue)}
                                        </span>
                                        <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" as const, justifyContent: "flex-end" }}>
                                          {client.weddingDate && (
                                            <span style={{
                                              display: "inline-flex", alignItems: "center", gap: 3,
                                              fontSize: 10, color: C.textSub,
                                              background: C.itemBg, borderRadius: 4,
                                              padding: "2px 6px",
                                            }}>
                                              <Calendar style={{ width: 9, height: 9 }} />
                                              {formatDate(client.weddingDate)}
                                            </span>
                                          )}
                                          <span style={{
                                            fontSize: 10, fontWeight: 600,
                                            background: C.itemBg, color: C.textSub,
                                            borderRadius: 4, padding: "2px 6px",
                                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const,
                                            maxWidth: 80,
                                          }}>
                                            {client.eventCategory}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Expand button */}
                                      <button
                                        onClick={e => toggleCardExpand(client.id, e)}
                                        style={{
                                          width: "100%", display: "flex", alignItems: "center",
                                          justifyContent: "center", gap: 4,
                                          marginTop: 8, padding: "5px 0", borderRadius: 6,
                                          border: `1px solid transparent`, background: "none",
                                          fontSize: 11, color: C.textSub, cursor: "pointer",
                                        }}
                                        onMouseEnter={e => {
                                          (e.currentTarget as HTMLButtonElement).style.background = C.itemBg;
                                          (e.currentTarget as HTMLButtonElement).style.borderColor = C.divider;
                                          (e.currentTarget as HTMLButtonElement).style.color = C.text;
                                        }}
                                        onMouseLeave={e => {
                                          (e.currentTarget as HTMLButtonElement).style.background = "none";
                                          (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
                                          (e.currentTarget as HTMLButtonElement).style.color = C.textSub;
                                        }}
                                      >
                                        <Bell style={{ width: 10, height: 10 }} />
                                        {expandedCards.has(client.id) ? "Fechar" : "Histórico & Follow-up"}
                                        {expandedCards.has(client.id)
                                          ? <ChevronUp style={{ width: 10, height: 10 }} />
                                          : <ChevronDown style={{ width: 10, height: 10 }} />}
                                      </button>
                                    </div>

                                    {/* Activity panel */}
                                    {expandedCards.has(client.id) && (
                                      <CRMActivityPanel clientId={client.id} clientName={client.name} />
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            ))}

                            {provided.placeholder}

                            {/* Empty state */}
                            {clientsInStage.length === 0 && (
                              <div style={{
                                display: "flex", flexDirection: "column", alignItems: "center",
                                justifyContent: "center", padding: "32px 16px",
                                border: `2px dashed ${C.divider}`, borderRadius: 10,
                                color: C.textSub, gap: 8,
                              }}>
                                <Icon style={{ width: 24, height: 24, opacity: 0.4 }} />
                                <span style={{ fontSize: 12 }}>Arraste leads aqui</span>
                              </div>
                            )}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </DragDropContext>

        {/* ── Archived section ── */}
        <div style={{
          border: `1px solid #FECDCD`,
          borderRadius: 14,
          overflow: "hidden",
        }}>
          <button
            onClick={() => setShowArchived(v => !v)}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 18px", background: C.dangerBg,
              border: "none", cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <XCircle style={{ width: 15, height: 15, color: C.danger }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: C.danger }}>Arquivados — Contratos Perdidos</span>
              <span style={{
                fontSize: 10, fontWeight: 700,
                background: "#FECDCD", color: "#B02222",
                borderRadius: 999, padding: "1px 7px",
              }}>
                {archivedClients.length}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.danger }}>
                {fmt(getTotalValue(archivedClients))}
              </span>
              {showArchived
                ? <ChevronUp style={{ width: 15, height: 15, color: C.danger }} />
                : <ChevronDown style={{ width: 15, height: 15, color: C.danger }} />}
            </div>
          </button>

          {showArchived && (
            <div style={{ padding: 16, background: "#FFFFFF" }}>
              {archivedClients.length === 0 ? (
                <div style={{ textAlign: "center", fontSize: 13, color: C.textSub, padding: "20px 0" }}>
                  Nenhum contrato perdido
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
                  {archivedClients.map(client => (
                    <div key={client.id} style={{
                      background: C.dangerBg, border: `1px solid #FECDCD`,
                      borderRadius: 10, padding: 14, opacity: 0.85,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                          <Avatar style={{ width: 28, height: 28, flexShrink: 0 }}>
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${client.name}`} />
                            <AvatarFallback style={{ fontSize: 10 }}>
                              {client.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span style={{
                            fontSize: 12, fontWeight: 600, color: C.danger,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {client.name}
                          </span>
                        </div>
                        <span style={{
                          fontSize: 10, fontWeight: 600,
                          background: "#FECDCD", color: "#B02222",
                          borderRadius: 4, padding: "2px 6px", flexShrink: 0,
                        }}>
                          {client.eventCategory}
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.danger }}>
                          {fmt(client.contractValue)}
                        </span>
                        {client.weddingDate && (
                          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: C.textSub }}>
                            <Calendar style={{ width: 10, height: 10 }} />
                            {formatDate(client.weddingDate)}
                          </div>
                        )}
                      </div>

                      {client.phone && (
                        <button
                          onClick={() => setMessageDialogClient(client)}
                          style={{
                            width: "100%", padding: "6px 0", borderRadius: 6,
                            border: `1px solid ${C.successBg}`, background: C.successBg,
                            fontSize: 11, fontWeight: 600, color: "#2A8050", cursor: "pointer",
                          }}
                        >
                          Enviar mensagem
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      {pendingClient && (
        <ContractClosedDialog
          open={dialogOpen}
          client={pendingClient}
          onConfirm={handleConfirm}
          onLater={handleLater}
          onCancel={handleCancel}
        />
      )}

      <CRMClientDialog
        client={selectedClient}
        open={clientDialogOpen}
        onOpenChange={(open) => { setClientDialogOpen(open); if (!open) setSelectedClient(null); }}
      />

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
