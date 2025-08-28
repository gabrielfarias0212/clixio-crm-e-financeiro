
import { useCallback, useMemo, useState } from 'react';
import { useClients } from '@/contexts/ClientsContext';
import { Client } from '@/utils/types';

interface UseOptimizedClientsProps {
  pageSize?: number;
  searchTerm?: string;
  statusFilter?: string;
  sortBy?: "name" | "date" | "value" | "status";
  sortOrder?: "asc" | "desc";
}

export function useOptimizedClients({ 
  pageSize = 50, 
  searchTerm = '', 
  statusFilter = 'all',
  sortBy = 'name',
  sortOrder = 'asc'
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

  // Dados ordenados
  const sortedClients = useMemo(() => {
    const sorted = [...filteredClients].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'date':
          aValue = a.weddingDate ? new Date(a.weddingDate) : new Date(0);
          bValue = b.weddingDate ? new Date(b.weddingDate) : new Date(0);
          break;
        case 'value':
          aValue = a.contractValue || 0;
          bValue = b.contractValue || 0;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredClients, sortBy, sortOrder]);

  // Paginação otimizada
  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedClients.slice(startIndex, endIndex);
  }, [sortedClients, currentPage, pageSize]);

  // Metadados de paginação
  const paginationMeta = useMemo(() => ({
    totalItems: sortedClients.length,
    totalPages: Math.ceil(sortedClients.length / pageSize),
    currentPage,
    hasNextPage: currentPage < Math.ceil(sortedClients.length / pageSize),
    hasPrevPage: currentPage > 1,
    startIndex: (currentPage - 1) * pageSize + 1,
    endIndex: Math.min(currentPage * pageSize, sortedClients.length)
  }), [sortedClients.length, currentPage, pageSize]);

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
    allClients: sortedClients,
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
