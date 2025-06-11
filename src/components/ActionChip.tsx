
import { NextAction } from "@/utils/types";
import { cn } from "@/lib/utils";
import { 
  CheckCircle, 
  Clock, 
  Edit, 
  Mail, 
  Send, 
  Calendar,
  FileText,
  Camera,
  Image,
  Package,
  Star,
  Handshake,
  DollarSign,
  PenTool
} from "lucide-react";

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
    "enviar proposta inicial": {
      icon: <Send className="h-3 w-3 mr-1" />,
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-100"
    },
    "aguardar resposta do cliente": {
      icon: <Clock className="h-3 w-3 mr-1" />,
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-100"
    },
    "negociar condições": {
      icon: <Handshake className="h-3 w-3 mr-1" />,
      bg: "bg-orange-50",
      text: "text-orange-600",
      border: "border-orange-100"
    },
    "preparar contrato": {
      icon: <FileText className="h-3 w-3 mr-1" />,
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-100"
    },
    "oficializar entrada": {
      icon: <DollarSign className="h-3 w-3 mr-1" />,
      bg: "bg-green-50",
      text: "text-green-600",
      border: "border-green-100"
    },
    "agendar pré-wedding": {
      icon: <Calendar className="h-3 w-3 mr-1" />,
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      border: "border-indigo-100"
    },
    "realizar pré-wedding": {
      icon: <Camera className="h-3 w-3 mr-1" />,
      bg: "bg-violet-50",
      text: "text-violet-600",
      border: "border-violet-100"
    },
    "editar e entregar pré-wedding": {
      icon: <Edit className="h-3 w-3 mr-1" />,
      bg: "bg-cyan-50",
      text: "text-cyan-600",
      border: "border-cyan-100"
    },
    "fotografar evento principal": {
      icon: <Camera className="h-3 w-3 mr-1" />,
      bg: "bg-sky-50",
      text: "text-sky-600",
      border: "border-sky-100"
    },
    "iniciar pós-produção": {
      icon: <PenTool className="h-3 w-3 mr-1" />,
      bg: "bg-slate-50",
      text: "text-slate-600",
      border: "border-slate-100"
    },
    "preparar galeria": {
      icon: <Image className="h-3 w-3 mr-1" />,
      bg: "bg-teal-50",
      text: "text-teal-600",
      border: "border-teal-100"
    },
    "apresentar álbum": {
      icon: <Star className="h-3 w-3 mr-1" />,
      bg: "bg-yellow-50",
      text: "text-yellow-600",
      border: "border-yellow-100"
    },
    "produzir álbum": {
      icon: <Package className="h-3 w-3 mr-1" />,
      bg: "bg-lime-50",
      text: "text-lime-600",
      border: "border-lime-100"
    },
    "finalizar entregas": {
      icon: <CheckCircle className="h-3 w-3 mr-1" />,
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-100"
    },
    "nenhuma ação pendente": {
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
