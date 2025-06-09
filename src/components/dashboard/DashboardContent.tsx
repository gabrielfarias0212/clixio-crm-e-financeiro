
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

export function DashboardContent() {
  const { clients, loading } = useClients();

  return (
    <div className="space-y-8">
      <DashboardStats />

      {/* Seção de Indicadores de Desempenho do Negócio - movida para cima */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <BusinessMetrics />
        <ProductionIndicators />
      </div>

      {/* Seção: Visão Estratégica de Contratos e Eventos Futuros */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Visão Estratégica - Contratos e Eventos Futuros</h2>
          <FutureContractsOverview />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ContractProjections />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <AlertsReminders clients={clients} />
      </div>

      <div className="grid grid-cols-1 gap-8">
        <FinancialSummary />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <UpcomingEvents clients={clients} loading={loading} />
        <EventCategoryChart />
      </div>
    </div>
  );
}
