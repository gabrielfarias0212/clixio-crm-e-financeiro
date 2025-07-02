
import { supabase } from "@/integrations/supabase/client";
import { ServiceCatalogItem } from "@/utils/types";

export async function fetchServiceCatalog(): Promise<ServiceCatalogItem[]> {
  console.log('Fetching service catalog...');
  
  const { data, error } = await (supabase as any)
    .from('service_catalog')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching service catalog:', error);
    throw error;
  }

  return (data as ServiceCatalogItem[]) || [];
}

export async function createServiceCatalogItem(
  item: Omit<ServiceCatalogItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<ServiceCatalogItem> {
  console.log('Creating service catalog item:', item);

  const { data, error } = await (supabase as any)
    .from('service_catalog')
    .insert({
      ...item,
      user_id: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating service catalog item:', error);
    throw error;
  }

  return data as ServiceCatalogItem;
}

export async function updateServiceCatalogItem(
  id: string,
  updates: Partial<Omit<ServiceCatalogItem, 'id' | 'user_id' | 'created_at'>>
): Promise<ServiceCatalogItem> {
  console.log('Updating service catalog item:', id, updates);

  const { data, error } = await (supabase as any)
    .from('service_catalog')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating service catalog item:', error);
    throw error;
  }

  return data as ServiceCatalogItem;
}

export async function deleteServiceCatalogItem(id: string): Promise<void> {
  console.log('Deleting service catalog item:', id);

  const { error } = await (supabase as any)
    .from('service_catalog')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting service catalog item:', error);
    throw error;
  }
}
