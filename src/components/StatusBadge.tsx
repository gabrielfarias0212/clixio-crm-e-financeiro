
import { ClientStatus } from "@/utils/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ClientStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  // Define color mappings for different statuses
  const colorMap: Record<ClientStatus, { bg: string; text: string; border: string }> = {
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
    "fechado": {
      bg: "bg-green-50",
      text: "text-green-600",
      border: "border-green-200"
    },
    "em andamento": {
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-200"
    },
    "pago": {
      bg: "bg-teal-50",
      text: "text-teal-600",
      border: "border-teal-200"
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
