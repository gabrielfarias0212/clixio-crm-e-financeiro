import { useMemo, useState } from 'react';
import { Client } from '@/utils/types';

export function useWorkflowSearch(clients: Client[]) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) {
      return clients;
    }

    const term = searchTerm.toLowerCase();
    return clients.filter(client => {
      const name = client.name?.toLowerCase() || '';
      const coupleName = client.coupleName?.toLowerCase() || '';
      const eventCategory = client.eventCategory?.toLowerCase() || '';
      const phone = client.phone?.toLowerCase() || '';
      const email = client.email?.toLowerCase() || '';

      return name.includes(term) || 
             coupleName.includes(term) || 
             eventCategory.includes(term) ||
             phone.includes(term) ||
             email.includes(term);
    });
  }, [clients, searchTerm]);

  const clearSearch = () => setSearchTerm('');

  return {
    searchTerm,
    setSearchTerm,
    filteredClients,
    clearSearch,
    hasResults: filteredClients.length > 0,
    totalResults: filteredClients.length
  };
}