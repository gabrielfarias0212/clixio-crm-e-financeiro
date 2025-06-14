
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  fetchFinancialCategories,
  createFinancialCategory,
  deleteFinancialCategory,
} from "@/utils/supabase/categories";
import { FinancialCategory, TransactionType } from "@/utils/types";

export function useFinancialCategories() {
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshCategories = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedCategories = await fetchFinancialCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      toast.error("Erro ao carregar categorias financeiras.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  const addCategory = async (name: string, type: TransactionType) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("O nome da categoria não pode ser vazio.");
      return;
    }

    if (categories.some(c => c.name.toLowerCase() === trimmedName.toLowerCase() && c.type === type)) {
      toast.error(`A categoria "${trimmedName}" já existe para este tipo.`);
      return;
    }

    const newCategory = await createFinancialCategory({ name: trimmedName, type });
    if (newCategory) {
      toast.success("Categoria adicionada com sucesso!");
      await refreshCategories();
    } else {
      toast.error("Falha ao adicionar categoria.");
    }
  };

  const removeCategory = async (categoryId: string) => {
    const success = await deleteFinancialCategory(categoryId);
    if (success) {
      toast.success("Categoria removida com sucesso!");
      await refreshCategories();
    } else {
      toast.error("Falha ao remover categoria.");
    }
  };

  return { categories, loading, addCategory, removeCategory, refreshCategories };
}
