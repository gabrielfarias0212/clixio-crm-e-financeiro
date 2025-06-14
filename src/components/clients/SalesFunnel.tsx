
import React from "react";
import { Client, SalesFunnelStage } from "@/utils/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Send, MessageCircle, FileCheck, Archive } from "lucide-react";

interface SalesFunnelProps {
  clients: Client[];
}

const funnelStages: Array<{
  key: SalesFunnelStage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}> = [
  {
    key: "primeiro_contato",
    label: "Primeiro Contato",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-100"
  },
  {
    key: "orcamento_enviado",
    label: "Orçamento Enviado",
    icon: Send,
    color: "text-orange-600",
    bgColor: "bg-orange-100"
  },
  {
    key: "negociacao",
    label: "Negociação",
    icon: MessageCircle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100"
  },
  {
    key: "contrato_fechado",
    label: "Contrato Fechado",
    icon: FileCheck,
    color: "text-green-600",
    bgColor: "bg-green-100"
  },
  {
    key: "projeto_finalizado",
    label: "Projeto Finalizado",
    icon: Archive,
    color: "text-gray-600",
    bgColor: "bg-gray-100"
  }
];

export function SalesFunnel({ clients }: SalesFunnelProps) {
  const getClientsInStage = (stage: SalesFunnelStage) => {
    return clients.filter(client => client.salesFunnelStage === stage);
  };

  const getTotalValue = (clientsInStage: Client[]) => {
    return clientsInStage.reduce((total, client) => total + (client.contractValue || 0), 0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Funil de Vendas</h2>
        <Badge variant="outline" className="text-sm">
          {clients.length} clientes totais
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {funnelStages.map((stage) => {
          const clientsInStage = getClientsInStage(stage.key);
          const totalValue = getTotalValue(clientsInStage);
          const Icon = stage.icon;
          
          return (
            <Card key={stage.key} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${stage.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stage.color}`} />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {clientsInStage.length}
                  </Badge>
                </div>
                <CardTitle className="text-sm font-medium text-gray-900">
                  {stage.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalValue)}
                  </div>
                  {clientsInStage.length > 0 && (
                    <div className="space-y-1">
                      {clientsInStage.slice(0, 3).map((client) => (
                        <div key={client.id} className="text-xs text-gray-600 truncate">
                          {client.name} - {formatCurrency(client.contractValue)}
                        </div>
                      ))}
                      {clientsInStage.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{clientsInStage.length - 3} outros
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Conversion Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Métricas de Conversão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {((getClientsInStage("orcamento_enviado").length / Math.max(getClientsInStage("primeiro_contato").length, 1)) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Taxa de Orçamento</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {((getClientsInStage("negociacao").length / Math.max(getClientsInStage("orcamento_enviado").length, 1)) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Taxa de Negociação</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {((getClientsInStage("contrato_fechado").length / Math.max(getClientsInStage("negociacao").length, 1)) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Taxa de Fechamento</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {((getClientsInStage("projeto_finalizado").length / Math.max(getClientsInStage("contrato_fechado").length, 1)) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Taxa de Finalização</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
