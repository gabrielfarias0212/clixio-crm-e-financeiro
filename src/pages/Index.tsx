
import Layout from "@/components/Layout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { useEffect } from "react";

export default function Index() {
  useEffect(() => {
    document.title = "Dashboard | Wedding CRM";
  }, []);

  return (
    <Layout>
      <div className="max-w-screen-2xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
        <DashboardHeader />
        <DashboardContent />
      </div>
    </Layout>
  );
}
