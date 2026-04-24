import { useState } from "react";
import { MetricsDetailDialog, ContractsDetailContent, RevenueDetailContent, ConversionDetailContent, ProfitDetailContent, formatCurrency } from "./MetricsDetailDialog";
import { useBusinessMetrics } from "@/hooks/useBusinessMetrics";
import { FileCheck, BarChart3, TrendingUp, DollarSign, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function BusinessMetrics() {
  const metrics = useBusinessMetrics();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogContent, setDialogContent] = useState<React.ReactNode | null>(null);

  const handleItemClick = (type: 'contracts' | 'revenue' | 'conversion' | 'profit') => {
    const map = {
      contracts: {
        title: `Contratos Ativos no Ano (${metrics.currentYear})`,
        content: <ContractsDetailContent clients={metrics.activeContractsData} />,
      },
      revenue: {
        title: `Média de Faturamento Mensal (${metrics.currentYear})`,
        content: <RevenueDetailContent chartData={metrics.chartData} revenueMonths={metrics.revenueMonths} totalRevenue={metrics.totalRevenue} />,
      },
      conversion: {
        title: `Taxa de Conversão (${metrics.currentYear})`,
        content: <ConversionDetailContent totalLeads={metrics.totalLeadsData.length} closedContracts={metrics.closedContractsData.length} conversionRate={metrics.conversionRate} />,
      },
      profit: {
        title: `Lucro Líquido (${metrics.currentYear})`,
        content: <ProfitDetailContent totalRevenue={metrics.totalRevenue} totalExpenses={metrics.totalExpenses} netProfit={metrics.netProfit} />,
      },
    };
    setDialogTitle(map[type].title);
    setDialogContent(map[type].content);
    setIsDialogOpen(true);
  };

  const items = [
    {
      type: "contracts" as const,
      label: "Contratos Ativos no Ano",
      value: String(metrics.activeContracts),
      icon: FileCheck,
      valueColor: "text-stone-900",
      extra: null,
    },
    {
      type: "revenue" as const,
      label: "Faturamento Mensal Médio",
      value: formatCurrency(metrics.averageMonthlyRevenue),
      icon: BarChart3,
      valueColor: "text-stone-900",
      extra: metrics.chartData.some(d => d.value > 0) ? (
        <div className="flex items-end gap-0.5 h-7 w-16">
          {metrics.chartData.slice(-6).map((d, i) => {
            const max = Math.max(...metrics.chartData.map(x => x.value));
            return (
              <div
                key={i}
                className="flex-1 bg-stone-200 rounded-sm"
                style={{ height: `${Math.max(15, max ? (d.value / max) * 100 : 15)}%` }}
              />
            );
          })}
        </div>
      ) : null,
    },
    {
      type: "conversion" as const,
      label: "Taxa de Conversão",
      value: `${metrics.conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      valueColor: "text-stone-900",
      extra: (
        <div className="w-16">
          <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-stone-400 rounded-full"
              style={{ width: `${Math.min(metrics.conversionRate, 100)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      type: "profit" as const,
      label: "Lucro Líquido",
      value: formatCurrency(metrics.netProfit),
      icon: DollarSign,
      valueColor: metrics.netProfit >= 0 ? "text-green-600" : "text-red-500",
      extra: null,
    },
  ];

  return (
    <div className="w-full">
      <p className="text-[10px] font-medium tracking-widest uppercase text-stone-400 mb-3">
        Indicadores de Desempenho ({metrics.currentYear})
      </p>

      <Card className="rounded-xl border-stone-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <ul className="divide-y divide-stone-100">
            {items.map(({ type, label, value, icon: Icon, valueColor, extra }) => (
              <li
                key={type}
                onClick={() => handleItemClick(type)}
                className="flex items-center justify-between px-5 py-4 hover:bg-stone-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon size={14} strokeWidth={1.5} className="text-stone-400 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] text-stone-400 mb-0.5">{label}</p>
                    <p className={cn("font-mono text-lg font-medium leading-none tracking-tight", valueColor)}>
                      {value}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {extra}
                  <ChevronRight size={13} className="text-stone-300" />
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <MetricsDetailDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={dialogTitle}
        content={dialogContent}
      />
    </div>
  );
}
