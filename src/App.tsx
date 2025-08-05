
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ClientsProvider } from './contexts/ClientsContext';
import { TransactionsProvider } from './contexts/TransactionsContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthGuard } from './components/AuthGuard';
import Layout from './components/Layout';
import Index from './pages/Index';
import ClientList from './pages/ClientList';
import ClientDetail from './pages/ClientDetail';
import CashFlow from './pages/CashFlow';
import PersonalControl from './pages/PersonalControl';
import Budgets from './pages/Budgets';
import Calendar from './pages/Calendar';
import Contracts from './pages/Contracts';
import ContractEditor from './pages/ContractEditor';

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ClientsProvider>
            <TransactionsProvider>
              <Toaster />
              <Routes>
                <Route path="/" element={
                  <AuthGuard>
                    <Layout>
                      <Index />
                    </Layout>
                  </AuthGuard>
                } />
                <Route path="/clients" element={
                  <AuthGuard>
                    <Layout>
                      <ClientList />
                    </Layout>
                  </AuthGuard>
                } />
                <Route path="/clients/:id" element={
                  <AuthGuard>
                    <Layout>
                      <ClientDetail />
                    </Layout>
                  </AuthGuard>
                } />
                <Route path="/cash-flow" element={
                  <AuthGuard>
                    <Layout>
                      <CashFlow />
                    </Layout>
                  </AuthGuard>
                } />
                 <Route path="/personal-control" element={
                  <AuthGuard>
                    <Layout>
                      <PersonalControl />
                    </Layout>
                  </AuthGuard>
                } />
                <Route path="/budgets" element={
                  <AuthGuard>
                    <Layout>
                      <Budgets />
                    </Layout>
                  </AuthGuard>
                } />
                <Route path="/calendar" element={
                  <AuthGuard>
                    <Layout>
                      <Calendar />
                    </Layout>
                  </AuthGuard>
                } />
                <Route path="/contracts" element={
                  <AuthGuard>
                    <Layout>
                      <Contracts />
                    </Layout>
                  </AuthGuard>
                } />
                <Route path="/contracts/template/:id" element={
                  <AuthGuard>
                    <Layout>
                      <ContractEditor />
                    </Layout>
                  </AuthGuard>
                } />
              </Routes>
            </TransactionsProvider>
          </ClientsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
