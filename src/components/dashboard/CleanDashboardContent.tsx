
import { DashboardStats } from "./DashboardStats";
import { CleanFinancialSummary } from "./CleanFinancialSummary";
import { CleanAlertsSection } from "./CleanAlertsSection";
import { CleanProductionSection } from "./CleanProductionSection";
import { CleanUpcomingEvents } from "./CleanUpcomingEvents";
import { useClients } from "@/contexts/ClientsContext";
import { Suspense } from "react";

const ComponentSkeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
);

export function CleanDashboardContent() {
  const { clients, loading } = useClients();

  return (
    <div className="space-y-8">
      {/* Main Stats - Top Priority */}
      <Suspense fallback={<ComponentSkeleton className="h-32" />}>
        <DashboardStats />
      </Suspense>

      {/* Financial Overview - Single Clean Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Resumo Financeiro</h2>
          <p className="text-sm text-gray-500 mt-1">Visão geral das movimentações financeiras</p>
        </div>
        <Suspense fallback={<ComponentSkeleton className="h-64" />}>
          <CleanFinancialSummary />
        </Suspense>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Alerts & Reminders - Priority Section */}
        <div className="lg:col-span-2">
          <Suspense fallback={<ComponentSkeleton className="h-64" />}>
            <CleanAlertsSection clients={clients} />
          </Suspense>
        </div>

        {/* Upcoming Events - Side Panel */}
        <div className="lg:col-span-1">
          <Suspense fallback={<ComponentSkeleton className="h-64" />}>
            <CleanUpcomingEvents clients={clients} loading={loading} />
          </Suspense>
        </div>
      </div>

      {/* Production Indicators - Bottom Section */}
      <Suspense fallback={<ComponentSkeleton className="h-48" />}>
        <CleanProductionSection />
      </Suspense>
    </div>
  );
}
