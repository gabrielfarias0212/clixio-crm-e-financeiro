
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { ClientsProvider } from './contexts/ClientsContext';
import { TransactionsProvider } from './contexts/TransactionsContext';
import { AuthGuard } from './components/AuthGuard';
import Layout from './components/Layout';
import Index from './pages/Index';
import ClientList from './pages/ClientList';
import AddClient from './pages/AddClient';
import EditClient from './pages/EditClient';
import ClientDetail from './pages/ClientDetail';
import CashFlow from './pages/CashFlow';
import PersonalControl from './pages/PersonalControl';
import ImportClients from './pages/ImportClients';
import Budgets from './pages/Budgets';
import CreateBudget from './pages/CreateBudget';
import BudgetDetail from './pages/BudgetDetail';
import Calendar from './pages/Calendar';
import Contracts from './pages/Contracts';
import ContractEditor from './pages/ContractEditor';
import Auth from './pages/Auth';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <ClientsProvider>
            <TransactionsProvider>
              <Toaster />
              <Routes>
                <Route path="/auth" element={<Auth />} />
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
                <Route path="/clients/add" element={
                  <AuthGuard>
                    <Layout>
                      <AddClient />
                    </Layout>
                  </AuthGuard>
                } />
                <Route path="/clients/edit/:id" element={
                  <AuthGuard>
                    <Layout>
                      <EditClient />
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
                <Route path="/clients/import" element={
                  <AuthGuard>
                    <Layout>
                      <ImportClients />
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
                <Route path="/budgets/create" element={
                  <AuthGuard>
                    <Layout>
                      <CreateBudget />
                    </Layout>
                  </AuthGuard>
                } />
                <Route path="/budgets/:id" element={
                  <AuthGuard>
                    <Layout>
                      <BudgetDetail />
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
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
