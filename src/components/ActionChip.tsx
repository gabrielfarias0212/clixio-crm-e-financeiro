
import { NextAction } from "@/utils/types";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, Edit, Mail, Send, Calendar, FileText, User, Zap, AlertCircle } from "lucide-react";

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
    "enviar_proposta": {
      icon: <Send className="h-3 w-3 mr-1" />,
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-100"
    },
    "aguardar_resposta": {
      icon: <Clock className="h-3 w-3 mr-1" />,
      bg: "bg-yellow-50",
      text: "text-yellow-600",
      border: "border-yellow-100"
    },
    "negociar_condicoes": {
      icon: <User className="h-3 w-3 mr-1" />,
      bg: "bg-orange-50",
      text: "text-orange-600",
      border: "border-orange-100"
    },
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
    "redigir_enviar_contrato": {
      icon: <FileText className="h-3 w-3 mr-1" />,
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      border: "border-indigo-100"
    },
    "agendar_pre_wedding": {
      icon: <Calendar className="h-3 w-3 mr-1" />,
      bg: "bg-pink-50",
      text: "text-pink-600",
      border: "border-pink-100"
    },
    "editar_pre_wedding": {
      icon: <Edit className="h-3 w-3 mr-1" />,
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-100"
    },
    "fotografar_evento_principal": {
      icon: <Zap className="h-3 w-3 mr-1" />,
      bg: "bg-cyan-50",
      text: "text-cyan-600",
      border: "border-cyan-100"
    },
    "iniciar_edicao": {
      icon: <Edit className="h-3 w-3 mr-1" />,
      bg: "bg-violet-50",
      text: "text-violet-600",
      border: "border-violet-100"
    },
    "editar": {
      icon: <Edit className="h-3 w-3 mr-1" />,
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-100"
    },
    "entregar_galeria_digital": {
      icon: <CheckCircle className="h-3 w-3 mr-1" />,
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-100"
    },
    "entregar": {
      icon: <CheckCircle className="h-3 w-3 mr-1" />,
      bg: "bg-green-50",
      text: "text-green-600",
      border: "border-green-100"
    },
    "aprovar_album": {
      icon: <CheckCircle className="h-3 w-3 mr-1" />,
      bg: "bg-teal-50",
      text: "text-teal-600",
      border: "border-teal-100"
    },
    "entregar_caixinha_final": {
      icon: <CheckCircle className="h-3 w-3 mr-1" />,
      bg: "bg-green-50",
      text: "text-green-600",
      border: "border-green-100"
    },
    "agradecer_pedir_feedback": {
      icon: <Mail className="h-3 w-3 mr-1" />,
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-100"
    },
    "agendar reunião": {
      icon: <Calendar className="h-3 w-3 mr-1" />,
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      border: "border-indigo-100"
    },
    "nenhuma": {
      icon: <Clock className="h-3 w-3 mr-1" />,
      bg: "bg-gray-50",
      text: "text-gray-500",
      border: "border-gray-100"
    },
    "nenhuma_acao_pendente": {
      icon: <CheckCircle className="h-3 w-3 mr-1" />,
      bg: "bg-gray-50",
      text: "text-gray-500",
      border: "border-gray-100"
    }
  };

  // Safely access the configuration for the given action
  const config = actionConfig[action];
  
  // If for some reason the config is undefined, use a fallback
  const icon = config?.icon || <Clock className="h-3 w-3 mr-1" />;
  const bg = config?.bg || "bg-gray-50";
  const text = config?.text || "text-gray-500";
  const border = config?.border || "border-gray-100";

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
