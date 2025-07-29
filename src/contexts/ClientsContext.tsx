
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Client } from '@/utils/types';
import { fetchClients, invalidateClientsCache } from '@/utils/supabase/client-fetch';
import { createClient, updateClient, deleteClient } from '@/utils/supabaseUtils';
import { toast } from 'sonner';

type ClientsContextType = {
  clients: Client[];
  loading: boolean;
  error: string | null;
  refreshClients: () => Promise<void>;
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'payments'>) => Promise<Client | null>;
  updateClient: (id: string, updates: Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'payments'>>) => Promise<Client | null>;
  removeClient: (id: string) => Promise<boolean>;
};

const ClientsContext = createContext<ClientsContextType | undefined>(undefined);

export function ClientsProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchClients();
      setClients(data);
    } catch (err) {
      setError('Falha ao carregar os clientes. Por favor, tente novamente.');
      toast.error('Falha ao carregar os clientes');
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'payments'>) => {
    try {
      const newClient = await createClient(clientData);
      
      if (newClient) {
        // Invalidar cache e atualizar estado
        invalidateClientsCache();
        setClients(prev => [newClient, ...prev]);
        
        return newClient;
      } else {
        toast.error('Falha ao adicionar cliente. Verifique os dados e tente novamente.');
        return null;
      }
    } catch (err) {
      toast.error('Falha ao adicionar cliente');
      return null;
    }
  };

  const updateClientData = async (id: string, updates: Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'payments'>>) => {
    try {
      const updatedClient = await updateClient(id, updates);
      if (updatedClient) {
        // Invalidar cache e atualizar estado local
        invalidateClientsCache();
        setClients(prev => 
          prev.map(client => client.id === id ? updatedClient : client)
        );
        
        toast.success('Cliente atualizado com sucesso!');
        return updatedClient;
      }
      return null;
    } catch (err) {
      toast.error('Falha ao atualizar cliente');
      return null;
    }
  };

  const removeClient = async (id: string) => {
    try {
      const success = await deleteClient(id);
      if (success) {
        // Invalidar cache e atualizar estado local
        invalidateClientsCache();
        setClients(prev => prev.filter(client => client.id !== id));
        
        toast.success('Cliente excluído com sucesso!');
        return true;
      } else {
        toast.error('Falha ao excluir cliente');
        return false;
      }
    } catch (err) {
      toast.error('Falha ao excluir cliente');
      return false;
    }
  };

  useEffect(() => {
    refreshClients();
  }, []);

  return (
    <ClientsContext.Provider
      value={{
        clients,
        loading,
        error,
        refreshClients,
        addClient,
        updateClient: updateClientData,
        removeClient
      }}
    >
      {children}
    </ClientsContext.Provider>
  );
}

export function useClients() {
  const context = useContext(ClientsContext);
  if (context === undefined) {
    throw new Error('useClients must be used within a ClientsProvider');
  }
  return context;
}
