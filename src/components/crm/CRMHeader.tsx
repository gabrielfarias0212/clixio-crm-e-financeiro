import React, { useMemo } from "react";
import { Client } from "@/utils/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, MessageCircle, CheckCircle, XCircle, Archive } from "lucide-react";

interface CRMHeaderProps {
  clients: Client[];
}

export function CRMHeader({ clients }: CRMHeaderProps) {
  const stats = useMemo(() => {
    // Filter out workflow projects (leadSource === "Projeto Direto") from CRM stats
    const crmClients = clients.filter(c => c.leadSource !== "Projeto Direto");
    
    const opportunities = crmClients.filter(c => 
      ["primeiro_contato", "orcamento_enviado", "negociacao"].includes(c.salesFunnelStage || c.status)
    ).length;
    
    const inContact = crmClients.filter(c => 
      c.salesFunnelStage === "primeiro_contato" || c.status === "primeiro_contato"
    ).length;
    
    const closed = crmClients.filter(c => 
      c.salesFunnelStage === "contrato_fechado" || c.status === "fechado"
    ).length;
    
    const lost = crmClients.filter(c => 
      c.salesFunnelStage === "contrato_perdido" || c.status === "contrato_perdido"
    ).length;
    
    const finished = crmClients.filter(c => 
      c.salesFunnelStage === "projeto_finalizado" || c.status === "projeto_finalizado"
    ).length;

    const totalValue = crmClients
      .filter(c => c.salesFunnelStage === "contrato_fechado" || c.status === "fechado")
      .reduce((total, client) => total + (client.contractValue || 0), 0);

    const pipelineValue = crmClients
      .filter(c => ["primeiro_contato", "orcamento_enviado", "negociacao"].includes(c.salesFunnelStage || c.status))
      .reduce((total, client) => total + (client.contractValue || 0), 0);

    const conversionRate = opportunities > 0 ? ((closed / (opportunities + closed + lost)) * 100) : 0;

    return {
      opportunities,
      inContact,
      closed,
      lost,
      finished,
      totalValue,
      pipelineValue,
      conversionRate
    };
  }, [clients]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const statCards = [
    {
      title: "Oportunidades",
      value: stats.opportunities,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: formatCurrency(stats.pipelineValue)
    },
    {
      title: "Em Contato",
      value: stats.inContact,
      icon: MessageCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "primeiros contatos"
    },
    {
      title: "Fechados",
      value: stats.closed,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: formatCurrency(stats.totalValue)
    },
    {
      title: "Perdidos",
      value: stats.lost,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      description: "não convertidos"
    },
    {
      title: "Conversão",
      value: `${stats.conversionRate.toFixed(1)}%`,
      icon: stats.conversionRate >= 20 ? TrendingUp : TrendingDown,
      color: stats.conversionRate >= 20 ? "text-green-600" : "text-red-600",
      bgColor: stats.conversionRate >= 20 ? "bg-green-50" : "bg-red-50",
      description: "taxa de sucesso"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="relative overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}