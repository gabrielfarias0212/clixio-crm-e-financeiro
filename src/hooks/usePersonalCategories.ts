
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  fetchPersonalCategories, 
  createPersonalCategory, 
  deletePersonalCategory,
  PersonalCategory,
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORIES
} from "@/utils/supabase/personal-categories";

export type { PersonalCategory };

export function usePersonalCategories() {
  const [customCategories, setCustomCategories] = useState<PersonalCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar categorias personalizadas do banco de dados
  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchPersonalCategories();
      setCustomCategories(data);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      setError('Erro ao carregar categorias');
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  // Carregar categorias na inicialização
  useEffect(() => {
    loadCategories();
  }, []);

  const addCategory = async (name: string, type: 'entrada' | 'saida') => {
    if (!name.trim()) {
      toast.error('Nome da categoria é obrigatório');
      return false;
    }

    // Verificar se a categoria já existe (padrão ou personalizada)
    const allCategories = getCategoriesForType(type);
    if (allCategories.some(cat => cat.toLowerCase() === name.trim().toLowerCase())) {
      toast.error('Esta categoria já existe');
      return false;
    }

    try {
      const newCategory = await createPersonalCategory(name.trim(), type);
      setCustomCategories(prev => [...prev, newCategory]);
      toast.success('Categoria criada com sucesso!');
      return true;
    } catch (err) {
      console.error('Erro ao criar categoria:', err);
      toast.error('Erro ao criar categoria');
      return false;
    }
  };

  const removeCategory = async (categoryId: string) => {
    try {
      await deletePersonalCategory(categoryId);
      setCustomCategories(prev => prev.filter(cat => cat.id !== categoryId));
      toast.success('Categoria removida com sucesso!');
    } catch (err) {
      console.error('Erro ao remover categoria:', err);
      toast.error('Erro ao remover categoria');
    }
  };

  // Obter todas as categorias (padrão + personalizadas) para um tipo específico
  const getCategoriesForType = (type: 'entrada' | 'saida'): string[] => {
    const defaultCategories = type === 'entrada' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;
    const customCategoriesForType = customCategories
      .filter(cat => cat.type === type)
      .map(cat => cat.name);
    
    return [...defaultCategories, ...customCategoriesForType].sort();
  };

  // Obter categorias personalizadas para um tipo específico
  const getCustomCategoriesForType = (type: 'entrada' | 'saida'): PersonalCategory[] => {
    return customCategories.filter(cat => cat.type === type);
  };

  return {
    customCategories,
    loading,
    error,
    addCategory,
    removeCategory,
    getCategoriesForType,
    getCustomCategoriesForType,
    refreshCategories: loadCategories
  };
}
