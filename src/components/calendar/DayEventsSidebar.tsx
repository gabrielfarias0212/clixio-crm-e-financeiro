import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Edit, ExternalLink, PlusCircle, Trash2, Camera } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Client, CalendarEvent } from "@/utils/types";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { useNavigate } from "react-router-dom";
import { normalizeDate, stringToDate } from "@/utils/dates";

const C = {
  text:      "#1a1a1a",
  textSub:   "#9A9590",
  divider:   "#F0EDE8",
  itemBg:    "#FAFAF8",
  navy:      "#1E3A5F",
  navyBg:    "#E8EEF6",
  border:    "#E8E4DE",
  success:   "#52C97A",
  successBg: "#E6F9EE",
  amber:     "#E8A838",
  amberBg:   "#FEF3DC",
  danger:    "#E05252",
  dangerBg:  "#FEE8E8",
};

const EVENT_COLORS: Record<string, string> = {
  blue:   "#3B82F6",
  green:  "#52C97A",
  red:    "#E05252",
  yellow: "#E8A838",
  purple: "#8B5CF6",
};

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(v);

function isConfirmed(client: Client): boolean {
  return client.salesFunnelStage === "contrato_fechado" || client.salesFunnelStage === "projeto_finalizado";
}

interface DayEventsSidebarProps {
  date: Date | undefined;
  selectedDayItems: { clients: Client[]; events: CalendarEvent[] };
  setAddEventOpen: (open: boolean) => void;
  openEditEvent?: (event: CalendarEvent) => void;
  allClients: Client[];
}

export function DayEventsSidebar({
  date,
  selectedDayItems,
  setAddEventOpen,
  openEditEvent,
  allClients,
}: DayEventsSidebarProps) {
  const { deleteEvent } = useCalendarEvents();
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const formattedDate = date
    ? format(date, "EEEE, d 'de' MMMM", { locale: ptBR })
    : "";

  const preWeddingClients = allClients.filter(c => {
    if (!c.hasPreWedding || !c.preWeddingDate || !date) return false;
    return normalizeDate(stringToDate(c.preWeddingDate) || new Date()) === normalizeDate(date);
  });

  const totalClients = [
    ...selectedDayItems.clients,
    ...preWeddingClients.filter(pw => !selectedDayItems.clients.find(c => c.id === pw.id)),
  ];

  const isEmpty = totalClients.length === 0 && selectedDayItems.events.length === 0;

  const handleAddEvent = () => {
    if (!isEmpty) {
      toast({
        title: "⚠️ Data já possui evento(s)",
        description: "Esta data já tem clientes ou eventos. Você pode adicionar mesmo assim se necessário.",
      });
    }
    setAddEventOpen(true);
  };

  return (
    <div style={{
      background: "#FFFFFF",
      borderRadius: 14,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 6px 20px rgba(0,0,0,0.07)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 16px", borderBottom: `1px solid ${C.divider}`,
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.text, textTransform: "capitalize" as const }}>
          {formattedDate || "Selecione um dia"}
        </span>
        <button
          onClick={handleAddEvent}
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "6px 10px", borderRadius: 8,
            border: `1px solid ${C.border}`, background: C.itemBg,
            fontSize: 11, fontWeight: 600, color: C.text, cursor: "pointer",
          }}
        >
          <PlusCircle style={{ width: 12, height: 12 }} />
          Adicionar
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "14px 16px", maxHeight: 520, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
        {isEmpty ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: C.textSub }}>
            <CalendarIcon style={{ width: 36, height: 36, margin: "0 auto 10px", opacity: 0.25 }} />
            <div style={{ fontSize: 13 }}>Nenhum evento para esta data</div>
            <button
              onClick={handleAddEvent}
              style={{ marginTop: 8, background: "none", border: "none", fontSize: 12, color: C.navy, cursor: "pointer", fontWeight: 600 }}
            >
              Adicionar evento
            </button>
          </div>
        ) : (
          <>
            {/* Client events */}
            {totalClients.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: C.textSub }}>
                  Eventos de Clientes
                </div>
                {totalClients.map(client => {
                  const isPreWedding = !selectedDayItems.clients.find(c => c.id === client.id);
                  const confirmed = isConfirmed(client);
                  const bg    = isPreWedding ? C.amberBg : confirmed ? C.successBg : C.itemBg;
                  const bord  = isPreWedding ? "#F8DCAA"  : confirmed ? "#B8EDD0" : C.border;
                  return (
                    <div key={client.id} style={{
                      padding: "10px 12px", borderRadius: 10,
                      background: bg, border: `1px solid ${bord}`,
                      borderStyle: !isPreWedding && !confirmed ? "dashed" : "solid",
                    }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" as const }}>
                            <Camera style={{ width: 11, height: 11, color: C.textSub, flexShrink: 0 }} />
                            <span style={{ fontSize: 12, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                              {client.name}
                            </span>
                            {isPreWedding && (
                              <span style={{ fontSize: 9, fontWeight: 700, background: C.amberBg, color: "#A07010", borderRadius: 999, padding: "1px 6px" }}>
                                Pré-Wedding
                              </span>
                            )}
                            {!isPreWedding && !confirmed && (
                              <span style={{ fontSize: 9, fontWeight: 700, background: C.itemBg, color: C.textSub, borderRadius: 999, padding: "1px 6px" }}>
                                Pré-agendamento
                              </span>
                            )}
                            {!isPreWedding && confirmed && (
                              <span style={{ fontSize: 9, fontWeight: 700, background: C.successBg, color: "#2A8050", borderRadius: 999, padding: "1px 6px" }}>
                                Confirmado
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 11, color: C.textSub, marginTop: 2 }}>
                            {isPreWedding ? "Pré-Wedding" : client.eventCategory}
                            {(isPreWedding ? client.preWeddingStartTime : client.weddingStartTime) && (
                              <> · {isPreWedding ? client.preWeddingStartTime : client.weddingStartTime}</>
                            )}
                          </div>
                          {client.eventLocation && (
                            <div style={{ fontSize: 11, color: C.textSub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                              {client.eventLocation}
                            </div>
                          )}
                          {client.contractValue > 0 && (
                            <div style={{ fontSize: 11, fontWeight: 700, color: C.success, marginTop: 3 }}>
                              {fmt(client.contractValue)}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => navigate(`/clients/${client.id}`)}
                          style={{
                            width: 28, height: 28, borderRadius: 6,
                            border: `1px solid ${C.border}`, background: "#FFFFFF",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", flexShrink: 0,
                          }}
                        >
                          <ExternalLink style={{ width: 11, height: 11, color: C.textSub }} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Manual events */}
            {selectedDayItems.events.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: C.textSub }}>
                  Eventos Manuais
                </div>
                {selectedDayItems.events.map(event => (
                  <div key={event.id} style={{
                    padding: "10px 12px", borderRadius: 10,
                    background: C.itemBg, border: `1px solid ${C.border}`,
                  }}>
                    {deletingId === event.id ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ fontSize: 12, color: C.danger, fontWeight: 600 }}>
                          Excluir <strong>{event.title}</strong>?
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => { deleteEvent(event.id); setDeletingId(null); }}
                            style={{
                              padding: "5px 10px", borderRadius: 6,
                              background: C.dangerBg, border: `1px solid #FECDCD`,
                              fontSize: 11, fontWeight: 700, color: C.danger, cursor: "pointer",
                            }}
                          >
                            Sim, excluir
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            style={{
                              padding: "5px 10px", borderRadius: 6,
                              background: C.itemBg, border: `1px solid ${C.border}`,
                              fontSize: 11, fontWeight: 600, color: C.textSub, cursor: "pointer",
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{
                              width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                              background: EVENT_COLORS[event.color] ?? C.textSub,
                            }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                              {event.title}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: C.textSub, marginTop: 2 }}>
                            {event.startTime} – {event.endTime}
                          </div>
                          {event.description && (
                            <div style={{ fontSize: 11, color: C.textSub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                              {event.description}
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                          <button
                            onClick={() => openEditEvent?.(event)}
                            style={{
                              width: 28, height: 28, borderRadius: 6,
                              border: `1px solid ${C.border}`, background: C.itemBg,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            <Edit style={{ width: 11, height: 11, color: C.textSub }} />
                          </button>
                          <button
                            onClick={() => setDeletingId(event.id)}
                            style={{
                              width: 28, height: 28, borderRadius: 6,
                              border: `1px solid #FECDCD`, background: C.dangerBg,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            <Trash2 style={{ width: 11, height: 11, color: C.danger }} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
