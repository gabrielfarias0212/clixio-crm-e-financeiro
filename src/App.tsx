
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ClientsProvider } from "@/contexts/ClientsContext";
import { TransactionsProvider } from "@/contexts/TransactionsContext";
import { AuthGuard } from "@/components/AuthGuard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AddClient from "./pages/AddClient";
import ClientList from "./pages/ClientList";
import ClientDetail from "./pages/ClientDetail";
import EditClient from "./pages/EditClient";
import CashFlow from "./pages/CashFlow";
import Calendar from "./pages/Calendar";
import Budgets from "./pages/Budgets";
import CreateBudget from "./pages/CreateBudget";
import BudgetDetail from "./pages/BudgetDetail";
import PersonalControl from "./pages/PersonalControl";
import ImportClients from "./pages/ImportClients";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";

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
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard" element={
                    <AuthGuard>
                      <Index />
                    </AuthGuard>
                  } />
                  <Route path="/clients" element={
                    <AuthGuard>
                      <ClientList />
                    </AuthGuard>
                  } />
                  <Route path="/clients/add" element={
                    <AuthGuard>
                      <AddClient />
                    </AuthGuard>
                  } />
                  <Route path="/clients/import" element={
                    <AuthGuard>
                      <ImportClients />
                    </AuthGuard>
                  } />
                  <Route path="/clients/:id" element={
                    <AuthGuard>
                      <ClientDetail />
                    </AuthGuard>
                  } />
                  <Route path="/clients/:id/edit" element={
                    <AuthGuard>
                      <EditClient />
                    </AuthGuard>
                  } />
                  <Route path="/cashflow" element={
                    <AuthGuard>
                      <CashFlow />
                    </AuthGuard>
                  } />
                  <Route path="/calendar" element={
                    <AuthGuard>
                      <Calendar />
                    </AuthGuard>
                  } />
                  <Route path="/budgets" element={
                    <AuthGuard>
                      <Budgets />
                    </AuthGuard>
                  } />
                  <Route path="/budgets/create" element={
                    <AuthGuard>
                      <CreateBudget />
                    </AuthGuard>
                  } />
                  <Route path="/budgets/:id" element={
                    <AuthGuard>
                      <BudgetDetail />
                    </AuthGuard>
                  } />
                  <Route path="/personal" element={
                    <AuthGuard>
                      <PersonalControl />
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
