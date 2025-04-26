
import { DashboardStats } from "./DashboardStats";
import { FinancialSummary } from "./FinancialSummary";
import { ContractDistribution } from "./ContractDistribution";
import { UpcomingEvents } from "@/components/UpcomingEvents";
import { useClients } from "@/contexts/ClientsContext";

export function DashboardContent() {
  const { clients, loading } = useClients();

  return (
    <div className="space-y-8">
      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FinancialSummary />
        <ContractDistribution />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <UpcomingEvents clients={clients} loading={loading} />
      </div>
    </div>
  );
}
