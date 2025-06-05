
import React from "react";
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
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthGuard } from "./components/AuthGuard";
import { ClientsProvider } from "./contexts/ClientsContext";
import { TransactionsProvider } from "./contexts/TransactionsContext";
import { CalendarEventsProvider } from "./hooks/useCalendarEvents";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <BrowserRouter>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route 
                  path="/" 
                  element={
                    <AuthGuard>
                      <ClientsProvider>
                        <TransactionsProvider>
                          <CalendarEventsProvider>
                            <Index />
                          </CalendarEventsProvider>
                        </TransactionsProvider>
                      </ClientsProvider>
                    </AuthGuard>
                  } 
                />
                <Route 
                  path="/clients" 
                  element={
                    <AuthGuard>
                      <ClientsProvider>
                        <TransactionsProvider>
                          <ClientList />
                        </TransactionsProvider>
                      </ClientsProvider>
                    </AuthGuard>
                  } 
                />
                <Route 
                  path="/clients/:id" 
                  element={
                    <AuthGuard>
                      <ClientsProvider>
                        <TransactionsProvider>
                          <ClientDetail />
                        </TransactionsProvider>
                      </ClientsProvider>
                    </AuthGuard>
                  } 
                />
                <Route 
                  path="/clients/add" 
                  element={
                    <AuthGuard>
                      <ClientsProvider>
                        <TransactionsProvider>
                          <CalendarEventsProvider>
                            <AddClient />
                          </CalendarEventsProvider>
                        </TransactionsProvider>
                      </ClientsProvider>
                    </AuthGuard>
                  } 
                />
                <Route 
                  path="/clients/import" 
                  element={
                    <AuthGuard>
                      <ClientsProvider>
                        <TransactionsProvider>
                          <ImportClients />
                        </TransactionsProvider>
                      </ClientsProvider>
                    </AuthGuard>
                  } 
                />
                <Route 
                  path="/clients/:id/edit" 
                  element={
                    <AuthGuard>
                      <ClientsProvider>
                        <TransactionsProvider>
                          <CalendarEventsProvider>
                            <EditClient />
                          </CalendarEventsProvider>
                        </TransactionsProvider>
                      </ClientsProvider>
                    </AuthGuard>
                  } 
                />
                <Route 
                  path="/calendar" 
                  element={
                    <AuthGuard>
                      <ClientsProvider>
                        <TransactionsProvider>
                          <CalendarEventsProvider>
                            <Calendar />
                          </CalendarEventsProvider>
                        </TransactionsProvider>
                      </ClientsProvider>
                    </AuthGuard>
                  } 
                />
                <Route 
                  path="/cashflow" 
                  element={
                    <AuthGuard>
                      <ClientsProvider>
                        <TransactionsProvider>
                          <CashFlow />
                        </TransactionsProvider>
                      </ClientsProvider>
                    </AuthGuard>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
