
import { useState, useEffect } from 'react';
import { ProductCatalogItem } from '@/utils/types';
import {
  fetchProductCatalog,
  createProductCatalogItem,
  updateProductCatalogItem,
  deleteProductCatalogItem
} from '@/utils/supabase/product-catalog';
import { toast } from 'sonner';

export function useProductCatalog() {
  const [products, setProducts] = useState<ProductCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProductCatalog();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Falha ao carregar catálogo de produtos');
      toast.error('Falha ao carregar catálogo de produtos');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (
    productData: Omit<ProductCatalogItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      const newProduct = await createProductCatalogItem(productData);
      setProducts(prev => [newProduct, ...prev]);
      toast.success('Produto adicionado com sucesso!');
      return newProduct;
    } catch (err) {
      console.error('Error adding product:', err);
      toast.error('Falha ao adicionar produto');
      throw err;
    }
  };

  const updateProduct = async (
    id: string,
    updates: Partial<Omit<ProductCatalogItem, 'id' | 'user_id' | 'created_at'>>
  ) => {
    try {
      const updatedProduct = await updateProductCatalogItem(id, updates);
      setProducts(prev => prev.map(product => 
        product.id === id ? updatedProduct : product
      ));
      toast.success('Produto atualizado com sucesso!');
      return updatedProduct;
    } catch (err) {
      console.error('Error updating product:', err);
      toast.error('Falha ao atualizar produto');
      throw err;
    }
  };

  const removeProduct = async (id: string) => {
    try {
      await deleteProductCatalogItem(id);
      setProducts(prev => prev.filter(product => product.id !== id));
      toast.success('Produto removido com sucesso!');
    } catch (err) {
      console.error('Error removing product:', err);
      toast.error('Falha ao remover produto');
      throw err;
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  return {
    products,
    loading,
    error,
    refreshProducts,
    addProduct,
    updateProduct,
    removeProduct
  };
}
