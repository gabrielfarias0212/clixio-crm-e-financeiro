
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertsTabContent } from "./AlertsTabContent";
import { useAlerts } from "@/hooks/useAlerts";
import { Client } from "@/utils/types";
import { Bell, DollarSign, Camera, Edit, Package } from "lucide-react";

interface AlertsRemindersProps {
  clients?: Client[];
}

export function AlertsReminders({ clients = [] }: AlertsRemindersProps) {
  const [activeTab, setActiveTab] = useState("all");
  const alerts = useAlerts(clients);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">
          Alertas e Lembretes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="all" className="relative">
              Todos
              <Badge
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
                variant="destructive"
              >
                {alerts.editTasks.length + alerts.deliverTasks.length + alerts.payments.length + alerts.preWedding.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="edit" className="relative">
              <Edit className="h-4 w-4 mr-1" />
              Editar
              {alerts.editTasks.length > 0 && (
                <Badge
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
                  variant="destructive"
                >
                  {alerts.editTasks.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="deliver" className="relative">
              <Package className="h-4 w-4 mr-1" />
              Entregar
              {alerts.deliverTasks.length > 0 && (
                <Badge
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
                  variant="destructive"
                >
                  {alerts.deliverTasks.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="payments" className="relative">
              <DollarSign className="h-4 w-4 mr-1" />
              Pagamentos
              {alerts.payments.length > 0 && (
                <Badge
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
                  variant="destructive"
                >
                  {alerts.payments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="preWedding" className="relative">
              <Camera className="h-4 w-4 mr-1" />
              Pré-Wedding
              {alerts.preWedding.length > 0 && (
                <Badge
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
                  variant="destructive"
                >
                  {alerts.preWedding.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <AlertsTabContent
            editTasks={alerts.editTasks}
            deliverTasks={alerts.deliverTasks}
            payments={alerts.payments}
            preWedding={alerts.preWedding}
            activeTab={activeTab}
          />
        </Tabs>
      </CardContent>
    </Card>
  );
}
