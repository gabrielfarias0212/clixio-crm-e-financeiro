
import { useState, useEffect } from 'react';
import { ServiceCatalogItem } from '@/utils/types';
import {
  fetchServiceCatalog,
  createServiceCatalogItem,
  updateServiceCatalogItem,
  deleteServiceCatalogItem
} from '@/utils/supabase/service-catalog';
import { toast } from 'sonner';

export function useServiceCatalog() {
  const [services, setServices] = useState<ServiceCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchServiceCatalog();
      setServices(data);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Falha ao carregar catálogo de serviços');
      toast.error('Falha ao carregar catálogo de serviços');
    } finally {
      setLoading(false);
    }
  };

  const addService = async (
    serviceData: Omit<ServiceCatalogItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      const newService = await createServiceCatalogItem(serviceData);
      setServices(prev => [newService, ...prev]);
      toast.success('Serviço adicionado com sucesso!');
      return newService;
    } catch (err) {
      console.error('Error adding service:', err);
      toast.error('Falha ao adicionar serviço');
      throw err;
    }
  };

  const updateService = async (
    id: string,
    updates: Partial<Omit<ServiceCatalogItem, 'id' | 'user_id' | 'created_at'>>
  ) => {
    try {
      const updatedService = await updateServiceCatalogItem(id, updates);
      setServices(prev => prev.map(service => 
        service.id === id ? updatedService : service
      ));
      toast.success('Serviço atualizado com sucesso!');
      return updatedService;
    } catch (err) {
      console.error('Error updating service:', err);
      toast.error('Falha ao atualizar serviço');
      throw err;
    }
  };

  const removeService = async (id: string) => {
    try {
      await deleteServiceCatalogItem(id);
      setServices(prev => prev.filter(service => service.id !== id));
      toast.success('Serviço removido com sucesso!');
    } catch (err) {
      console.error('Error removing service:', err);
      toast.error('Falha ao remover serviço');
      throw err;
    }
  };

  useEffect(() => {
    refreshServices();
  }, []);

  return {
    services,
    loading,
    error,
    refreshServices,
    addService,
    updateService,
    removeService
  };
}
