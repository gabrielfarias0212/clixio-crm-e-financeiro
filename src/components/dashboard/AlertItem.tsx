
import React from "react";
import { AlertItem as AlertItemType } from "@/utils/types";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Bell, Calendar, DollarSign, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AlertItemProps {
  alert: AlertItemType;
}

export function AlertItem({ alert }: AlertItemProps) {
  const navigate = useNavigate();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "task":
        return <Bell className="h-5 w-5 text-amber-500" />;
      case "payment":
      case "due_payment":
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case "event":
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case "pre_wedding":
        return <Camera className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getAlertClassName = (alert: AlertItemType) => {
    if (alert.type === "due_payment") {
      if (alert.urgency === "high") return "cursor-pointer border-l-4 border-l-red-500";
      if (alert.urgency === "medium") return "cursor-pointer border-l-4 border-l-amber-500";
      return "cursor-pointer border-l-4 border-l-blue-500";
    }
    
    if (alert.type === "event") {
      if (alert.urgency === "high") return "cursor-pointer border-l-4 border-l-red-500";
      if (alert.urgency === "medium") return "cursor-pointer border-l-4 border-l-blue-400";
      return "cursor-pointer border-l-4 border-l-blue-500";
    }
    
    if (alert.type === "pre_wedding") {
      if (alert.urgency === "high") return "cursor-pointer border-l-4 border-l-red-500";
      if (alert.urgency === "medium") return "cursor-pointer border-l-4 border-l-purple-400";
      return "cursor-pointer border-l-4 border-l-purple-500";
    }
    
    if (alert.type === "task") return "cursor-pointer border-l-4 border-l-amber-500";
    return "cursor-pointer border-l-4 border-l-green-500";
  };

  const handleAlertClick = () => {
    if (alert.type === "event") {
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
      <div className="flex items-start">
        <div className="mr-2">
          {getAlertIcon(alert.type)}
        </div>
        <div className="flex-1">
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription>{alert.description}</AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
