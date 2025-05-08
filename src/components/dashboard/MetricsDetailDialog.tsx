
import React from "react";
import { Client } from "@/utils/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

interface MetricsDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: React.ReactNode;
}

export function MetricsDetailDialog({
  isOpen,
  onOpenChange,
  title,
  content,
}: MetricsDetailDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">{content}</div>
      </DialogContent>
    </Dialog>
  );
}

// Helper functions utilizados nos detalhes
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Componentes para os diferentes tipos de detalhes
export function ContractsDetailContent({ 
  clients
}: { 
  clients: Client[] 
}) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Total de contratos ativos iniciados este ano que ainda não foram entregues.
      </p>
      <ScrollArea className="h-[300px]">
        <div className="space-y-2">
          {clients.length > 0 ? (
            clients.map((client: Client) => (
              <div key={client.id} className="p-3 border rounded-md">
                <p className="font-medium">{client.name}</p>
                <p className="text-sm text-muted-foreground">Status: {client.status}</p>
                {client.contractValue && (
                  <p className="text-sm">Valor: {formatCurrency(client.contractValue)}</p>
                )}
              </div>
            ))
          ) : (
            <p>Nenhum contrato ativo no período.</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export function RevenueDetailContent({ 
  chartData, 
  revenueMonths, 
  totalRevenue 
}: { 
  chartData: Array<{month: number, value: number}>, 
  revenueMonths: Array<{month: number, amount: number}>,
  totalRevenue: number
}) {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Média mensal calculada com base nos meses já transcorridos do ano.
      </p>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="month" />
            <YAxis hide />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Faturamento']}
              labelFormatter={(label) => `Mês ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#22c55e" 
              strokeWidth={2}
              dot={{ stroke: '#22c55e', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#22c55e', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="space-y-3">
        <p className="font-medium">Faturamento por mês:</p>
        <div className="space-y-2">
          {revenueMonths.length > 0 ? (
            revenueMonths.map(({month, amount}) => (
              <div key={month} className="flex justify-between items-center">
                <span>{monthNames[month]}</span>
                <span className="font-medium">{formatCurrency(amount)}</span>
              </div>
            ))
          ) : (
            <p>Nenhum faturamento registrado no período.</p>
          )}
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <div className="pt-2">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total do Ano:</span>
          <span className="font-bold text-green-600 dark:text-green-400">
            {formatCurrency(totalRevenue)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ConversionDetailContent({
  totalLeads,
  closedContracts,
  conversionRate
}: {
  totalLeads: number,
  closedContracts: number,
  conversionRate: number
}) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Porcentagem de leads que foram convertidos em contratos fechados.
      </p>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded-md text-center">
          <p className="text-sm text-muted-foreground">Total de Leads</p>
          <p className="text-2xl font-bold">{totalLeads}</p>
        </div>
        
        <div className="p-4 border rounded-md text-center">
          <p className="text-sm text-muted-foreground">Contratos Fechados</p>
          <p className="text-2xl font-bold">{closedContracts}</p>
        </div>
      </div>
      
      <div className="pt-4">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-orange-500" 
            style={{ width: `${Math.min(conversionRate, 100).toFixed(1)}%` }}
          ></div>
        </div>
        <p className="mt-2 text-center font-medium">
          Taxa de Conversão: {conversionRate.toFixed(1)}%
        </p>
      </div>
      
      <Separator className="my-4" />
      
      <div>
        <p className="text-sm text-muted-foreground">
          Uma taxa de conversão saudável para fotógrafos de casamento está entre 30-50%. 
          {conversionRate >= 30 
            ? " Sua taxa de conversão está dentro ou acima do esperado."
            : " Considere revisar sua estratégia de vendas para melhorar este indicador."
          }
        </p>
      </div>
    </div>
  );
}

export function ProfitDetailContent({
  totalRevenue,
  totalExpenses,
  netProfit
}: {
  totalRevenue: number,
  totalExpenses: number,
  netProfit: number
}) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Diferença entre receitas e despesas no período.
      </p>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded-md text-center">
          <p className="text-sm text-muted-foreground">Receitas</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-500">{formatCurrency(totalRevenue)}</p>
        </div>
        
        <div className="p-4 border rounded-md text-center">
          <p className="text-sm text-muted-foreground">Despesas</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-500">{formatCurrency(totalExpenses)}</p>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <div className="pt-2">
        <div className="flex justify-between items-center">
          <span className="font-medium">Lucro Líquido:</span>
          <span className={`font-bold text-xl ${netProfit >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
            {formatCurrency(netProfit)}
          </span>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">
            {netProfit >= 0 
              ? "Seu negócio está gerando lucro. Considere reinvestir ou planejar crescimento."
              : "Atenção: Suas despesas estão superando as receitas. Revise seus gastos e estratégias de precificação."
            }
          </p>
        </div>
      </div>
    </div>
  );
}
