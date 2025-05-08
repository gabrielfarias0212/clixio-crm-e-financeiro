
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ClientsProvider } from "@/contexts/ClientsContext";
import { TransactionsProvider } from "@/contexts/TransactionsContext";
import { TransactionDataProvider } from "@/contexts/TransactionDataProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthGuard from "@/components/AuthGuard";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import ClientList from "@/pages/ClientList";
import ClientDetail from "@/pages/ClientDetail";
import EditClient from "@/pages/EditClient";
import AddClient from "@/pages/AddClient";
import CashFlow from "@/pages/CashFlow";
import Calendar from "@/pages/Calendar";
import ImportClients from "@/pages/ImportClients";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <Router>
        <AuthProvider>
          <ClientsProvider>
            <TransactionsProvider>
              <TransactionDataProvider>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  
                  <Route element={<AuthGuard />}>
                    <Route path="/" element={<Index />} />
                    <Route path="/clients" element={<ClientList />} />
                    <Route path="/clients/:id" element={<ClientDetail />} />
                    <Route path="/clients/:id/edit" element={<EditClient />} />
                    <Route path="/add-client" element={<AddClient />} />
                    <Route path="/import" element={<ImportClients />} />
                    <Route path="/cash-flow" element={<CashFlow />} />
                    <Route path="/calendar" element={<Calendar />} />
                  </Route>
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
                <Sonner />
              </TransactionDataProvider>
            </TransactionsProvider>
          </ClientsProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}
