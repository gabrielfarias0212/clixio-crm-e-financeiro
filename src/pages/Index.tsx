
import Layout from "@/components/Layout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useTransactions } from "@/contexts/TransactionsContext";
import { useClients } from "@/contexts/ClientsContext";

export default function Index() {
  const { refreshTransactions } = useTransactions();
  const { refreshClients } = useClients();
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  
  useEffect(() => {
    document.title = "Dashboard | Wedding CRM";
    
    // Load initial data only once when the dashboard is first loaded
    const loadData = async () => {
      if (initialDataLoaded) return;
      
      try {
        console.log("Dashboard page: Loading initial data");
        await Promise.all([
          refreshTransactions(),
          refreshClients()
        ]);
        console.log("Dashboard data refreshed successfully");
        setInitialDataLoaded(true);
      } catch (error) {
        console.error("Error refreshing dashboard data:", error);
      }
    };
    
    loadData();
    // We intentionally only want this to run once on component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <Layout>
      <div className="max-w-screen-2xl mx-auto px-4 py-8 space-y-8 animate-fade-in bg-background">
        <DashboardHeader />
        <DashboardContent />
        <Toaster />
        <Sonner />
      </div>
    </Layout>
  );
}
