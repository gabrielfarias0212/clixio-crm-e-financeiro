
import { useState } from "react";
import { MetricsDetailDialog, ContractsDetailContent, RevenueDetailContent, ConversionDetailContent, ProfitDetailContent } from "./MetricsDetailDialog";
import { useBusinessMetrics } from "@/hooks/useBusinessMetrics";
import { FileCheck, BarChart3, TrendingUp, DollarSign } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency } from "./MetricsDetailDialog";

export function BusinessMetrics() {
  const metrics = useBusinessMetrics();

  // Modal state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogContent, setDialogContent] = useState<React.ReactNode | null>(null);

  // Handle list item clicks to show detailed information
  const handleItemClick = (type: 'contracts' | 'revenue' | 'conversion' | 'profit') => {
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

  const metrics_items = [
    {
      type: 'contracts',
      title: 'Contratos Ativos no Ano',
      value: metrics.activeContracts,
      icon: <FileCheck className="h-5 w-5 text-blue-500" />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-100 dark:border-blue-800'
    },
    {
      type: 'revenue',
      title: 'Faturamento Mensal Médio',
      value: formatCurrency(metrics.averageMonthlyRevenue),
      icon: <BarChart3 className="h-5 w-5 text-green-500" />,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      border: 'border-green-100 dark:border-green-800',
      chart: metrics.chartData.some(item => item.value > 0)
    },
    {
      type: 'conversion',
      title: 'Taxa de Conversão',
      value: `${metrics.conversionRate.toFixed(1)}%`,
      icon: <TrendingUp className="h-5 w-5 text-orange-500" />,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      border: 'border-orange-100 dark:border-orange-800',
      progress: metrics.conversionRate
    },
    {
      type: 'profit',
      title: 'Lucro Líquido',
      value: formatCurrency(metrics.netProfit),
      icon: <DollarSign className="h-5 w-5 text-purple-500" />,
      color: `${metrics.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`,
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      border: 'border-purple-100 dark:border-purple-800'
    }
  ];

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-200">
        Indicadores de Desempenho do Negócio ({metrics.currentYear})
      </h2>
      
      <Card className="overflow-hidden border-0 shadow-md bg-white dark:bg-slate-900">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-2">
          <CardTitle className="text-lg font-medium text-gray-700 dark:text-gray-300 flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
            Métricas principais
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {metrics_items.map((item) => (
              <li 
                key={item.type}
                onClick={() => handleItemClick(item.type as 'contracts' | 'revenue' | 'conversion' | 'profit')}
                className={cn(
                  "flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors",
                  item.border
                )}
              >
                <div className="flex items-center space-x-4">
                  <div className={cn("rounded-full p-2", item.bgColor)}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.title}</h3>
                    <p className={cn("text-xl font-bold", item.color)}>{item.value}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {item.chart && (
                    <div className="h-8 w-20 mr-4">
                      <div className="relative h-full">
                        <div className="absolute inset-0 flex items-end space-x-1">
                          {metrics.chartData.slice(-6).map((data, i) => (
                            <div 
                              key={i}
                              className="w-2 bg-green-200 dark:bg-green-900 rounded-t"
                              style={{ 
                                height: `${Math.max(10, (data.value / Math.max(...metrics.chartData.map(d => d.value)) * 100))}%` 
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {item.progress && (
                    <div className="w-20 mr-4">
                      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-500 rounded-full"
                          style={{ width: `${Math.min(item.progress, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-right">{item.progress.toFixed(1)}%</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

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
