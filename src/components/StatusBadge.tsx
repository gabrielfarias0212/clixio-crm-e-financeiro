
import { ClientStatus } from "@/utils/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ClientStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  // Define color mappings for different statuses
  const colorMap: Record<ClientStatus, { bg: string; text: string; border: string }> = {
    "primeiro_contato": {
      bg: "bg-gray-50",
      text: "text-gray-600",
      border: "border-gray-200"
    },
    "orçamento enviado": {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-200"
    },
    "negociacao": {
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-200"
    },
    "fechado": {
      bg: "bg-green-50",
      text: "text-green-600",
      border: "border-green-200"
    },
    "projeto_finalizado": {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-200"
    }
  };

  // Get the configuration for the status, with a fallback for unknown statuses
  const config = colorMap[status];
  
  // If config is undefined (unknown status), use a default fallback
  const { bg, text, border } = config || {
    bg: "bg-gray-50",
    text: "text-gray-600", 
    border: "border-gray-200"
  };

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
