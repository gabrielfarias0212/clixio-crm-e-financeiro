
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertsTabContent } from "./AlertsTabContent";
import { useAlerts } from "@/hooks/useAlerts";
import { useClients } from "@/contexts/ClientsContext";
import { Client } from "@/utils/types";
import { 
  DollarSign, 
  CalendarHeart, 
  Edit3, 
  Package2,
  AlertCircle
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AlertsRemindersProps {
  clients?: Client[];
}

export function AlertsReminders({ clients = [] }: AlertsRemindersProps) {
  const [activeTab, setActiveTab] = useState("edit");
  const { refreshClients } = useClients();
  const alerts = useAlerts(clients);

  const handleRefresh = async () => {
    // Refresh clients from the database to update the alerts
    await refreshClients();
  };

  const totalAlerts = alerts.editTasks.length + alerts.deliverTasks.length + alerts.payments.length + alerts.preWedding.length;

  const tabsConfig = [
    {
      value: "edit",
      label: "Editar",
      icon: Edit3,
      count: alerts.editTasks.length,
      className: "flex-1 min-w-0"
    },
    {
      value: "deliver",
      label: "Entregar", 
      icon: Package2,
      count: alerts.deliverTasks.length,
      className: "flex-1 min-w-0"
    },
    {
      value: "payments",
      label: "Pagamentos",
      icon: DollarSign,
      count: alerts.payments.length,
      className: "flex-1 min-w-0"
    },
    {
      value: "preWedding",
      label: "Pré-Wedding",
      icon: CalendarHeart,
      count: alerts.preWedding.length,
      className: "flex-1 min-w-0"
    }
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-background to-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">
              Alertas e Lembretes
            </CardTitle>
          </div>
          {totalAlerts > 0 && (
            <Badge 
              variant="destructive" 
              className="h-6 px-2 text-xs font-semibold animate-pulse"
            >
              {totalAlerts}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="edit" value={activeTab} onValueChange={setActiveTab}>
          <div className="px-6 pt-4">
            <ScrollArea className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-0 bg-muted/50">
                {tabsConfig.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger 
                      key={tab.value}
                      value={tab.value} 
                      className={`relative transition-all duration-200 ${tab.className}`}
                    >
                      <div className="flex items-center justify-center space-x-1 min-w-0">
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="hidden sm:inline truncate text-xs lg:text-sm">
                          {tab.label}
                        </span>
                      </div>
                      {tab.count > 0 && (
                        <Badge
                          className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs border-2 border-background"
                          variant="destructive"
                        >
                          {tab.count}
                        </Badge>
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </ScrollArea>
          </div>
          
          <div className="px-6 pb-6">
            <AlertsTabContent
              editTasks={alerts.editTasks}
              deliverTasks={alerts.deliverTasks}
              payments={alerts.payments}
              preWedding={alerts.preWedding}
              activeTab={activeTab}
              onRefresh={handleRefresh}
            />
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
