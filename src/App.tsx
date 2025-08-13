
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ClientsProvider } from "@/contexts/ClientsContext";
import { TransactionsProvider } from "@/contexts/TransactionsProvider";
import { CalendarEventsProvider } from "@/hooks/useCalendarEvents";
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
              <Route path="/" element={
                <AuthGuard>
                  <ClientsProvider>
                    <TransactionsProvider>
                      <CalendarEventsProvider>
                        <Index />
                      </CalendarEventsProvider>
                    </TransactionsProvider>
                  </ClientsProvider>
                </AuthGuard>
              } />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={
                <AuthGuard>
                  <ClientsProvider>
                    <TransactionsProvider>
                      <CalendarEventsProvider>
                        <Index />
                      </CalendarEventsProvider>
                    </TransactionsProvider>
                  </ClientsProvider>
                </AuthGuard>
              } />
              <Route path="/clients" element={
                <AuthGuard>
                  <ClientsProvider>
                    <TransactionsProvider>
                      <CalendarEventsProvider>
                        <ClientList />
                      </CalendarEventsProvider>
                    </TransactionsProvider>
                  </ClientsProvider>
                </AuthGuard>
              } />
              <Route path="/clients/add" element={
                <AuthGuard>
                  <ClientsProvider>
                    <TransactionsProvider>
                      <CalendarEventsProvider>
                        <AddClient />
                      </CalendarEventsProvider>
                    </TransactionsProvider>
                  </ClientsProvider>
                </AuthGuard>
              } />
              <Route path="/clients/import" element={
                <AuthGuard>
                  <ClientsProvider>
                    <TransactionsProvider>
                      <CalendarEventsProvider>
                        <ImportClients />
                      </CalendarEventsProvider>
                    </TransactionsProvider>
                  </ClientsProvider>
                </AuthGuard>
              } />
              <Route path="/clients/:id" element={
                <AuthGuard>
                  <ClientsProvider>
                    <TransactionsProvider>
                      <CalendarEventsProvider>
                        <ClientDetail />
                      </CalendarEventsProvider>
                    </TransactionsProvider>
                  </ClientsProvider>
                </AuthGuard>
              } />
              <Route path="/clients/:id/edit" element={
                <AuthGuard>
                  <ClientsProvider>
                    <TransactionsProvider>
                      <CalendarEventsProvider>
                        <EditClient />
                      </CalendarEventsProvider>
                    </TransactionsProvider>
                  </ClientsProvider>
                </AuthGuard>
              } />
              <Route path="/cashflow" element={
                <AuthGuard>
                  <ClientsProvider>
                    <TransactionsProvider>
                      <CalendarEventsProvider>
                        <CashFlow />
                      </CalendarEventsProvider>
                    </TransactionsProvider>
                  </ClientsProvider>
                </AuthGuard>
              } />
              <Route path="/calendar" element={
                <AuthGuard>
                  <ClientsProvider>
                    <TransactionsProvider>
                      <CalendarEventsProvider>
                        <Calendar />
                      </CalendarEventsProvider>
                    </TransactionsProvider>
                  </ClientsProvider>
                </AuthGuard>
              } />
              <Route path="/budgets" element={
                <AuthGuard>
                  <ClientsProvider>
                    <TransactionsProvider>
                      <CalendarEventsProvider>
                        <Budgets />
                      </CalendarEventsProvider>
                    </TransactionsProvider>
                  </ClientsProvider>
                </AuthGuard>
              } />
              <Route path="/budgets/create" element={
                <AuthGuard>
                  <ClientsProvider>
                    <TransactionsProvider>
                      <CalendarEventsProvider>
                        <CreateBudget />
                      </CalendarEventsProvider>
                    </TransactionsProvider>
                  </ClientsProvider>
                </AuthGuard>
              } />
              <Route path="/budgets/:id" element={
                <AuthGuard>
                  <ClientsProvider>
                    <TransactionsProvider>
                      <CalendarEventsProvider>
                        <BudgetDetail />
                      </CalendarEventsProvider>
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
