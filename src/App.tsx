
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'

// Pages
import Auth from '@/pages/Auth'
import Index from '@/pages/Index'
import ClientList from '@/pages/ClientList'
import ClientDetail from '@/pages/ClientDetail'
import AddClient from '@/pages/AddClient'
import EditClient from '@/pages/EditClient'
import CashFlow from '@/pages/CashFlow'
import Calendar from '@/pages/Calendar'
import ImportClients from '@/pages/ImportClients'
import NotFound from '@/pages/NotFound'
import ContractForm from '@/pages/ContractForm'

// Components
import { ThemeProvider } from '@/components/ThemeProvider'
import { Toaster } from '@/components/ui/sonner'
import { AuthGuard } from '@/components/AuthGuard'

// Contexts
import { ClientsProvider } from '@/contexts/ClientsContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { TransactionsProvider } from '@/contexts/TransactionsContext'

function App() {
  const [loadDeps, setLoadDeps] = useState(false)
  
  // Delay a bit to let Supabase initialize properly in development
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadDeps(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  if (!loadDeps) return null

  return (
    <ThemeProvider defaultTheme="light" storageKey="clixio-theme">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public pages */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/contract-form/:token" element={<ContractForm />} />
            
            {/* Protected routes */}
            <Route element={<AuthGuard />}>
              <Route path="/" element={
                <ClientsProvider>
                  <TransactionsProvider>
                    <Index />
                  </TransactionsProvider>
                </ClientsProvider>
              } />
              <Route path="/clients" element={
                <ClientsProvider>
                  <ClientList />
                </ClientsProvider>
              } />
              <Route path="/clients/:id" element={
                <ClientsProvider>
                  <TransactionsProvider>
                    <ClientDetail />
                  </TransactionsProvider>
                </ClientsProvider>
              } />
              <Route path="/clients/:id/edit" element={
                <ClientsProvider>
                  <EditClient />
                </ClientsProvider>
              } />
              <Route path="/add-client" element={
                <ClientsProvider>
                  <AddClient />
                </ClientsProvider>
              } />
              <Route path="/cashflow" element={
                <TransactionsProvider>
                  <CashFlow />
                </TransactionsProvider>
              } />
              <Route path="/calendar" element={
                <ClientsProvider>
                  <Calendar />
                </ClientsProvider>
              } />
              <Route path="/import-clients" element={
                <ClientsProvider>
                  <ImportClients />
                </ClientsProvider>
              } />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors expand={false} />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
