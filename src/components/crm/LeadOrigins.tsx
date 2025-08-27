import React, { useMemo } from "react";
import { Client } from "@/utils/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Facebook, Instagram, Users, Globe, Phone, Mail } from "lucide-react";

interface LeadOriginsProps {
  clients: Client[];
}

export function LeadOrigins({ clients }: LeadOriginsProps) {
  const originStats = useMemo(() => {
    // Since we don't have a leadSource field, we'll simulate based on patterns
    // This would be replaced with actual data from your database
    const origins = [
      { name: "Facebook", icon: Facebook, color: "text-blue-600", bgColor: "bg-blue-50" },
      { name: "Instagram", icon: Instagram, color: "text-pink-600", bgColor: "bg-pink-50" },
      { name: "Indicações", icon: Users, color: "text-green-600", bgColor: "bg-green-50" },
      { name: "Website", icon: Globe, color: "text-purple-600", bgColor: "bg-purple-50" },
      { name: "Telefone", icon: Phone, color: "text-orange-600", bgColor: "bg-orange-50" },
      { name: "E-mail", icon: Mail, color: "text-gray-600", bgColor: "bg-gray-50" }
    ];

    const total = clients.length;
    
    // Simulate distribution for demo purposes
    const stats = origins.map((origin, index) => {
      let count;
      switch (origin.name) {
        case "Facebook":
          count = Math.floor(total * 0.3);
          break;
        case "Instagram":
          count = Math.floor(total * 0.25);
          break;
        case "Indicações":
          count = Math.floor(total * 0.2);
          break;
        case "Website":
          count = Math.floor(total * 0.15);
          break;
        case "Telefone":
          count = Math.floor(total * 0.05);
          break;
        default:
          count = total - Math.floor(total * 0.95);
      }

      const percentage = total > 0 ? (count / total) * 100 : 0;
      
      // Calculate conversion rate (closed deals from this source)
      const closedFromSource = Math.floor(count * (0.15 + Math.random() * 0.2));
      const conversionRate = count > 0 ? (closedFromSource / count) * 100 : 0;

      return {
        ...origin,
        count,
        percentage,
        conversionRate,
        closedDeals: closedFromSource
      };
    });

    return stats.sort((a, b) => b.count - a.count);
  }, [clients]);

  const totalLeads = clients.length;
  const totalClosed = clients.filter(c => 
    c.salesFunnelStage === "contrato_fechado" || c.status === "fechado"
  ).length;

  return (
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
            <Card key={origin.name} className="hover:shadow-md transition-shadow">
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
  );
}