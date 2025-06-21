
import { useCallback, useMemo, useState } from 'react';
import { useClients } from '@/contexts/ClientsContext';
import { Client } from '@/utils/types';

interface UseOptimizedClientsProps {
  pageSize?: number;
  searchTerm?: string;
  statusFilter?: string;
}

export function useOptimizedClients({ 
  pageSize = 50, 
  searchTerm = '', 
  statusFilter = 'all' 
}: UseOptimizedClientsProps = {}) {
  const { clients, loading, error } = useClients();
  const [currentPage, setCurrentPage] = useState(1);

  // Filtros otimizados com memoização
  const filteredClients = useMemo(() => {
    let filtered = clients;

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === statusFilter);
    }

    // Filtro por busca
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(term) ||
        client.coupleName?.toLowerCase().includes(term) ||
        client.email?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [clients, statusFilter, searchTerm]);

  // Paginação otimizada
  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredClients.slice(startIndex, endIndex);
  }, [filteredClients, currentPage, pageSize]);

  // Metadados de paginação
  const paginationMeta = useMemo(() => ({
    totalItems: filteredClients.length,
    totalPages: Math.ceil(filteredClients.length / pageSize),
    currentPage,
    hasNextPage: currentPage < Math.ceil(filteredClients.length / pageSize),
    hasPrevPage: currentPage > 1,
    startIndex: (currentPage - 1) * pageSize + 1,
    endIndex: Math.min(currentPage * pageSize, filteredClients.length)
  }), [filteredClients.length, currentPage, pageSize]);

  // Navegação otimizada
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= paginationMeta.totalPages) {
      setCurrentPage(page);
    }
  }, [paginationMeta.totalPages]);

  const nextPage = useCallback(() => {
    if (paginationMeta.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [paginationMeta.hasNextPage]);

  const prevPage = useCallback(() => {
    if (paginationMeta.hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [paginationMeta.hasPrevPage]);

  // Reset página quando filtros mudam
  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    clients: paginatedClients,
    allClients: filteredClients,
    loading,
    error,
    pagination: {
      ...paginationMeta,
      goToPage,
      nextPage,
      prevPage,
      resetPage
    }
  };
}
