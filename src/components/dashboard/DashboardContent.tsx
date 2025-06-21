
import { DashboardStats } from "./DashboardStats";
import { FinancialSummary } from "./FinancialSummary";
import { UpcomingEvents } from "@/components/UpcomingEvents";
import { EventCategoryChart } from "./EventCategoryChart";
import { useClients } from "@/contexts/ClientsContext";
import { BusinessMetrics } from "./BusinessMetrics";
import { ProductionIndicators } from "./ProductionIndicators";
import { AlertsReminders } from "./AlertsReminders";
import { FutureContractsOverview } from "./FutureContractsOverview";
import { ContractProjections } from "./ContractProjections";
import { Suspense } from "react";

// Skeleton components para lazy loading
const ComponentSkeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

export function DashboardContent() {
  const { clients, loading } = useClients();

  return (
    <div className="space-y-8">
      {/* Estatísticas principais - prioridade alta */}
      <Suspense fallback={<ComponentSkeleton className="h-32" />}>
        <DashboardStats />
      </Suspense>

      {/* Métricas de negócio - carregamento otimizado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Suspense fallback={<ComponentSkeleton className="h-64" />}>
          <BusinessMetrics />
        </Suspense>
        <Suspense fallback={<ComponentSkeleton className="h-64" />}>
          <ProductionIndicators />
        </Suspense>
      </div>

      {/* Seção de contratos futuros - lazy load */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Visão Estratégica - Contratos e Eventos Futuros</h2>
          <Suspense fallback={<ComponentSkeleton className="h-48" />}>
            <FutureContractsOverview />
          </Suspense>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Suspense fallback={<ComponentSkeleton className="h-64" />}>
              <ContractProjections />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Alertas e lembretes - lazy load após dados de clientes */}
      <div className="grid grid-cols-1 gap-8">
        <Suspense fallback={<ComponentSkeleton className="h-48" />}>
          <AlertsReminders clients={clients} />
        </Suspense>
      </div>

      {/* Resumo financeiro - lazy load */}
      <div className="grid grid-cols-1 gap-8">
        <Suspense fallback={<ComponentSkeleton className="h-64" />}>
          <FinancialSummary />
        </Suspense>
      </div>

      {/* Eventos e gráficos - menor prioridade */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Suspense fallback={<ComponentSkeleton className="h-64" />}>
          <UpcomingEvents clients={clients} loading={loading} />
        </Suspense>
        <Suspense fallback={<ComponentSkeleton className="h-64" />}>
          <EventCategoryChart />
        </Suspense>
      </div>
    </div>
  );
}
