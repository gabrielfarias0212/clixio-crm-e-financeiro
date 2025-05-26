
import { FinancialMetricsCards } from "./FinancialMetricsCards";
import { ProjectionsChart } from "./ProjectionsChart";
import { PaymentAlerts } from "./PaymentAlerts";
import { useAdvancedFinancialData } from "@/hooks/useAdvancedFinancialData";
import { Skeleton } from "@/components/ui/skeleton";

export function AdvancedCashFlowDashboard() {
  const { metrics, projections, allPayments } = useAdvancedFinancialData();

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <FinancialMetricsCards metrics={metrics} />
      
      {/* Gráfico de Projeções e Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProjectionsChart projections={projections} />
        <PaymentAlerts payments={allPayments} />
      </div>
    </div>
  );
}
