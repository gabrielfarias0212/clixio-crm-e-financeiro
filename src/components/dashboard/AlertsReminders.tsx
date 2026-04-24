import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertsTabContent } from "./AlertsTabContent";
import { useAlerts } from "@/hooks/useAlerts";
import { useClients } from "@/contexts/ClientsContext";
import { Client } from "@/utils/types";
import { DollarSign, CalendarHeart, Edit3, Package2 } from "lucide-react";

interface AlertsRemindersProps {
  clients?: Client[];
}

export function AlertsReminders({ clients = [] }: AlertsRemindersProps) {
  const [activeTab, setActiveTab] = useState("edit");
  const { refreshClients } = useClients();
  const alerts = useAlerts(clients);

  const totalAlerts =
    alerts.editTasks.length +
    alerts.deliverTasks.length +
    alerts.payments.length +
    alerts.preWedding.length;

  const tabs = [
    { value: "edit",       label: "Editar",      icon: Edit3,         count: alerts.editTasks.length },
    { value: "deliver",    label: "Entregar",     icon: Package2,      count: alerts.deliverTasks.length },
    { value: "payments",   label: "Pagamentos",   icon: DollarSign,    count: alerts.payments.length },
    { value: "preWedding", label: "Pré-Wedding",  icon: CalendarHeart, count: alerts.preWedding.length },
  ];

  return (
    <Card className="rounded-xl border-stone-200 shadow-sm overflow-hidden">
      <CardHeader className="px-5 py-4 border-b border-stone-100">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium tracking-widest uppercase text-stone-400">
            Alertas e Lembretes
          </p>
          {totalAlerts > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-red-50 border border-red-200 font-mono text-[10px] font-medium text-red-500">
              {totalAlerts}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-5 pt-4">
            <TabsList className="grid grid-cols-4 w-full bg-stone-100 rounded-lg p-0.5 h-auto">
              {tabs.map(({ value, label, icon: Icon, count }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="relative flex items-center justify-center gap-1.5 rounded-md py-2 text-[11px] font-medium text-stone-500 data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm transition-all"
                >
                  <Icon size={12} strokeWidth={1.5} />
                  <span className="hidden sm:inline">{label}</span>
                  {count > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-medium border border-white">
                      {count}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="px-5 pb-5">
            <AlertsTabContent
              editTasks={alerts.editTasks}
              deliverTasks={alerts.deliverTasks}
              payments={alerts.payments}
              preWedding={alerts.preWedding}
              activeTab={activeTab}
              onRefresh={refreshClients}
            />
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
