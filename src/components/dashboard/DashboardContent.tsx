
import { DashboardStats } from "./DashboardStats";
import { FinancialSummary } from "./FinancialSummary";
import { UpcomingEvents } from "@/components/UpcomingEvents";
import { EventCategoryChart } from "./EventCategoryChart";
import { useClients } from "@/contexts/ClientsContext";
import { BusinessMetrics } from "./BusinessMetrics";
import { ProductionIndicators } from "./ProductionIndicators";
import { AlertsReminders } from "./AlertsReminders";

export function DashboardContent() {
  const { clients, loading } = useClients();

  return (
    <div className="space-y-8">
      <DashboardStats />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <BusinessMetrics />
        <ProductionIndicators />
      </div>

      <div className="grid grid-cols-1 gap-8">
        <AlertsReminders />
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
