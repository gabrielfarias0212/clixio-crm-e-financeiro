import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ClientsProvider } from './contexts/ClientsContext';
import { TransactionsProvider } from './contexts/TransactionsContext';
import { QueryClient } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import AuthGuard from './components/AuthGuard';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetails from './pages/ClientDetails';
import Transactions from './pages/Transactions';
import FinancialControl from './pages/FinancialControl';
import PersonalControl from './pages/PersonalControl';
import Budgets from './pages/Budgets';
import Calendar from './pages/Calendar';
import Suppliers from './pages/Suppliers';
import Products from './pages/Products';
import Settings from './pages/Settings';
import ContractEditor from './pages/ContractEditor';
import Contracts from './pages/Contracts';

function App() {
  return (
    <Router>
      <QueryClient>
        <AuthProvider>
          <ClientsProvider>
            <TransactionsProvider>
              <Toaster />
              <Routes>
                <Route path="/" element={
                  <AuthGuard>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </AuthGuard>
                } />
                <Route path="/clients" element={
                  <AuthGuard>
                    <Layout>
                      <Clients />
                    </Layout>
                  </AuthGuard>
                } />
                <Route path="/clients/:id" element={
                  <AuthGuard>
                    <Layout>
                      <ClientDetails />
                    </Layout>
                  </AuthGuard>
                } />
                <Route path="/transactions" element={
                  <AuthGuard>
                    <Layout>
                      <Transactions />
                    </Layout>
                  </AuthGuard>
                } />
                <Route path="/cash-flow" element={
                  <AuthGuard>
                    <Layout>
                      <FinancialControl />
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
                <Route path="/suppliers" element={
                  <AuthGuard>
                    <Layout>
                      <Suppliers />
                    </Layout>
                  </AuthGuard>
                } />
                <Route path="/products" element={
                  <AuthGuard>
                    <Layout>
                      <Products />
                    </Layout>
                  </AuthGuard>
                } />
                <Route path="/settings" element={
                  <AuthGuard>
                    <Layout>
                      <Settings />
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
      </QueryClient>
    </Router>
  );
}

export default App;
