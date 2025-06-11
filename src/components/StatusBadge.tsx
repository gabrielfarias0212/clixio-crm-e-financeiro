
import { ClientStatus } from "@/utils/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ClientStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  // Define color mappings for different statuses
  const colorMap: Record<ClientStatus, { bg: string; text: string; border: string }> = {
    "novo lead": {
      bg: "bg-slate-50",
      text: "text-slate-600",
      border: "border-slate-200"
    },
    "proposta enviada": {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-200"
    },
    "negociação": {
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-200"
    },
    "fechado (aguardando assinatura)": {
      bg: "bg-orange-50",
      text: "text-orange-600",
      border: "border-orange-200"
    },
    "contrato assinado": {
      bg: "bg-green-50",
      text: "text-green-600",
      border: "border-green-200"
    },
    "contrato oficializado e entrada confirmada": {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-200"
    },
    "pré-wedding agendado": {
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-200"
    },
    "pré-wedding feito": {
      bg: "bg-violet-50",
      text: "text-violet-600",
      border: "border-violet-200"
    },
    "pré-wedding entregue": {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      border: "border-indigo-200"
    },
    "evento principal fotografado": {
      bg: "bg-cyan-50",
      text: "text-cyan-600",
      border: "border-cyan-200"
    },
    "material em pós-produção": {
      bg: "bg-sky-50",
      text: "text-sky-600",
      border: "border-sky-200"
    },
    "galeria/link entregue": {
      bg: "bg-teal-50",
      text: "text-teal-600",
      border: "border-teal-200"
    },
    "álbum aprovado / em produção": {
      bg: "bg-lime-50",
      text: "text-lime-600",
      border: "border-lime-200"
    },
    "cliente escolheu as fotos e álbum está sendo feito": {
      bg: "bg-yellow-50",
      text: "text-yellow-600",
      border: "border-yellow-200"
    },
    "trabalho entregue": {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-300"
    },
    "todas as entregas finalizadas": {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-300"
    }
  };

  // Get the color configuration, with fallback for unknown statuses
  const colorConfig = colorMap[status] || {
    bg: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-200"
  };

  const { bg, text, border } = colorConfig;

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
