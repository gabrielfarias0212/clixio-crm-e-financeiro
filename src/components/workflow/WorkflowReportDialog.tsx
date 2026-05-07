import { useState, useRef } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Printer, FileText, ListChecks, User } from "lucide-react";
import { Client } from "@/utils/types";

// ── helpers ──────────────────────────────────────────────────────────────────

function parseBR(d?: string | null): Date | null {
  if (!d) return null;
  const [day, m, y] = d.split("/").map(Number);
  return new Date(y, m - 1, day);
}
function fmtDate(d?: string | null) {
  if (!d) return "—";
  const p = parseBR(d);
  return p ? p.toLocaleDateString("pt-BR") : d;
}

const STEPS = [
  { field: "weddingPhotographed",  label: "Fotografado"    },
  { field: "backupCompleted",      label: "Cópia/Backup"   },
  { field: "curationCompleted",    label: "Curadoria"      },
  { field: "inEditing",            label: "Edição Final"   },
  { field: "linkSent",             label: "Link Enviado"   },
  { field: "boxDelivered",         label: "Entrega Física" },
] as const;

const ALBUM_STEPS = [
  { field: "albumLinkSent",        label: "Link p/ Escolha"  },
  { field: "albumClientChose",     label: "Cliente Escolheu" },
  { field: "albumDiagrammed",      label: "Diagramado"       },
  { field: "albumClientApproved",  label: "Aprovado"         },
  { field: "albumOrdered",         label: "Pedido Feito"     },
] as const;

const STAGE_LABELS: Record<string, string> = {
  aguardando_evento:    "Aguardando Evento",
  wedding_photographed: "Fotografado",
  backup_completed:     "Cópia/Backup",
  curation_completed:   "Curadoria",
  in_editing:           "Edição Final",
  link_sent:            "Link Enviado",
  box_delivered:        "Entrega Física",
  finalizado:           "Finalizado",
};

function getStageKey(client: Client): string {
  if (client.status === "projeto_finalizado") return "finalizado";
  const event = parseBR(client.weddingDate);
  const isFuture = event ? event.getTime() > Date.now() : false;
  if (isFuture && !client.weddingPhotographed) return "aguardando_evento";
  if (client.boxDelivered)       return "box_delivered";
  if (client.linkSent)           return "link_sent";
  if (client.inEditing)          return "in_editing";
  if (client.curationCompleted)  return "curation_completed";
  if (client.backupCompleted)    return "backup_completed";
  if (client.weddingPhotographed) return "wedding_photographed";
  return "aguardando_evento";
}

const PRINT_CSS = `
  @media print {
    /* Hide everything except the print area */
    body > *:not(.print-wrapper) { display: none !important; }
    .print-wrapper { display: block !important; }

    /* Dialog and overlay: hide */
    [role="dialog"], [data-radix-portal], [class*="DialogOverlay"],
    [class*="DialogContent"], .fixed, .absolute { display: none !important; }

    /* Print wrapper sits in normal flow for proper pagination */
    .print-wrapper {
      position: static !important;
      width: 100% !important;
      padding: 0 !important;
      margin: 0 !important;
      background: white !important;
      overflow: visible !important;
      color: #111 !important;
    }

    .print-wrapper * {
      visibility: visible !important;
      color: inherit !important;
    }

    /* Page break control */
    .print-wrapper [style*="breakInside"], .print-wrapper [style*="pageBreakInside"] {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    .print-wrapper table tr { break-inside: avoid; page-break-inside: avoid; }

    @page { margin: 1.5cm; size: A4; }
  }
`;

// ── Sub-components ────────────────────────────────────────────────────────────

function PrintHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const now = new Date().toLocaleString("pt-BR");
  return (
    <div style={{ borderBottom: "2px solid #000", paddingBottom: 8, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h1>
          {subtitle && <p style={{ margin: "2px 0 0", fontSize: 12, color: "#555" }}>{subtitle}</p>}
        </div>
        <p style={{ fontSize: 11, color: "#555", margin: 0 }}>Gerado em {now}</p>
      </div>
    </div>
  );
}

function CheckBox({ done }: { done: boolean }) {
  return (
    <span style={{
      display: "inline-block", width: 14, height: 14, border: "1.5px solid #333",
      borderRadius: 2, marginRight: 6, verticalAlign: "middle",
      background: done ? "#000" : "white", flexShrink: 0,
    }} />
  );
}

// ── REPORT 1: Fila de Entregas ────────────────────────────────────────────────

function DeliveryQueueReport({ clients }: { clients: Client[] }) {
  const pending = clients
    .filter(c => c.status === "fechado")
    .sort((a, b) => {
      const da = parseBR(a.weddingDate)?.getTime() ?? 0;
      const db = parseBR(b.weddingDate)?.getTime() ?? 0;
      return da - db;
    });

  return (
    <div id="print-area" style={{ fontFamily: "Arial, sans-serif", fontSize: 13, color: "#111" }}>
      <PrintHeader
        title="Fila de Entregas — Fluxo de Trabalho"
        subtitle={`${pending.length} projetos em andamento`}
      />
      {pending.map((c, i) => {
        const steps = c.hasAlbum ? [...STEPS, ...ALBUM_STEPS] : STEPS;
        const filtered = c.semEntregaFisica ? steps.filter(s => s.field !== "boxDelivered") : steps;
        const done = filtered.filter(s => !!c[s.field as keyof Client]).length;
        return (
          <div key={c.id} style={{
            marginBottom: 12, padding: "10px 12px",
            border: "1px solid #ccc", borderRadius: 6,
            breakInside: "avoid", pageBreakInside: "avoid",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div>
                <strong style={{ fontSize: 14 }}>{i + 1}. {c.name}</strong>
                {c.coupleName && <span style={{ color: "#555", marginLeft: 8 }}>{c.coupleName}</span>}
              </div>
              <div style={{ textAlign: "right", fontSize: 11, color: "#555" }}>
                <div>{fmtDate(c.weddingDate)}{c.eventLocation ? ` · ${c.eventLocation}` : ""}</div>
                <div>{done}/{filtered.length} etapas</div>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
              {filtered.map(s => (
                <span key={s.field} style={{ display: "flex", alignItems: "center", fontSize: 12 }}>
                  <CheckBox done={!!c[s.field as keyof Client]} />
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── REPORT 2: Por Etapa ───────────────────────────────────────────────────────

function StageReport({ clients, stage }: { clients: Client[]; stage: string }) {
  const list = clients
    .filter(c => getStageKey(c) === stage)
    .sort((a, b) => {
      const da = parseBR(a.weddingDate)?.getTime() ?? 0;
      const db = parseBR(b.weddingDate)?.getTime() ?? 0;
      return da - db;
    });
  const label = STAGE_LABELS[stage] ?? stage;

  return (
    <div id="print-area" style={{ fontFamily: "Arial, sans-serif", fontSize: 13, color: "#111" }}>
      <PrintHeader
        title={`Relatório por Etapa — ${label}`}
        subtitle={`${list.length} projeto(s) nesta etapa`}
      />
      {list.length === 0 ? (
        <p style={{ color: "#555" }}>Nenhum projeto nesta etapa no momento.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #000" }}>
              <th style={{ textAlign: "left", padding: "4px 8px" }}>#</th>
              <th style={{ textAlign: "left", padding: "4px 8px" }}>Cliente</th>
              <th style={{ textAlign: "left", padding: "4px 8px" }}>Casal</th>
              <th style={{ textAlign: "left", padding: "4px 8px" }}>Data Evento</th>
              <th style={{ textAlign: "left", padding: "4px 8px" }}>Local</th>
              <th style={{ textAlign: "left", padding: "4px 8px" }}>Álbum</th>
              <th style={{ textAlign: "left", padding: "4px 8px" }}>✓</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "6px 8px" }}>{i + 1}</td>
                <td style={{ padding: "6px 8px", fontWeight: 600 }}>{c.name}</td>
                <td style={{ padding: "6px 8px" }}>{c.coupleName ?? "—"}</td>
                <td style={{ padding: "6px 8px" }}>{fmtDate(c.weddingDate)}</td>
                <td style={{ padding: "6px 8px" }}>{c.eventLocation ?? "—"}</td>
                <td style={{ padding: "6px 8px" }}>{c.hasAlbum ? "Sim" : "Não"}</td>
                <td style={{ padding: "6px 8px" }}>□</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {list.length > 0 && (
        <p style={{ marginTop: 24, fontSize: 11, color: "#555" }}>
          Assinatura: ___________________________ Data: ___/___/______
        </p>
      )}
    </div>
  );
}

// ── REPORT 3: Checklist Individual ────────────────────────────────────────────

function IndividualChecklist({ client }: { client: Client }) {
  const steps = client.hasAlbum ? [...STEPS, ...ALBUM_STEPS] : STEPS;
  const filtered = client.semEntregaFisica ? steps.filter(s => s.field !== "boxDelivered") : steps;

  return (
    <div id="print-area" style={{ fontFamily: "Arial, sans-serif", fontSize: 13, color: "#111" }}>
      <PrintHeader title="Checklist Individual de Projeto" />

      {/* Dados do cliente */}
      <table style={{ width: "100%", marginBottom: 20, fontSize: 13 }}>
        <tbody>
          <tr>
            <td style={{ width: "50%", paddingBottom: 6 }}>
              <strong>Cliente:</strong> {client.name}
            </td>
            <td style={{ paddingBottom: 6 }}>
              <strong>Casal:</strong> {client.coupleName ?? "—"}
            </td>
          </tr>
          <tr>
            <td style={{ paddingBottom: 6 }}>
              <strong>Data do Evento:</strong> {fmtDate(client.weddingDate)}
            </td>
            <td style={{ paddingBottom: 6 }}>
              <strong>Local:</strong> {client.eventLocation ?? "—"}
            </td>
          </tr>
          <tr>
            <td style={{ paddingBottom: 6 }}>
              <strong>Categoria:</strong> {client.eventCategory}
            </td>
            <td style={{ paddingBottom: 6 }}>
              <strong>Álbum:</strong> {client.hasAlbum ? "Sim" : "Não"}
            </td>
          </tr>
          {client.storageLocation && (
            <tr>
              <td colSpan={2} style={{ paddingBottom: 6 }}>
                <strong>Armazenamento:</strong> {client.storageLocation as string}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Checklist de etapas */}
      <div style={{ border: "1px solid #ccc", borderRadius: 6, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ background: "#f0f0f0", padding: "6px 12px", fontWeight: 700, fontSize: 13 }}>
          Etapas do Projeto
        </div>
        {filtered.map((s, i) => {
          const done = !!client[s.field as keyof Client];
          return (
            <div key={s.field} style={{
              display: "flex", alignItems: "center",
              padding: "8px 12px",
              borderTop: i > 0 ? "1px solid #e5e5e5" : undefined,
              background: done ? "#f0fdf4" : "white",
            }}>
              <CheckBox done={done} />
              <span style={{ flex: 1, fontWeight: done ? 600 : 400 }}>{s.label}</span>
              <span style={{ fontSize: 11, color: done ? "#16a34a" : "#999" }}>
                {done ? "✓ Concluído" : "Pendente"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Área de observações */}
      <div style={{ border: "1px solid #ccc", borderRadius: 6, padding: 12, minHeight: 80 }}>
        <strong style={{ fontSize: 12 }}>Observações:</strong>
        <div style={{ marginTop: 8, borderBottom: "1px solid #ddd", paddingBottom: 20 }} />
        <div style={{ borderBottom: "1px solid #ddd", paddingBottom: 20, marginTop: 16 }} />
        <div style={{ paddingBottom: 20, marginTop: 16 }} />
      </div>

      <p style={{ marginTop: 16, fontSize: 11, color: "#555" }}>
        Responsável: ___________________________ Data: ___/___/______
      </p>
    </div>
  );
}

// ── Main Dialog ───────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  clients: Client[];
}

const STAGES = Object.entries(STAGE_LABELS).filter(([k]) => k !== "finalizado");

export function WorkflowReportDialog({ open, onClose, clients }: Props) {
  const [tab, setTab] = useState("queue");
  const [selectedStage, setSelectedStage] = useState("backup_completed");
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  const activeClients = clients.filter(c => c.status === "fechado" || c.status === "projeto_finalizado");
  const selectedClient = activeClients.find(c => c.id === selectedClientId) ?? null;

  const handlePrint = () => {
    const printArea = document.getElementById("print-area");
    if (!printArea) return;

    // Clone the print area into a top-level wrapper so it's in normal document flow
    const wrapper = document.createElement("div");
    wrapper.className = "print-wrapper";
    wrapper.appendChild(printArea.cloneNode(true));
    document.body.appendChild(wrapper);

    window.print();

    // Clean up after printing
    document.body.removeChild(wrapper);
  };

  return (
    <>
      <style>{PRINT_CSS}</style>
      <Dialog open={open} onOpenChange={v => !v && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Relatórios de Impressão
              </DialogTitle>
              <Button onClick={handlePrint} className="gap-2 mr-6">
                <Printer className="h-4 w-4" />
                Imprimir / Salvar PDF
              </Button>
            </div>
          </DialogHeader>

          <Tabs value={tab} onValueChange={setTab} className="mt-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="queue" className="gap-1.5 text-xs sm:text-sm">
                <ListChecks className="h-4 w-4" />
                Fila de Entregas
              </TabsTrigger>
              <TabsTrigger value="stage" className="gap-1.5 text-xs sm:text-sm">
                <FileText className="h-4 w-4" />
                Por Etapa
              </TabsTrigger>
              <TabsTrigger value="individual" className="gap-1.5 text-xs sm:text-sm">
                <User className="h-4 w-4" />
                Checklist Individual
              </TabsTrigger>
            </TabsList>

            {/* Fila de Entregas */}
            <TabsContent value="queue" className="mt-4">
              <p className="text-sm text-muted-foreground mb-4">
                Lista completa de todos os projetos em andamento com o status de cada etapa. Ideal para conferência geral.
              </p>
              <div className="border rounded-lg p-4 bg-white overflow-auto max-h-[50vh] text-sm">
                <DeliveryQueueReport clients={activeClients} />
              </div>
            </TabsContent>

            {/* Por Etapa */}
            <TabsContent value="stage" className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">Filtrar por etapa:</p>
                <Select value={selectedStage} onValueChange={setSelectedStage}>
                  <SelectTrigger className="w-52">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="border rounded-lg p-4 bg-white overflow-auto max-h-[50vh] text-sm">
                <StageReport clients={activeClients} stage={selectedStage} />
              </div>
            </TabsContent>

            {/* Checklist Individual */}
            <TabsContent value="individual" className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">Selecionar cliente:</p>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Escolha um cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activeClients
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedClient ? (
                <div className="border rounded-lg p-4 bg-white overflow-auto max-h-[50vh] text-sm">
                  <IndividualChecklist client={selectedClient} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground text-sm border rounded-lg">
                  Selecione um cliente para ver o checklist
                </div>
              )}
            </TabsContent>
          </Tabs>

          <p className="text-xs text-muted-foreground text-center pt-2">
            Clique em "Imprimir / Salvar PDF" para gerar o documento do relatório exibido na aba ativa
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
