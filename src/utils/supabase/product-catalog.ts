
import { supabase } from "@/integrations/supabase/client";
import { ProductCatalogItem } from "@/utils/types";

export async function fetchProductCatalog(): Promise<ProductCatalogItem[]> {
  console.log('Fetching product catalog...');
  
  const { data, error } = await (supabase as any)
    .from('product_catalog')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching product catalog:', error);
    throw error;
  }

  return (data as ProductCatalogItem[]) || [];
}

export async function createProductCatalogItem(
  item: Omit<ProductCatalogItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<ProductCatalogItem> {
  console.log('Creating product catalog item:', item);

  const { data, error } = await (supabase as any)
    .from('product_catalog')
    .insert({
      ...item,
      user_id: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating product catalog item:', error);
    throw error;
  }

  return data as ProductCatalogItem;
}

export async function updateProductCatalogItem(
  id: string,
  updates: Partial<Omit<ProductCatalogItem, 'id' | 'user_id' | 'created_at'>>
): Promise<ProductCatalogItem> {
  console.log('Updating product catalog item:', id, updates);

  const { data, error } = await (supabase as any)
    .from('product_catalog')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product catalog item:', error);
    throw error;
  }

  return data as ProductCatalogItem;
}

export async function deleteProductCatalogItem(id: string): Promise<void> {
  console.log('Deleting product catalog item:', id);

  const { error } = await (supabase as any)
    .from('product_catalog')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product catalog item:', error);
    throw error;
  }
}
