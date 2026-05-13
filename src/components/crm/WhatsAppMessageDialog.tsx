// src/components/crm/WhatsAppMessageDialog.tsx
// Melhoria #1: busca templates salvos em Configurações → Templates
// e interpola [Nome], [DATA], [LINK] com dados reais do cliente.
// Fallback para 5 templates padrão se o usuário não tiver nenhum salvo.

import { formatDate } from '@/utils/dates';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Client, ClientMessage, MessageType } from "@/utils/types";
import { saveClientMessage, fetchClientMessages } from "@/utils/supabase/client-messages";
import { fetchMessageTemplates, MessageTemplate as SavedTemplate, TEMPLATE_STAGE_LABELS } from "@/utils/supabase/message-templates";
import { MessageCircle, Clock, Send, CheckCheck, Settings, Loader2 } from "lucide-react";

// ── Variáveis interpoláveis ───────────────────────────────────────────────────
function interpolate(text: string, client: Client): string {
  const weddingDate = client.weddingDate ? formatDate(client.weddingDate) : "";
  const pending = client.payments?.find((p) => p.payment_status === "pendente");
  const valorPendente = pending
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(pending.amount)
    : "";

  return text
    .replace(/\[Nome\]/gi, client.name)
    .replace(/\[DATA\]/gi, weddingDate)
    .replace(/\[LINK\]/gi, client.contractLink ?? "")
    .replace(/\[VALOR\]/gi, valorPendente)
    .replace(/\[EVENTO\]/gi, client.eventCategory ?? "");
}

// ── Templates padrão (fallback quando não há templates salvos) ────────────────
interface FallbackTemplate {
  id: string;
  label: string;
  emoji: string;
  type: MessageType;
  generate: (c: Client) => string;
}

const FALLBACK_TEMPLATES: FallbackTemplate[] = [
  {
    id: "__follow_up",
    type: "follow_up",
    label: "Follow-up",
    emoji: "👋",
    generate: (c) =>
      `Oi ${c.name}! Tudo bem? 😊\n\nPassando para saber se você ainda tem interesse em fechar nosso pacote para o seu ${c.eventCategory?.toLowerCase() ?? "evento"}${c.weddingDate ? ` em ${formatDate(c.weddingDate)}` : ""}.\n\nQualquer dúvida estou à disposição! 📸`,
  },
  {
    id: "__cobranca",
    type: "cobranca",
    label: "Cobrança educada",
    emoji: "💰",
    generate: (c) => {
      const pending = c.payments?.find((p) => p.payment_status === "pendente");
      const valor = pending
        ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(pending.amount)
        : "um valor pendente";
      const venc = pending?.due_date ? formatDate(pending.due_date) : null;
      return `Oi ${c.name}! Tudo bem? 😊\n\nPassando para lembrar que temos ${valor}${venc ? ` com vencimento em ${venc}` : ""} em aberto.\n\nQualquer dúvida, é só me avisar! 🙏`;
    },
  },
  {
    id: "__contrato",
    type: "contrato",
    label: "Envio de contrato",
    emoji: "📄",
    generate: (c) =>
      `Oi ${c.name}! Tudo bem? 😊\n\nSegue o link do contrato para revisão e assinatura:\n${c.contractLink ?? "[inserir link aqui]"}\n\nQualquer dúvida estou aqui! ✍️`,
  },
  {
    id: "__boas_vindas",
    type: "boas_vindas",
    label: "Boas-vindas",
    emoji: "🎉",
    generate: (c) =>
      `Oi ${c.name}! Seja muito bem-vindo(a)! 🎉\n\nEstou super feliz em fotografar o seu ${c.eventCategory?.toLowerCase() ?? "evento"}! Vou cuidar de cada detalhe para que as memórias fiquem incríveis. 📸`,
  },
  {
    id: "__personalizada",
    type: "personalizada",
    label: "Personalizada",
    emoji: "✏️",
    generate: (c) => `Oi ${c.name}! `,
  },
];

// ── Labels histórico ──────────────────────────────────────────────────────────
const MESSAGE_TYPE_LABELS: Record<MessageType, string> = {
  follow_up: "Follow-up",
  cobranca: "Cobrança",
  contrato: "Contrato",
  boas_vindas: "Boas-vindas",
  personalizada: "Personalizada",
};

// ── Cores por etapa do funil ──────────────────────────────────────────────────
const STAGE_COLORS: Record<string, string> = {
  primeiro_contato:   "bg-blue-50 text-blue-700 border-blue-200",
  orcamento_enviado:  "bg-orange-50 text-orange-700 border-orange-200",
  negociacao:         "bg-yellow-50 text-yellow-700 border-yellow-200",
  contrato_fechado:   "bg-green-50 text-green-700 border-green-200",
  projeto_finalizado: "bg-purple-50 text-purple-700 border-purple-200",
  contrato_perdido:   "bg-red-50 text-red-700 border-red-200",
};

// ── Props ─────────────────────────────────────────────────────────────────────
interface WhatsAppMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client;
}

// ── Componente ────────────────────────────────────────────────────────────────
export function WhatsAppMessageDialog({ open, onOpenChange, client }: WhatsAppMessageDialogProps) {
  const navigate = useNavigate();

  const [selectedId, setSelectedId]       = useState<string | null>(null);
  const [selectedType, setSelectedType]   = useState<MessageType>("personalizada");
  const [messageText, setMessageText]     = useState("");
  const [sending, setSending]             = useState(false);

  // Templates salvos pelo usuário
  const [savedTemplates, setSavedTemplates]       = useState<SavedTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates]   = useState(false);

  // Histórico de mensagens enviadas
  const [history, setHistory]             = useState<ClientMessage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory]     = useState(false);

  // ── carrega ao abrir ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    setSelectedId(null);
    setMessageText("");
    loadSavedTemplates();
    loadHistory();
  }, [open, client.id]);

  async function loadSavedTemplates() {
    setLoadingTemplates(true);
    try {
      const data = await fetchMessageTemplates();
      setSavedTemplates(data);
    } catch {
      setSavedTemplates([]);
    } finally {
      setLoadingTemplates(false);
    }
  }

  async function loadHistory() {
    setLoadingHistory(true);
    const msgs = await fetchClientMessages(client.id);
    setHistory(msgs);
    setLoadingHistory(false);
  }

  // ── Seleção de template ─────────────────────────────────────────────────────
  function handleSelectSaved(tpl: SavedTemplate) {
    setSelectedId(tpl.id);
    setSelectedType("personalizada");
    setMessageText(interpolate(tpl.body, client));
  }

  function handleSelectFallback(tpl: FallbackTemplate) {
    setSelectedId(tpl.id);
    setSelectedType(tpl.type);
    setMessageText(tpl.generate(client));
  }

  // ── WhatsApp link ───────────────────────────────────────────────────────────
  function getWhatsAppLink(phone: string, text: string) {
    let clean = phone.replace(/\D/g, "");
    if (!clean.startsWith("55")) clean = "55" + clean;
    return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
  }

  // ── Envio ───────────────────────────────────────────────────────────────────
  async function handleSend() {
    if (!selectedId || !messageText.trim()) return;
    if (!client.phone) {
      toast.error("Este cliente não tem telefone cadastrado.");
      return;
    }

    // Abre WhatsApp imediatamente (evita bloqueio de popup)
    window.open(getWhatsAppLink(client.phone, messageText.trim()), "_blank");

    setSending(true);
    try {
      const { data: saved, errorMessage } = await saveClientMessage(
        client.id,
        selectedType,
        messageText.trim()
      );
      if (saved) {
        toast.success("WhatsApp aberto e mensagem registrada! ✅");
        setHistory((prev) => [saved, ...prev]);
        setSelectedId(null);
        setMessageText("");
      } else {
        toast.warning(`WhatsApp aberto. Falha ao registrar: ${errorMessage ?? "verifique o console."}`);
      }
    } finally {
      setSending(false);
    }
  }

  // ── Helpers de exibição ─────────────────────────────────────────────────────
  const formatSentAt = (d: string) =>
    new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

  const usingSaved = savedTemplates.length > 0;

  // Filtra templates da etapa atual do cliente (se houver), senão mostra todos
  const stageTemplates = savedTemplates.filter(t => t.stage === client.salesFunnelStage);
  const otherTemplates = savedTemplates.filter(t => t.stage !== client.salesFunnelStage);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 bg-green-100 rounded-lg">
              <MessageCircle className="h-4 w-4 text-green-600" />
            </div>
            Enviar mensagem — {client.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          {/* ── Seleção de template ─────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">
                {usingSaved ? "Seus templates:" : "Templates padrão:"}
              </p>
              <button
                onClick={() => { onOpenChange(false); navigate("/settings"); }}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Settings className="h-3 w-3" />
                Gerenciar templates
              </button>
            </div>

            {loadingTemplates ? (
              <div className="flex items-center justify-center py-6 text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">Carregando templates...</span>
              </div>
            ) : usingSaved ? (
              <div className="space-y-3">
                {/* Templates da etapa atual em destaque */}
                {stageTemplates.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1.5">
                      Etapa atual: <span className="font-medium">{TEMPLATE_STAGE_LABELS[client.salesFunnelStage as keyof typeof TEMPLATE_STAGE_LABELS] ?? client.salesFunnelStage}</span>
                    </p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {stageTemplates.map((tpl) => (
                        <button
                          key={tpl.id}
                          onClick={() => handleSelectSaved(tpl)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm font-medium text-left transition-all ${
                            selectedId === tpl.id
                              ? "bg-green-50 border-green-300 text-green-800 ring-2 ring-green-200"
                              : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <span>{tpl.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${STAGE_COLORS[tpl.stage] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                            {TEMPLATE_STAGE_LABELS[tpl.stage]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Demais templates */}
                {otherTemplates.length > 0 && (
                  <div>
                    {stageTemplates.length > 0 && (
                      <p className="text-xs text-gray-400 mb-1.5">Outros templates:</p>
                    )}
                    <div className="grid grid-cols-1 gap-1.5">
                      {otherTemplates.map((tpl) => (
                        <button
                          key={tpl.id}
                          onClick={() => handleSelectSaved(tpl)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm font-medium text-left transition-all ${
                            selectedId === tpl.id
                              ? "bg-green-50 border-green-300 text-green-800 ring-2 ring-green-200"
                              : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <span>{tpl.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${STAGE_COLORS[tpl.stage] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                            {TEMPLATE_STAGE_LABELS[tpl.stage]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Fallback: templates padrão
              <div className="grid grid-cols-2 gap-2">
                {FALLBACK_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => handleSelectFallback(tpl)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      selectedId === tpl.id
                        ? "bg-green-50 border-green-300 text-green-800 ring-2 ring-green-200"
                        : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <span>{tpl.emoji}</span>
                    {tpl.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Editor da mensagem ──────────────────────────────────────── */}
          {selectedId && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Edite antes de enviar:
              </p>
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={6}
                className="resize-none text-sm"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSend}
                  disabled={sending || !messageText.trim()}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sending ? "Registrando..." : "Abrir WhatsApp e registrar"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setSelectedId(null); setMessageText(""); }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* ── Histórico ───────────────────────────────────────────────── */}
          <div>
            <button
              onClick={() => setShowHistory((v) => !v)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Clock className="h-3.5 w-3.5" />
              {showHistory ? "Ocultar" : "Ver"} histórico de mensagens
              {history.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">{history.length}</Badge>
              )}
            </button>

            {showHistory && (
              <div className="mt-3 space-y-2 max-h-52 overflow-y-auto pr-1">
                {loadingHistory ? (
                  <p className="text-sm text-gray-400 text-center py-4">Carregando...</p>
                ) : history.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Nenhuma mensagem enviada ainda.</p>
                ) : (
                  history.map((msg) => (
                    <div key={msg.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {MESSAGE_TYPE_LABELS[msg.message_type] ?? msg.message_type}
                        </Badge>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <CheckCheck className="h-3 w-3 text-green-500" />
                          {formatSentAt(msg.sent_at)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 whitespace-pre-wrap">
                        {msg.message_text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
