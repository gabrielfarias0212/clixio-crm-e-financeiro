// src/components/crm/CRMClientDialog.tsx

import { formatDate } from '@/utils/dates';
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Client, SalesFunnelStage, ClientStatus } from "@/utils/types";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useClients } from "@/contexts/ClientsContext";
import { toast } from "sonner";
import { WhatsAppMessageDialog } from "@/components/crm/WhatsAppMessageDialog";
import { CRMActivityPanel } from "@/components/crm/CRMActivityPanel";
import { History } from "lucide-react";
import {
  Phone, Mail, Calendar, DollarSign, Tag, Zap,
  FileText, ExternalLink, Copy, Check, User,
} from "lucide-react";

interface CRMClientDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STAGE_LABELS: Record<SalesFunnelStage, string> = {
  primeiro_contato: "Primeiro Contato",
  orcamento_enviado: "Orçamento Enviado",
  negociacao: "Follow-up",
  contrato_fechado: "Contrato Fechado",
  projeto_finalizado: "Projeto Finalizado",
  contrato_perdido: "Arquivado (Perdido)",
};

const STAGE_OPTIONS: { value: SalesFunnelStage; label: string }[] = [
  { value: "primeiro_contato", label: "Primeiro Contato" },
  { value: "orcamento_enviado", label: "Orçamento Enviado" },
  { value: "negociacao", label: "Follow-up" },
  { value: "contrato_fechado", label: "Contrato Fechado" },
  { value: "projeto_finalizado", label: "Projeto Finalizado" },
  { value: "contrato_perdido", label: "Arquivado (Perdido)" },
];

const STATUS_MAP: Record<SalesFunnelStage, ClientStatus> = {
  primeiro_contato: "primeiro_contato",
  orcamento_enviado: "orçamento enviado",
  negociacao: "negociacao",
  contrato_fechado: "fechado",
  projeto_finalizado: "projeto_finalizado",
  contrato_perdido: "contrato_perdido",
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(v);

const displayDate = (d: string | Date | null) =>
  d ? formatDate(d) : "—";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} className="ml-1 text-muted-foreground hover:text-foreground transition-colors">
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export function CRMClientDialog({ client, open, onOpenChange }: CRMClientDialogProps) {
  const { updateClient } = useClients();
  const navigate = useNavigate();
  const [whatsAppOpen, setWhatsAppOpen] = useState(false);
  const [movingStage, setMovingStage] = useState(false);

  if (!client) return null;

  const pago = client.payments?.reduce((s, p) => s + (p.amount || 0), 0) ?? client.downPayment ?? 0;
  const restante = (client.contractValue || 0) - pago;

  const handleStageChange = async (newStage: SalesFunnelStage) => {
    setMovingStage(true);
    const success = await updateClient(client.id, {
      salesFunnelStage: newStage,
      status: STATUS_MAP[newStage],
    });
    setMovingStage(false);
    if (success) toast.success(`Movido para ${STAGE_LABELS[newStage]}`);
    else toast.error("Erro ao mover cliente");
  };

  const openWhatsApp = () => {
    const phone = client.phone.replace(/\D/g, "");
    window.open(`https://wa.me/55${phone}`, "_blank");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">{client.name}</DialogTitle>
          </DialogHeader>

          {/* Cabeçalho do cliente */}
          <div className="flex items-center gap-4 pb-4 border-b">
            <Avatar className="h-14 w-14 shrink-0">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${client.name}`} />
              <AvatarFallback className="text-lg">
                {client.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h2 className="text-lg font-bold truncate">{client.name}</h2>
              {client.coupleName && (
                <p className="text-sm text-muted-foreground truncate">& {client.coupleName}</p>
              )}
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="secondary" className="text-xs">{client.eventCategory}</Badge>
                <Badge variant="outline" className="text-xs">{STAGE_LABELS[client.salesFunnelStage]}</Badge>
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide flex items-center gap-1">
              <User className="h-3.5 w-3.5" /> Contato
            </h3>
            {client.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{client.phone}</span>
                <CopyButton text={client.phone} />
                <button
                  onClick={openWhatsApp}
                  className="ml-auto text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                  </svg>
                  Abrir WhatsApp
                </button>
              </div>
            )}
            {client.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">{client.email}</span>
                <CopyButton text={client.email} />
              </div>
            )}
            {!client.phone && !client.email && (
              <p className="text-sm text-muted-foreground">Nenhum contato cadastrado</p>
            )}
          </div>

          {/* Evento */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Evento
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/40 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-0.5">Data</p>
                <p className="text-sm font-medium">{displayDate(client.weddingDate)}</p>
              </div>
              <div className="bg-muted/40 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-0.5">Categoria</p>
                <p className="text-sm font-medium">{client.eventCategory}</p>
              </div>
            </div>
          </div>

          {/* Financeiro */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" /> Financeiro
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-muted/40 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-0.5">Contrato</p>
                <p className="text-sm font-bold text-green-600">{formatCurrency(client.contractValue)}</p>
              </div>
              <div className="bg-muted/40 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-0.5">Pago</p>
                <p className="text-sm font-bold text-blue-600">{formatCurrency(pago)}</p>
              </div>
              <div className="bg-muted/40 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-0.5">Restante</p>
                <p className={`text-sm font-bold ${restante > 0 ? "text-orange-600" : "text-green-600"}`}>
                  {formatCurrency(restante)}
                </p>
              </div>
            </div>
          </div>

          {/* Próxima ação + origem */}
          <div className="grid grid-cols-2 gap-3">
            {client.nextAction && client.nextAction !== "nenhuma" && (
              <div className="bg-muted/40 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                  <Zap className="h-3 w-3" /> Próxima ação
                </p>
                <p className="text-sm font-medium capitalize">{client.nextAction}</p>
              </div>
            )}
            {client.leadSource && (
              <div className="bg-muted/40 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Origem
                </p>
                <p className="text-sm font-medium">{client.leadSource}</p>
              </div>
            )}
          </div>

          {/* Observações */}
          {client.notes && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" /> Observações
              </h3>
              <p className="text-sm text-muted-foreground bg-muted/40 rounded-lg p-3 whitespace-pre-line">
                {client.notes}
              </p>
            </div>
          )}

          {/* Histórico & Follow-ups */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide flex items-center gap-1">
              <History className="h-3.5 w-3.5" /> Histórico & Follow-ups
            </h3>
            <div className="rounded-xl border border-stone-200 overflow-hidden">
              <CRMActivityPanel clientId={client.id} clientName={client.name} />
            </div>
          </div>

          {/* Mover etapa */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
              Mover para etapa
            </h3>
            <Select
              value={client.salesFunnelStage}
              onValueChange={(v) => handleStageChange(v as SalesFunnelStage)}
              disabled={movingStage}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAGE_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ações */}
          <div className="flex gap-2 pt-2 border-t">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setWhatsAppOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
              </svg>
              Enviar mensagem
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => { onOpenChange(false); navigate(`/clients/${client.id}`); }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver cadastro
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {whatsAppOpen && (
        <WhatsAppMessageDialog
          open={whatsAppOpen}
          onOpenChange={setWhatsAppOpen}
          client={client}
        />
      )}
    </>
  );
}
