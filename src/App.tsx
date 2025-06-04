
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { ClientsProvider } from "@/contexts/ClientsContext";
import { TransactionsProvider } from "@/contexts/TransactionsContext";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";

// Lazy load pages for better performance
const ClientList = lazy(() => import("@/pages/ClientList"));
const AddClient = lazy(() => import("@/pages/AddClient"));
const EditClient = lazy(() => import("@/pages/EditClient"));
const ClientDetail = lazy(() => import("@/pages/ClientDetail"));
const ImportClients = lazy(() => import("@/pages/ImportClients"));
const CashFlow = lazy(() => import("@/pages/CashFlow"));
const Calendar = lazy(() => import("@/pages/Calendar"));
const ProLaboreConfig = lazy(() => import("@/pages/ProLaboreConfig"));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-background font-sans antialiased">
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route 
                  path="/*" 
                  element={
                    <AuthGuard>
                      <ClientsProvider>
                        <TransactionsProvider>
                          <Suspense fallback={<div>Loading...</div>}>
                            <Routes>
                              <Route path="/" element={<Index />} />
                              <Route path="/clients" element={<ClientList />} />
                              <Route path="/clients/add" element={<AddClient />} />
                              <Route path="/clients/:id/edit" element={<EditClient />} />
                              <Route path="/clients/:id" element={<ClientDetail />} />
                              <Route path="/clients/import" element={<ImportClients />} />
                              <Route path="/cash-flow" element={<CashFlow />} />
                              <Route path="/calendar" element={<Calendar />} />
                              <Route path="/prolabore-config" element={<ProLaboreConfig />} />
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </Suspense>
                        </TransactionsProvider>
                      </ClientsProvider>
                    </AuthGuard>
                  } 
                />
              </Routes>
            </div>
            <Toaster />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
