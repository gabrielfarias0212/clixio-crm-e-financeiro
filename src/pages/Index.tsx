
import Layout from "@/components/Layout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useTransactions } from "@/contexts/TransactionsContext";
import { useClients } from "@/contexts/ClientsContext";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function Index() {
  const { user } = useAuth();
  
  // Se o usuário não está autenticado, redirecionar para login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <AuthenticatedDashboard />;
}

function AuthenticatedDashboard() {
  const { refreshTransactions, loading: transactionsLoading } = useTransactions();
  const { refreshClients, loading: clientsLoading } = useClients();
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);
  
  // Loading otimizado - permitir carregamento parcial
  const isLoading = useMemo(() => 
    !initialDataLoaded && (transactionsLoading || clientsLoading),
    [transactionsLoading, clientsLoading, initialDataLoaded]
  );

  // Função otimizada para carregar dados com priorização
  const loadInitialData = useCallback(async () => {
    if (initialDataLoaded) return;
    
    try {
      console.log("Dashboard: Iniciando carregamento otimizado...");
      setDataLoadError(null);
      
      const startTime = performance.now();
      
      // Carregar dados críticos primeiro, não críticos em background
      const clientsPromise = refreshClients();
      
      // Aguardar apenas dados críticos
      await clientsPromise;
      
      // Marcar como carregado mesmo que transações ainda estejam carregando
      setInitialDataLoaded(true);
      
      // Carregar transações em background
      refreshTransactions().then(() => {
        const endTime = performance.now();
        console.log(`Dashboard: Carregamento completo em ${Math.round(endTime - startTime)}ms`);
      });
      
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
      setDataLoadError("Erro ao carregar dados. Tente recarregar a página.");
    }
  }, [initialDataLoaded, refreshTransactions, refreshClients]);
  
  useEffect(() => {
    document.title = "Dashboard | Wedding CRM";
    loadInitialData();
  }, [loadInitialData]);
  
  // Renderizar estado de erro se houver
  if (dataLoadError) {
    return (
      <Layout>
        <div className="max-w-screen-2xl mx-auto px-4 py-8 space-y-8 animate-fade-in bg-background">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar dashboard</h2>
            <p className="text-gray-600 mb-4">{dataLoadError}</p>
            <button 
              onClick={() => {
                setInitialDataLoaded(false);
                setDataLoadError(null);
                loadInitialData();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
          <Toaster />
          <Sonner />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-screen-2xl mx-auto px-4 py-8 space-y-8 animate-fade-in bg-background">
        <DashboardHeader />
        
        {/* Mostrar skeleton apenas para loading inicial crítico */}
        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
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
