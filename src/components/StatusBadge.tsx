
import { ClientStatus } from "@/utils/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ClientStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  // Define color mappings for different statuses
  const colorMap: Record<ClientStatus, { bg: string; text: string; border: string }> = {
    "novo_lead": {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-200"
    },
    "proposta_enviada": {
      bg: "bg-yellow-50",
      text: "text-yellow-600",
      border: "border-yellow-200"
    },
    "negociacao": {
      bg: "bg-orange-50",
      text: "text-orange-600",
      border: "border-orange-200"
    },
    "orçamento enviado": {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-200"
    },
    "follow-up": {
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-200"
    },
    "fechado_aguardando_assinatura": {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      border: "border-indigo-200"
    },
    "fechado": {
      bg: "bg-green-50",
      text: "text-green-600",
      border: "border-green-200"
    },
    "contrato_assinado": {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-200"
    },
    "pre_wedding_agendado": {
      bg: "bg-pink-50",
      text: "text-pink-600",
      border: "border-pink-200"
    },
    "pre_wedding_feito": {
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-200"
    },
    "em andamento": {
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-200"
    },
    "evento_principal_fotografado": {
      bg: "bg-cyan-50",
      text: "text-cyan-600",
      border: "border-cyan-200"
    },
    "galeria_entregue": {
      bg: "bg-teal-50",
      text: "text-teal-600",
      border: "border-teal-200"
    },
    "album_aprovado_producao": {
      bg: "bg-violet-50",
      text: "text-violet-600",
      border: "border-violet-200"
    },
    "caixinha_entregue": {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-200"
    },
    "pago": {
      bg: "bg-teal-50",
      text: "text-teal-600",
      border: "border-teal-200"
    },
    "entregue": {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-200"
    },
    "contrato_concluido": {
      bg: "bg-gray-50",
      text: "text-gray-600",
      border: "border-gray-200"
    }
  };

  const { bg, text, border } = colorMap[status];

  return (
    <span 
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        "transition-all duration-200 ease-in-out",
        bg, text, border,
        className
      )}
    >
      {status}
    </span>
  );
}
