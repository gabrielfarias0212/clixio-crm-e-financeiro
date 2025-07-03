
import { useBusinessMetrics } from "@/hooks/useBusinessMetrics";
import { FileCheck, BarChart3, TrendingUp, Users } from "lucide-react";

export function CleanProductionSection() {
  const metrics = useBusinessMetrics();

  const productionMetrics = [
    {
      icon: <FileCheck className="h-5 w-5 text-blue-600" />,
      label: "Contratos Ativos",
      value: metrics.activeContracts,
      subtitle: "no ano atual",
      color: "bg-blue-50"
    },
    {
      icon: <BarChart3 className="h-5 w-5 text-green-600" />,
      label: "Faturamento Médio",
      value: `R$ ${(metrics.averageMonthlyRevenue / 1000).toFixed(0)}k`,
      subtitle: "por mês",
      color: "bg-green-50"
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-orange-600" />,
      label: "Taxa de Conversão",
      value: `${metrics.conversionRate.toFixed(1)}%`,
      subtitle: "leads para contratos",
      color: "bg-orange-50"
    },
    {
      icon: <Users className="h-5 w-5 text-purple-600" />,
      label: "Leads Totais",
      value: metrics.totalLeadsData.length,
      subtitle: "no ano atual",
      color: "bg-purple-50"
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Indicadores de Performance</h2>
        <p className="text-sm text-gray-500 mt-1">Métricas de produtividade e crescimento</p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {productionMetrics.map((metric, index) => (
            <div key={index} className="text-center">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-3 ${metric.color}`}>
                {metric.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
              <p className="text-sm font-medium text-gray-700">{metric.label}</p>
              <p className="text-xs text-gray-500 mt-1">{metric.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
