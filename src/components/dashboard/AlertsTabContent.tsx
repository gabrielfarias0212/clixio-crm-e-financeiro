
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertItem } from "@/components/dashboard/AlertItem";
import { AlertItem as AlertItemType } from "@/utils/types";

interface AlertsTabContentProps {
  alerts: AlertItemType[];
  emptyMessage: string;
}

export function AlertsTabContent({ alerts, emptyMessage }: AlertsTabContentProps) {
  return (
    <ScrollArea className="h-[280px] pr-4">
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">{emptyMessage}</p>
        ) : (
          alerts.map((alert, index) => (
            <AlertItem key={index} alert={alert} />
          ))
        )}
      </div>
    </ScrollArea>
  );
}
