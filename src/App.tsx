
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
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={
                <AuthGuard>
                  <ClientsProvider>
                    <TransactionsProvider>
                      <Index />
                    </TransactionsProvider>
                  </ClientsProvider>
                </AuthGuard>
              } />
              <Route path="/clients" element={
                <AuthGuard>
                  <ClientsProvider>
                    <TransactionsProvider>
                      <ClientList />
                    </TransactionsProvider>
                  </ClientsProvider>
                </AuthGuard>
              } />
              <Route path="/clients/add" element={
                <AuthGuard>
                  <ClientsProvider>
                    <TransactionsProvider>
                      <AddClient />
                    </TransactionsProvider>
                  </ClientsProvider>
                </AuthGuard>
              } />
              <Route path="/clients/import" element={
                <AuthGuard>
                  <ClientsProvider>
                    <TransactionsProvider>
                      <ImportClients />
                    </TransactionsProvider>
                  </ClientsProvider>
                </AuthGuard>
              } />
              <Route path="/clients/:id" element={
                <AuthGuard>
                  <ClientsProvider>
                    <TransactionsProvider>
                      <ClientDetail />
                    </TransactionsProvider>
                  </ClientsProvider>
                </AuthGuard>
              } />
              <Route path="/clients/:id/edit" element={
                <AuthGuard>
                  <ClientsProvider>
                    <TransactionsProvider>
                      <EditClient />
                    </TransactionsProvider>
                  </ClientsProvider>
                </AuthGuard>
              } />
              <Route path="/cashflow" element={
                <AuthGuard>
                  <ClientsProvider>
                    <TransactionsProvider>
                      <CashFlow />
                    </TransactionsProvider>
                  </ClientsProvider>
                </AuthGuard>
              } />
              <Route path="/calendar" element={
                <AuthGuard>
                  <ClientsProvider>
                    <TransactionsProvider>
                      <Calendar />
                    </TransactionsProvider>
                  </ClientsProvider>
                </AuthGuard>
              } />
              <Route path="/budgets" element={
                <AuthGuard>
                  <ClientsProvider>
                    <TransactionsProvider>
                      <Budgets />
                    </TransactionsProvider>
                  </ClientsProvider>
                </AuthGuard>
              } />
              <Route path="/budgets/create" element={
                <AuthGuard>
                  <ClientsProvider>
                    <TransactionsProvider>
                      <CreateBudget />
                    </TransactionsProvider>
                  </ClientsProvider>
                </AuthGuard>
              } />
              <Route path="/budgets/:id" element={
                <AuthGuard>
                  <ClientsProvider>
                    <TransactionsProvider>
                      <BudgetDetail />
                    </TransactionsProvider>
                  </ClientsProvider>
                </AuthGuard>
              } />
              <Route path="/personal" element={
                <AuthGuard>
                  <TransactionsProvider>
                    <PersonalControl />
                  </TransactionsProvider>
                </AuthGuard>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
