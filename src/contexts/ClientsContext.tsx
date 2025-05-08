
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Client } from '@/utils/types';
import { fetchClients, createClient, updateClient, deleteClient, ClientSortOption, SortDirection } from '@/utils/supabaseUtils';
import { toast } from 'sonner';

type ClientsContextType = {
  clients: Client[];
  loading: boolean;
  error: string | null;
  sortBy: ClientSortOption;
  sortDirection: SortDirection;
  setSorting: (sortBy: ClientSortOption, direction: SortDirection) => void;
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
  const [sortBy, setSortBy] = useState<ClientSortOption>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const setSorting = (newSortBy: ClientSortOption, direction: SortDirection) => {
    setSortBy(newSortBy);
    setSortDirection(direction);
    refreshClients();
  };

  const refreshClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchClients(sortBy, sortDirection);
      console.log("Fetched clients:", data);
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
      console.log('Updating client via context:', id, updates);
      
      const updatedClient = await updateClient(id, updates);
      if (updatedClient) {
        console.log('Client updated successfully:', updatedClient);
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

  const removeClient = async (id: string) => {
    try {
      const success = await deleteClient(id);
      if (success) {
        setClients(prev => prev.filter(client => client.id !== id));
        toast.success('Cliente excluído com sucesso!');
        return true;
      } else {
        toast.error('Falha ao excluir cliente');
        return false;
      }
    } catch (err) {
      console.error('Error deleting client:', err);
      toast.error('Falha ao excluir cliente');
      return false;
    }
  };

  useEffect(() => {
    refreshClients();
  }, [sortBy, sortDirection]);

  return (
    <ClientsContext.Provider
      value={{
        clients,
        loading,
        error,
        sortBy,
        sortDirection,
        setSorting,
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
