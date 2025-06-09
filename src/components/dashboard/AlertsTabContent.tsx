
import React from "react";
import { AlertItem } from "@/components/dashboard/AlertItem";
import { AlertItem as AlertItemType } from "@/utils/types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AlertsTabContentProps {
  editTasks: AlertItemType[];
  deliverTasks: AlertItemType[];
  payments: AlertItemType[];
  preWedding: AlertItemType[];
  activeTab: string;
}

export function AlertsTabContent({
  editTasks,
  deliverTasks,
  payments,
  preWedding,
  activeTab,
}: AlertsTabContentProps) {
  const getActiveAlerts = () => {
    switch (activeTab) {
      case "edit":
        return editTasks;
      case "deliver":
        return deliverTasks;
      case "payments":
        return payments;
      case "preWedding":
        return preWedding;
      default:
        return editTasks; // Default to edit tasks instead of all
    }
  };

  const activeAlerts = getActiveAlerts();
  
  return (
    <ScrollArea className="h-[400px] md:h-[450px] lg:h-[500px] mt-2">
      <div className="space-y-3 pr-4">
        {activeAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-muted-foreground/20 rounded-full"></div>
            </div>
            <p className="text-muted-foreground font-medium">Nenhum alerta no momento</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Tudo parece estar em ordem!</p>
          </div>
        ) : (
          activeAlerts.map((alert, index) => (
            <div key={`${alert.type}-${index}`} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <AlertItem alert={alert} />
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
