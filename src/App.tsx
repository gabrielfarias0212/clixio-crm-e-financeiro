
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
import Calendar from "./pages/Calendar";
import CashFlow from "./pages/CashFlow";
import NotFound from "./pages/NotFound";
import { ClientsProvider } from "./contexts/ClientsContext";
import { TransactionsProvider } from "./contexts/TransactionsContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ClientsProvider>
        <TransactionsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/clients" element={<ClientList />} />
              <Route path="/clients/:id" element={<ClientDetail />} />
              <Route path="/clients/add" element={<AddClient />} />
              <Route path="/clients/edit/:id" element={<EditClient />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/cashflow" element={<CashFlow />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TransactionsProvider>
      </ClientsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
