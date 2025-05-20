
import React from "react";
import { AlertItem } from "@/components/dashboard/AlertItem";
import { AlertItem as AlertItemType } from "@/utils/types";

interface AlertsTabContentProps {
  tasks: AlertItemType[];
  payments: AlertItemType[];
  events: AlertItemType[];
  preWedding: AlertItemType[];
  activeTab: string;
}

export function AlertsTabContent({
  tasks,
  payments,
  events,
  preWedding,
  activeTab,
}: AlertsTabContentProps) {
  const getActiveAlerts = () => {
    switch (activeTab) {
      case "tasks":
        return tasks;
      case "payments":
        return payments;
      case "events":
        return events;
      case "preWedding":
        return preWedding;
      default:
        const allAlerts = [...tasks, ...payments, ...events, ...preWedding];
        return allAlerts.sort((a, b) => {
          const urgencyOrder = { high: 0, medium: 1, low: 2 };
          return (
            (urgencyOrder[a.urgency || "medium"] -
              urgencyOrder[b.urgency || "medium"]) ||
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );
        });
    }
  };

  const activeAlerts = getActiveAlerts();
  
  return (
    <div className="space-y-3 mt-2">
      {activeAlerts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhum alerta no momento
        </div>
      ) : (
        activeAlerts.map((alert, index) => (
          <AlertItem key={`${alert.type}-${index}`} alert={alert} />
        ))
      )}
    </div>
  );
}
