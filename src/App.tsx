
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import ClientList from "./pages/ClientList";
import ClientDetail from "./pages/ClientDetail";
import AddClient from "./pages/AddClient";
import EditClient from "./pages/EditClient";
import ImportClients from "./pages/ImportClients";
import Calendar from "./pages/Calendar";
import CashFlow from "./pages/CashFlow";
import PersonalControl from "./pages/PersonalControl";
import Budgets from "./pages/Budgets";
import CreateBudget from "./pages/CreateBudget";
import BudgetDetail from "./pages/BudgetDetail";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import LandingPage from "./pages/LandingPage";
import Layout from "./components/Layout";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthGuard } from "./components/AuthGuard";
import { ClientsProvider } from "./contexts/ClientsContext";
import { TransactionsProvider } from "./contexts/TransactionsContext";
import { CalendarEventsProvider } from "./contexts/CalendarEventsContext";

// Create a client
const queryClient = new QueryClient();

// Centralized Providers Wrapper
function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ClientsProvider>
            <TransactionsProvider>
              <CalendarEventsProvider>
                {children}
              </CalendarEventsProvider>
            </TransactionsProvider>
          </ClientsProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Layout>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<AuthGuard><Index /></AuthGuard>} />
            <Route path="/clients" element={<AuthGuard><ClientList /></AuthGuard>} />
            <Route path="/clients/:id" element={<AuthGuard><ClientDetail /></AuthGuard>} />
            <Route path="/clients/add" element={<AuthGuard><AddClient /></AuthGuard>} />
            <Route path="/clients/import" element={<AuthGuard><ImportClients /></AuthGuard>} />
            <Route path="/clients/:id/edit" element={<AuthGuard><EditClient /></AuthGuard>} />
            <Route path="/calendar" element={<AuthGuard><Calendar /></AuthGuard>} />
            <Route path="/cashflow" element={<AuthGuard><CashFlow /></AuthGuard>} />
            <Route path="/personal-control" element={<AuthGuard><PersonalControl /></AuthGuard>} />
            <Route path="/budgets" element={<AuthGuard><Budgets /></AuthGuard>} />
            <Route path="/budgets/new" element={<AuthGuard><CreateBudget /></AuthGuard>} />
            <Route path="/budgets/:id" element={<AuthGuard><BudgetDetail /></AuthGuard>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;
