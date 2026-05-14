import Layout from "@/components/Layout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useClients } from "@/contexts/ClientsContext";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function Index() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  return <AuthenticatedDashboard />;
}

function AuthenticatedDashboard() {
  const { refreshClients, loading: clientsLoading } = useClients();
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);

  const isLoading = useMemo(
    () => !initialDataLoaded && clientsLoading,
    [clientsLoading, initialDataLoaded]
  );

  const loadInitialData = useCallback(async () => {
    if (initialDataLoaded) return;
    try {
      setDataLoadError(null);
      const startTime = performance.now();
      await refreshClients();
      setInitialDataLoaded(true);
      console.log(`Dashboard: carregado em ${Math.round(performance.now() - startTime)}ms`);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
      setDataLoadError("Erro ao carregar dados. Tente recarregar a página.");
    }
  }, [initialDataLoaded, refreshClients]);

  useEffect(() => {
    document.title = "Dashboard | Clixio";
    loadInitialData();
  }, [loadInitialData]);

  if (dataLoadError) {
    return (
      <Layout>
        <div className="px-6 py-10 text-center">
          <h2 className="text-base font-medium text-stone-900 mb-1">
            Erro ao carregar dashboard
          </h2>
          <p className="text-sm text-stone-400 mb-4">{dataLoadError}</p>
          <button
            onClick={() => {
              setInitialDataLoaded(false);
              setDataLoadError(null);
              loadInitialData();
            }}
            className="px-4 py-2 text-sm bg-stone-900 text-white rounded-lg hover:bg-stone-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
        <Toaster />
        <Sonner />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-screen-2xl mx-auto px-3 py-4 md:px-6 md:py-8 space-y-8">
        <DashboardHeader />

        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-stone-100 rounded-xl animate-pulse" />
              ))}
            </div>
            <div className="h-64 bg-stone-100 rounded-xl animate-pulse" />
          </div>
        ) : (
          <DashboardContent />
        )}

        <Toaster />
        <Sonner />
      </div>
    </Layout>
  );
}
