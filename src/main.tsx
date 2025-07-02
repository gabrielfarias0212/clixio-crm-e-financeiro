
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { TransactionsProvider } from '@/contexts/TransactionsContext'
import { ClientsProvider } from '@/contexts/ClientsContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TransactionsProvider>
        <ClientsProvider>
          <App />
        </ClientsProvider>
      </TransactionsProvider>
    </AuthProvider>
  </QueryClientProvider>
);
