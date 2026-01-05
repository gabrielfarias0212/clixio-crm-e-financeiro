
import React from "react";
import { AlertItem as AlertItemType } from "@/utils/types";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { 
  Bell, 
  Calendar, 
  DollarSign, 
  Camera, 
  AlertTriangle, 
  Clock,
  CreditCard,
  CalendarHeart,
  Edit3,
  Package2,
  Image
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { EventStatusActions } from "./EventStatusActions";
import { PreWeddingCompleteAction } from "./PreWeddingCompleteAction";

interface AlertItemProps {
  alert: AlertItemType;
  onStatusUpdate?: () => void;
}

export function AlertItem({ alert, onStatusUpdate }: AlertItemProps) {
  const navigate = useNavigate();

  const getAlertIcon = (type: string, urgency: string, isOverdue?: boolean) => {
    const iconSize = "h-5 w-5";
    
    switch (type) {
      case "task":
        return alert.title.includes("editar") ? 
          <Edit3 className={`${iconSize} text-amber-600`} /> :
          <Package2 className={`${iconSize} text-blue-600`} />;
      case "calendar_event":
        // Ícone específico para eventos do calendário que precisam de edição
        return <Image className={`${iconSize} text-purple-600`} />;
      case "payment":
      case "due_payment":
        if (isOverdue) {
          return <AlertTriangle className={`${iconSize} text-red-600`} />;
        }
        return urgency === "high" ? 
          <CreditCard className={`${iconSize} text-red-500`} /> : 
          <DollarSign className={`${iconSize} text-green-600`} />;
      case "event":
        return <Calendar className={`${iconSize} text-blue-600`} />;
      case "pre_wedding":
        return <CalendarHeart className={`${iconSize} text-purple-600`} />;
      default:
        return <Bell className={`${iconSize} text-gray-500`} />;
    }
  };

  const getUrgencyBadge = (urgency: string, isOverdue?: boolean) => {
    if (isOverdue) {
      return <Badge variant="destructive" className="text-xs">Atrasado</Badge>;
    }
    
    switch (urgency) {
      case "high":
        return <Badge variant="destructive" className="text-xs">Alta</Badge>;
      case "medium":
        return <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">Média</Badge>;
      case "low":
        return <Badge variant="outline" className="text-xs">Baixa</Badge>;
      default:
        return null;
    }
  };

  const getAlertClassName = (alert: AlertItemType) => {
    const baseClasses = "cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-accent/50 border-l-4";
    const isOverdue = alert.isOverdue === true;
    
    if (isOverdue) {
      return `${baseClasses} border-l-red-500 bg-red-50/50 hover:bg-red-50/70 shadow-sm`;
    }
    
    if (alert.type === "calendar_event") {
      if (alert.urgency === "high") return `${baseClasses} border-l-red-500 bg-red-50/30`;
      if (alert.urgency === "medium") return `${baseClasses} border-l-purple-400 bg-purple-50/30`;
      return `${baseClasses} border-l-purple-500 bg-purple-50/30`;
    }
    
    if (alert.type === "due_payment") {
      if (alert.urgency === "high") return `${baseClasses} border-l-red-500 bg-red-50/30`;
      if (alert.urgency === "medium") return `${baseClasses} border-l-amber-500 bg-amber-50/30`;
      return `${baseClasses} border-l-blue-500 bg-blue-50/30`;
    }
    
    if (alert.type === "event") {
      if (alert.urgency === "high") return `${baseClasses} border-l-red-500 bg-red-50/30`;
      return `${baseClasses} border-l-blue-500 bg-blue-50/30`;
    }
    
    if (alert.type === "pre_wedding") {
      if (alert.urgency === "high") return `${baseClasses} border-l-red-500 bg-red-50/30`;
      if (alert.urgency === "medium") return `${baseClasses} border-l-purple-400 bg-purple-50/30`;
      return `${baseClasses} border-l-purple-500 bg-purple-50/30`;
    }
    
    if (alert.type === "task") {
      return `${baseClasses} border-l-amber-500 bg-amber-50/30`;
    }
    
    // Default for payment alerts based on urgency
    if (alert.urgency === "high") return `${baseClasses} border-l-red-500 bg-red-50/30`;
    if (alert.urgency === "medium") return `${baseClasses} border-l-amber-500 bg-amber-50/30`;
    return `${baseClasses} border-l-green-500 bg-green-50/30`;
  };

  const handleAlertClick = (e: React.MouseEvent) => {
    // Não navegar se o clique foi em um botão de ação
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    
    if (alert.type === "event") {
      navigate('/calendar');
    } else if (alert.type === "calendar_event") {
      // Para eventos do calendário, navegar para o calendário
      navigate('/calendar');
    } else {
      navigate(`/clients/${alert.client.id}`);
    }
  };

  return (
    <Alert 
      className={getAlertClassName(alert)}
      onClick={handleAlertClick}
    >
      <div className="flex items-start justify-between w-full">
        <div className="flex items-start flex-1 min-w-0">
          <div className="mr-3 mt-0.5 flex-shrink-0">
            {getAlertIcon(alert.type, alert.urgency || "medium", alert.isOverdue)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <AlertTitle className="text-sm font-semibold leading-tight pr-2">{alert.title}</AlertTitle>
              {getUrgencyBadge(alert.urgency || "medium", alert.isOverdue)}
            </div>
            <AlertDescription className="text-sm text-muted-foreground leading-relaxed">
              {alert.description}
            </AlertDescription>
            {alert.isOverdue && (
              <div className="flex items-center mt-2 text-xs text-red-600">
                <Clock className="h-3 w-3 mr-1" />
                <span className="font-medium">Requer atenção imediata</span>
              </div>
            )}
            
            {/* Ações para eventos do calendário */}
            {alert.type === "calendar_event" && alert.event && (
              <EventStatusActions 
                event={alert.event} 
                onStatusUpdate={onStatusUpdate}
              />
            )}
            
            {/* Ação rápida para pré-wedding */}
            {alert.type === "pre_wedding" && (
              <PreWeddingCompleteAction 
                client={alert.client} 
                onStatusUpdate={onStatusUpdate}
              />
            )}
          </div>
        </div>
      </div>
    </Alert>
  );
}
