
import { useState } from "react";
import { MetricsDisplay } from "./MetricsDisplay";
import { MetricsDetailDialog, ContractsDetailContent, RevenueDetailContent, ConversionDetailContent, ProfitDetailContent } from "./MetricsDetailDialog";
import { useBusinessMetrics } from "@/hooks/useBusinessMetrics";

export function BusinessMetrics() {
  const metrics = useBusinessMetrics();

  // Modal state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogContent, setDialogContent] = useState<React.ReactNode | null>(null);

  // Handle card clicks to show detailed information
  const handleCardClick = (type: 'contracts' | 'revenue' | 'conversion' | 'profit') => {
    let title = "";
    let content: React.ReactNode = null;

    switch (type) {
      case 'contracts':
        title = `Contratos Ativos no Ano (${metrics.currentYear})`;
        content = <ContractsDetailContent clients={metrics.activeContractsData} />;
        break;
        
      case 'revenue':
        title = `Média de Faturamento Mensal (${metrics.currentYear})`;
        content = <RevenueDetailContent 
                    chartData={metrics.chartData} 
                    revenueMonths={metrics.revenueMonths} 
                    totalRevenue={metrics.totalRevenue} 
                  />;
        break;
        
      case 'conversion':
        title = `Taxa de Conversão (${metrics.currentYear})`;
        content = <ConversionDetailContent 
                    totalLeads={metrics.totalLeadsData.length} 
                    closedContracts={metrics.closedContractsData.length}
                    conversionRate={metrics.conversionRate}
                  />;
        break;
        
      case 'profit':
        title = `Lucro Líquido (${metrics.currentYear})`;
        content = <ProfitDetailContent 
                    totalRevenue={metrics.totalRevenue}
                    totalExpenses={metrics.totalExpenses}
                    netProfit={metrics.netProfit}
                  />;
        break;
    }

    setDialogTitle(title);
    setDialogContent(content);
    setIsDialogOpen(true);
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-200">
        Indicadores de Desempenho do Negócio ({metrics.currentYear})
      </h2>
      
      <MetricsDisplay onCardClick={handleCardClick} />

      {/* Modal para exibição de informações detalhadas */}
      <MetricsDetailDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={dialogTitle}
        content={dialogContent}
      />
    </div>
  );
}
