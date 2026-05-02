// src/components/crm/WhatsAppMessageDialog.tsx

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Client, ClientMessage, MessageType } from "@/utils/types";
import { saveClientMessage, fetchClientMessages } from "@/utils/supabase/client-messages";
import { MessageCircle, Clock, Send, CheckCheck } from "lucide-react";

interface MessageTemplate {
  type: MessageType;
  label: string;
  emoji: string;
  color: string;
  generate: (client: Client) => string;
}

const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    type: "follow_up",
    label: "Follow-up",
    emoji: "👋",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    generate: (c) =>
      `Oi ${c.name}! Tudo bem? 😊\n\nPassando para saber se você ainda tem interesse em fechar nosso pacote de fotografia para o seu ${c.eventCategory?.toLowerCase() ?? "evento"}${c.weddingDate ? ` em ${new Date(c.weddingDate).toLocaleDateString("pt-BR")}` : ""}.\n\nQualquer dúvida estou à disposição! 📸`,
  },
  {
    type: "cobranca",
    label: "Cobrança educada",
    emoji: "💰",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    generate: (c) => {
      const pending = c.payments?.find((p) => p.payment_status === "pendente");
      const valor = pending
        ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(pending.amount)
        : "um valor pendente";
      const venc = pending?.due_date
        ? new Date(pending.due_date).toLocaleDateString("pt-BR")
        : null;
      return `Oi ${c.name}! Tudo bem? 😊\n\nPassando para lembrar que temos ${valor}${venc ? ` com vencimento em ${venc}` : ""} em aberto.\n\nQualquer dúvida ou se precisar combinar outra data, é só me avisar! 🙏`;
    },
  },
  {
    type: "contrato",
    label: "Envio de contrato",
    emoji: "📄",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    generate: (c) =>
      `Oi ${c.name}! Tudo bem? 😊\n\nSegue o link do contrato para revisão e assinatura:\n${c.contractLink ?? "[inserir link aqui]"}\n\nQualquer dúvida estou aqui! ✍️`,
  },
  {
    type: "boas_vindas",
    label: "Boas-vindas",
    emoji: "🎉",
    color: "bg-green-100 text-green-800 border-green-200",
    generate: (c) =>
      `Oi ${c.name}! Seja muito bem-vindo(a)! 🎉\n\nEstou super feliz em fotografar o seu ${c.eventCategory?.toLowerCase() ?? "evento"}! Vou cuidar de cada detalhe para que as memórias fiquem incríveis. 📸\n\nQualquer dúvida pode me chamar a qualquer hora!`,
  },
  {
    type: "personalizada",
    label: "Personalizada",
    emoji: "✏️",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    generate: (c) => `Oi ${c.name}! `,
  },
];

const MESSAGE_TYPE_LABELS: Record<MessageType, string> = {
  follow_up: "Follow-up",
  cobranca: "Cobrança",
  contrato: "Contrato",
  boas_vindas: "Boas-vindas",
  personalizada: "Personalizada",
};

interface WhatsAppMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client;
}

export function WhatsAppMessageDialog({
  open,
  onOpenChange,
  client,
}: WhatsAppMessageDialogProps) {
  const [selectedType, setSelectedType] = useState<MessageType | null>(null);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<ClientMessage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedType(null);
      setMessageText("");
      loadHistory();
    }
  }, [open, client.id]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    const msgs = await fetchClientMessages(client.id);
    setHistory(msgs);
    setLoadingHistory(false);
  };

  const handleSelectTemplate = (template: MessageTemplate) => {
    setSelectedType(template.type);
    setMessageText(template.generate(client));
  };

  const getWhatsAppLink = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  const handleSend = async () => {
    if (!selectedType || !messageText.trim()) return;
    if (!client.phone) {
      toast.error("Este cliente não tem telefone cadastrado.");
      return;
    }

    // Open WhatsApp immediately (in the click context) to avoid popup blocker
    const whatsappUrl = getWhatsAppLink(client.phone, messageText.trim());
    window.open(whatsappUrl, "_blank");

    setSending(true);
    try {
      const { data: saved, errorMessage } = await saveClientMessage(
        client.id,
        selectedType,
        messageText.trim()
      );

      if (saved) {
        toast.success("Mensagem registrada e WhatsApp aberto! ✅");
        setHistory((prev) => [saved, ...prev]);
        setSelectedType(null);
        setMessageText("");
      } else {
        toast.error(`Erro ao registrar: ${errorMessage ?? "Tente novamente."}`);
      }
    } finally {
      setSending(false);
    }
  };

  const formatSentAt = (dateStr: string) =>
    new Date(dateStr).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

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
          {/* Seleção de template */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Escolha o tipo de mensagem:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {MESSAGE_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.type}
                  onClick={() => handleSelectTemplate(tpl)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all
                    ${selectedType === tpl.type
                      ? `${tpl.color} border-current ring-2 ring-offset-1 ring-current/30`
                      : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                    }`}
                >
                  <span>{tpl.emoji}</span>
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Editor da mensagem */}
          {selectedType && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Edite a mensagem antes de enviar:
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
                  onClick={() => { setSelectedType(null); setMessageText(""); }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Histórico */}
          <div>
            <button
              onClick={() => setShowHistory((v) => !v)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Clock className="h-3.5 w-3.5" />
              {showHistory ? "Ocultar" : "Ver"} histórico de mensagens
              {history.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {history.length}
                </Badge>
              )}
            </button>

            {showHistory && (
              <div className="mt-3 space-y-2 max-h-52 overflow-y-auto pr-1">
                {loadingHistory ? (
                  <p className="text-sm text-gray-400 text-center py-4">Carregando...</p>
                ) : history.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">
                    Nenhuma mensagem enviada ainda.
                  </p>
                ) : (
                  history.map((msg) => (
                    <div
                      key={msg.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {MESSAGE_TYPE_LABELS[msg.message_type]}
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
