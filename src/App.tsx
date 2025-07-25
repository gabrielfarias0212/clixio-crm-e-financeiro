
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ClientsProvider } from "@/contexts/ClientsContext";
import { TransactionsProvider } from "@/contexts/TransactionsContext";
import { AuthGuard } from "@/components/AuthGuard";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ClientList from "./pages/ClientList";
import AddClient from "./pages/AddClient";
import EditClient from "./pages/EditClient";
import ClientDetail from "./pages/ClientDetail";
import ImportClients from "./pages/ImportClients";
import CashFlow from "./pages/CashFlow";
import Calendar from "./pages/Calendar";
import PersonalControl from "./pages/PersonalControl";
import Budgets from "./pages/Budgets";
import CreateBudget from "./pages/CreateBudget";
import BudgetDetail from "./pages/BudgetDetail";
import Contracts from "./pages/Contracts";
import CreateContract from "./pages/CreateContract";
import ContractDetail from "./pages/ContractDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ClientsProvider>
              <TransactionsProvider>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/" element={
                    <AuthGuard>
                      <Layout>
                        <Index />
                      </Layout>
                    </AuthGuard>
                  } />
                  <Route path="/clients" element={
                    <AuthGuard>
                      <Layout>
                        <ClientList />
                      </Layout>
                    </AuthGuard>
                  } />
                  <Route path="/clients/add" element={
                    <AuthGuard>
                      <Layout>
                        <AddClient />
                      </Layout>
                    </AuthGuard>
                  } />
                  <Route path="/clients/:id/edit" element={
                    <AuthGuard>
                      <Layout>
                        <EditClient />
                      </Layout>
                    </AuthGuard>
                  } />
                  <Route path="/clients/:id" element={
                    <AuthGuard>
                      <Layout>
                        <ClientDetail />
                      </Layout>
                    </AuthGuard>
                  } />
                  <Route path="/clients/import" element={
                    <AuthGuard>
                      <Layout>
                        <ImportClients />
                      </Layout>
                    </AuthGuard>
                  } />
                  <Route path="/cash-flow" element={
                    <AuthGuard>
                      <Layout>
                        <CashFlow />
                      </Layout>
                    </AuthGuard>
                  } />
                  <Route path="/calendar" element={
                    <AuthGuard>
                      <Layout>
                        <Calendar />
                      </Layout>
                    </AuthGuard>
                  } />
                  <Route path="/personal-control" element={
                    <AuthGuard>
                      <Layout>
                        <PersonalControl />
                      </Layout>
                    </AuthGuard>
                  } />
                  <Route path="/budgets" element={
                    <AuthGuard>
                      <Layout>
                        <Budgets />
                      </Layout>
                    </AuthGuard>
                  } />
                  <Route path="/budgets/new" element={
                    <AuthGuard>
                      <Layout>
                        <CreateBudget />
                      </Layout>
                    </AuthGuard>
                  } />
                  <Route path="/budgets/:id" element={
                    <AuthGuard>
                      <Layout>
                        <BudgetDetail />
                      </Layout>
                    </AuthGuard>
                  } />
                  <Route path="/contracts" element={
                    <AuthGuard>
                      <Layout>
                        <Contracts />
                      </Layout>
                    </AuthGuard>
                  } />
                  <Route path="/contracts/new" element={
                    <AuthGuard>
                      <Layout>
                        <CreateContract />
                      </Layout>
                    </AuthGuard>
                  } />
                  <Route path="/contracts/:id" element={
                    <AuthGuard>
                      <Layout>
                        <ContractDetail />
                      </Layout>
                    </AuthGuard>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TransactionsProvider>
            </ClientsProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
