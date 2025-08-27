
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
import ClientList from "./pages/ClientList";
import AddClient from "./pages/AddClient";
import EditClient from "./pages/EditClient";
import ClientDetail from "./pages/ClientDetail";
import ImportClients from "./pages/ImportClients";
import CashFlow from "./pages/CashFlow";
import PersonalControl from "./pages/PersonalControl";
import Calendar from "./pages/Calendar";
import Budgets from "./pages/Budgets";
import CreateBudget from "./pages/CreateBudget";
import EditBudget from "./pages/EditBudget";
import BudgetDetail from "./pages/BudgetDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/*"
              element={
                <AuthGuard>
                  <ClientsProvider>
                    <TransactionsProvider>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/clients" element={<ClientList />} />
                        <Route path="/clients/add" element={<AddClient />} />
                        <Route path="/clients/:id/edit" element={<EditClient />} />
                        <Route path="/clients/:id" element={<ClientDetail />} />
                        <Route path="/clients/import" element={<ImportClients />} />
                        <Route path="/cash-flow" element={<CashFlow />} />
                        <Route path="/personal" element={<PersonalControl />} />
                        <Route path="/calendar" element={<Calendar />} />
                        <Route path="/budgets" element={<Budgets />} />
                        <Route path="/budgets/create" element={<CreateBudget />} />
                        <Route path="/budgets/:id/edit" element={<EditBudget />} />
                        <Route path="/budgets/:id" element={<BudgetDetail />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </TransactionsProvider>
                  </ClientsProvider>
                </AuthGuard>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
