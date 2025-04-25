
import Layout from "@/components/Layout";
import { FinancialSummary } from "@/components/dashboard/FinancialSummary";
import { ContractDistribution } from "@/components/dashboard/ContractDistribution";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { UpcomingEvents } from "@/components/UpcomingEvents";
import { useClients } from "@/contexts/ClientsContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Index() {
  const { clients, loading } = useClients();

  useEffect(() => {
    document.title = "Dashboard | Wedding CRM";
  }, []);

  return (
    <Layout>
      <div className="max-w-screen-2xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Dashboard</h1>
          <Link to="/clients/add">
            <Button>Adicionar Novo Cliente</Button>
          </Link>
        </div>

        <DashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <FinancialSummary />
          <ContractDistribution />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <UpcomingEvents clients={clients} loading={loading} />
        </div>
      </div>
    </Layout>
  );
}
