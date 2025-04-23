
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Client } from '@/utils/types';
import { fetchClients, createClient, updateClient } from '@/utils/supabaseUtils';
import { toast } from 'sonner';

type ClientsContextType = {
  clients: Client[];
  loading: boolean;
  error: string | null;
  refreshClients: () => Promise<void>;
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'payments'>) => Promise<Client | null>;
  updateClient: (id: string, updates: Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'payments'>>) => Promise<Client | null>;
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
      console.error('Error fetching clients:', err);
      setError('Falha ao carregar os clientes. Por favor, tente novamente.');
      toast.error('Falha ao carregar os clientes');
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'payments'>) => {
    try {
      console.log('Adding client via context:', clientData);
      const newClient = await createClient(clientData);
      
      if (newClient) {
        console.log('Client created successfully:', newClient);
        setClients(prev => [newClient, ...prev]);
        return newClient;
      } else {
        console.error('Failed to add client, no client returned from API');
        toast.error('Falha ao adicionar cliente. Verifique os dados e tente novamente.');
        return null;
      }
    } catch (err) {
      console.error('Error adding client:', err);
      toast.error('Falha ao adicionar cliente');
      return null;
    }
  };

  const updateClientData = async (id: string, updates: Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'payments'>>) => {
    try {
      const updatedClient = await updateClient(id, updates);
      if (updatedClient) {
        setClients(prev => 
          prev.map(client => client.id === id ? updatedClient : client)
        );
        toast.success('Cliente atualizado com sucesso!');
        return updatedClient;
      }
      return null;
    } catch (err) {
      console.error('Error updating client:', err);
      toast.error('Falha ao atualizar cliente');
      return null;
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
        updateClient: updateClientData
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
