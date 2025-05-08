
import React from "react";
import { AlertItem as AlertItemType } from "@/utils/types";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Bell, DollarSign } from "lucide-react";
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
    
    if (alert.type === "task") return "cursor-pointer border-l-4 border-l-amber-500";
    return "cursor-pointer border-l-4 border-l-green-500";
  };

  return (
    <Alert 
      className={getAlertClassName(alert)}
      onClick={() => navigate(`/clients/${alert.client.id}`)}
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
