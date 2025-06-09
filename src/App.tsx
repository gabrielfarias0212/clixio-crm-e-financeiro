
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ClientsProvider } from '@/contexts/ClientsContext';
import { TransactionsProvider } from '@/contexts/TransactionsContext';
import { AuthProvider } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import Layout from '@/components/Layout';
import Index from '@/pages/Index';
import ClientList from '@/pages/ClientList';
import AddClient from '@/pages/AddClient';
import EditClient from '@/pages/EditClient';
import ClientDetail from '@/pages/ClientDetail';
import ImportClients from '@/pages/ImportClients';
import Calendar from '@/pages/Calendar';
import CashFlow from '@/pages/CashFlow';
import Products from '@/pages/Products';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={
                <AuthGuard>
                  <ClientsProvider>
                    <TransactionsProvider>
                      <Layout>
                        <Routes>
                          <Route index element={<Index />} />
                          <Route path="/clients" element={<ClientList />} />
                          <Route path="/clients/add" element={<AddClient />} />
                          <Route path="/clients/:id" element={<ClientDetail />} />
                          <Route path="/clients/:id/edit" element={<EditClient />} />
                          <Route path="/import-clients" element={<ImportClients />} />
                          <Route path="/calendar" element={<Calendar />} />
                          <Route path="/cash-flow" element={<CashFlow />} />
                          <Route path="/products" element={<Products />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Layout>
                    </TransactionsProvider>
                  </ClientsProvider>
                </AuthGuard>
              } />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
