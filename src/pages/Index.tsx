
import Layout from "@/components/Layout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useTransactions } from "@/contexts/TransactionsContext";
import { useClients } from "@/contexts/ClientsContext";

export default function Index() {
  const { refreshTransactions } = useTransactions();
  const { refreshClients } = useClients();
  
  useEffect(() => {
    document.title = "Dashboard | Wedding CRM";
    
    // Ensure we have the latest data when the dashboard loads
    refreshTransactions();
    refreshClients();
  }, [refreshTransactions, refreshClients]);
  
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
