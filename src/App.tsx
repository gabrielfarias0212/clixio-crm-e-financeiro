
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { TransactionsProvider } from "@/contexts/TransactionsContext";
import { ClientsProvider } from "@/contexts/ClientsContext";
import { AuthGuard } from "@/components/AuthGuard";
import LandingPage from "@/pages/LandingPage";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import ClientList from "@/pages/ClientList";
import AddClient from "@/pages/AddClient";
import ImportClients from "@/pages/ImportClients";
import ClientDetail from "@/pages/ClientDetail";
import EditClient from "@/pages/EditClient";
import Budgets from "@/pages/Budgets";
import CreateBudget from "@/pages/CreateBudget";
import BudgetDetail from "@/pages/BudgetDetail";
import EditBudget from "@/pages/EditBudget";
import Calendar from "@/pages/Calendar";
import CashFlow from "@/pages/CashFlow";
import PersonalControl from "@/pages/PersonalControl";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <AuthProvider>
      <Toaster />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Protected routes */}
          <Route path="/*" element={
            <AuthGuard>
              <ClientsProvider>
                <TransactionsProvider>
                  <Routes>
                    <Route path="/dashboard" element={<Index />} />
                    <Route path="/clients" element={<ClientList />} />
                    <Route path="/clients/add" element={<AddClient />} />
                    <Route path="/clients/import" element={<ImportClients />} />
                    <Route path="/clients/:id" element={<ClientDetail />} />
                    <Route path="/clients/:id/edit" element={<EditClient />} />
                    <Route path="/budgets" element={<Budgets />} />
                    <Route path="/budgets/create" element={<CreateBudget />} />
                    <Route path="/budgets/:id" element={<BudgetDetail />} />
                    <Route path="/budgets/:id/edit" element={<EditBudget />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/cash-flow" element={<CashFlow />} />
                    <Route path="/personal-control" element={<PersonalControl />} />
                  </Routes>
                </TransactionsProvider>
              </ClientsProvider>
            </AuthGuard>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
