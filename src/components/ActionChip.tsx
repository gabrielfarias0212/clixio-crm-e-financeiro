
import { NextAction } from "@/utils/types";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, Edit, Mail, Send } from "lucide-react";

interface ActionChipProps {
  action: NextAction;
  className?: string;
}

export function ActionChip({ action, className }: ActionChipProps) {
  // Define icon and color mappings for different actions
  const actionConfig: Record<NextAction, { 
    icon: React.ReactNode; 
    bg: string; 
    text: string;
    border: string;
  }> = {
    "responder": {
      icon: <Mail className="h-3 w-3 mr-1" />,
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-100"
    },
    "enviar proposta": {
      icon: <Send className="h-3 w-3 mr-1" />,
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-100"
    },
    "editar": {
      icon: <Edit className="h-3 w-3 mr-1" />,
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-100"
    },
    "entregar": {
      icon: <CheckCircle className="h-3 w-3 mr-1" />,
      bg: "bg-green-50",
      text: "text-green-600",
      border: "border-green-100"
    },
    "nenhuma": {
      icon: <Clock className="h-3 w-3 mr-1" />,
      bg: "bg-gray-50",
      text: "text-gray-500",
      border: "border-gray-100"
    }
  };

  const { icon, bg, text, border } = actionConfig[action];

  return (
    <span 
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
        "transition-all duration-200 ease-in-out",
        bg, text, border,
        className
      )}
    >
      {icon}
      {action}
    </span>
  );
}
