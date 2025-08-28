import React, { useMemo, useState } from "react";
import { Client } from "@/utils/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Facebook, Instagram, Users, Globe, Phone, Mail, MessageCircle, HelpCircle } from "lucide-react";
import { LeadOriginDetailDialog } from "./LeadOriginDetailDialog";

interface LeadOriginsProps {
  clients: Client[];
}

export function LeadOrigins({ clients }: LeadOriginsProps) {
  const [selectedOrigin, setSelectedOrigin] = useState<string | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const originStats = useMemo(() => {
    // Get icon for each origin type
    const getOriginIcon = (originName: string) => {
      switch (originName.toLowerCase()) {
        case "facebook":
          return { icon: Facebook, color: "text-blue-600", bgColor: "bg-blue-50" };
        case "instagram":
          return { icon: Instagram, color: "text-pink-600", bgColor: "bg-pink-50" };
        case "indicações":
          return { icon: Users, color: "text-green-600", bgColor: "bg-green-50" };
        case "website":
          return { icon: Globe, color: "text-purple-600", bgColor: "bg-purple-50" };
        case "telefone":
          return { icon: Phone, color: "text-orange-600", bgColor: "bg-orange-50" };
        case "e-mail":
          return { icon: Mail, color: "text-gray-600", bgColor: "bg-gray-50" };
        case "whatsapp":
          return { icon: MessageCircle, color: "text-green-600", bgColor: "bg-green-50" };
        default:
          return { icon: HelpCircle, color: "text-gray-600", bgColor: "bg-gray-50" };
      }
    };

    // Count actual clients by lead source
    const originCounts = clients.reduce((acc, client) => {
      const source = (client as any).leadSource || "Não informado";
      if (!acc[source]) {
        acc[source] = {
          count: 0,
          closedDeals: 0
        };
      }
      acc[source].count++;
      
      // Count closed deals
      if (client.salesFunnelStage === "contrato_fechado" || client.status === "fechado") {
        acc[source].closedDeals++;
      }
      
      return acc;
    }, {} as Record<string, { count: number; closedDeals: number }>);

    const total = clients.length;
    
    // Create stats for each origin with actual data
    const stats = Object.entries(originCounts).map(([originName, data]) => {
      const { icon, color, bgColor } = getOriginIcon(originName);
      const percentage = total > 0 ? (data.count / total) * 100 : 0;
      const conversionRate = data.count > 0 ? (data.closedDeals / data.count) * 100 : 0;

      return {
        name: originName,
        icon,
        color,
        bgColor,
        count: data.count,
        percentage,
        conversionRate,
        closedDeals: data.closedDeals
      };
    });

    return stats.sort((a, b) => b.count - a.count);
  }, [clients]);

  const handleOriginClick = (originName: string) => {
    setSelectedOrigin(originName);
    setIsDetailDialogOpen(true);
  };

  const totalLeads = clients.length;
  const totalClosed = clients.filter(c => 
    c.salesFunnelStage === "contrato_fechado" || c.status === "fechado"
  ).length;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Origem dos Leads</h2>
          <Badge variant="outline" className="text-sm">
            {totalLeads} leads totais
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {originStats.map((origin) => {
            const Icon = origin.icon;
            return (
              <Card 
                key={origin.name} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleOriginClick(origin.name)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${origin.bgColor}`}>
                      <Icon className={`h-5 w-5 ${origin.color}`} />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {origin.count} leads
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-semibold">
                    {origin.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Participação</span>
                      <span className="font-medium">{origin.percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={origin.percentage} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {origin.closedDeals}
                      </div>
                      <div className="text-xs text-muted-foreground">Fechados</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {origin.conversionRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Conversão</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Overall Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {totalLeads}
                </div>
                <div className="text-sm text-muted-foreground">Total de Leads</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {totalClosed}
                </div>
                <div className="text-sm text-muted-foreground">Contratos Fechados</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {totalLeads > 0 ? ((totalClosed / totalLeads) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Taxa Geral</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {originStats.length}
                </div>
                <div className="text-sm text-muted-foreground">Canais Ativos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <LeadOriginDetailDialog
        isOpen={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
        originName={selectedOrigin || ""}
        clients={clients}
      />
    </>
  );
}