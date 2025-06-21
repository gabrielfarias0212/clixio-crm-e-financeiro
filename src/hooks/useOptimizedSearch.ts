
import { useMemo, useState, useCallback } from 'react';

interface UseOptimizedSearchProps<T> {
  items: T[];
  searchFields: (keyof T)[];
  filters?: Record<string, (item: T) => boolean>;
  sortKey?: keyof T;
  sortDirection?: 'asc' | 'desc';
}

export function useOptimizedSearch<T>({
  items,
  searchFields,
  filters = {},
  sortKey,
  sortDirection = 'desc'
}: UseOptimizedSearchProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, boolean>>({});

  // Memoizar resultados de busca e filtros
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Aplicar filtros personalizados
    Object.entries(activeFilters).forEach(([filterKey, isActive]) => {
      if (isActive && filters[filterKey]) {
        filtered = filtered.filter(filters[filterKey]);
      }
    });

    // Aplicar busca por texto
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return typeof value === 'string' && value.toLowerCase().includes(term);
        })
      );
    }

    // Aplicar ordenação se especificada
    if (sortKey) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        return 0;
      });
    }

    return filtered;
  }, [items, searchTerm, activeFilters, searchFields, filters, sortKey, sortDirection]);

  const toggleFilter = useCallback((filterKey: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setActiveFilters({});
  }, []);

  const hasActiveFilters = useMemo(() => {
    return searchTerm.trim() !== '' || Object.values(activeFilters).some(Boolean);
  }, [searchTerm, activeFilters]);

  return {
    searchTerm,
    setSearchTerm,
    filteredItems,
    toggleFilter,
    clearAllFilters,
    hasActiveFilters,
    resultsCount: filteredItems.length
  };
}
