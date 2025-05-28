
import React from "react";
import { AlertItem } from "@/components/dashboard/AlertItem";
import { AlertItem as AlertItemType } from "@/utils/types";

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
        const allAlerts = [...editTasks, ...deliverTasks, ...payments, ...preWedding];
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
