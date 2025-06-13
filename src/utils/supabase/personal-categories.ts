
import { supabase } from "@/integrations/supabase/client";

export interface PersonalCategory {
  id: string;
  user_id: string;
  name: string;
  type: 'entrada' | 'saida';
  created_at: string;
}

export const fetchPersonalCategories = async (type?: 'entrada' | 'saida'): Promise<PersonalCategory[]> => {
  let query = supabase
    .from('personal_categories')
    .select('*')
    .order('name', { ascending: true });

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar categorias pessoais:', error);
    throw error;
  }

  return (data || []) as PersonalCategory[];
};

export const createPersonalCategory = async (
  name: string,
  type: 'entrada' | 'saida'
): Promise<PersonalCategory> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('Usuário não autenticado');
  }

  const { data, error } = await supabase
    .from('personal_categories')
    .insert({
      user_id: user.id,
      name: name.trim(),
      type
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar categoria pessoal:', error);
    throw error;
  }

  return data as PersonalCategory;
};

export const deletePersonalCategory = async (categoryId: string): Promise<void> => {
  const { error } = await supabase
    .from('personal_categories')
    .delete()
    .eq('id', categoryId);

  if (error) {
    console.error('Erro ao excluir categoria pessoal:', error);
    throw error;
  }
};

// Categorias padrão do sistema
export const DEFAULT_INCOME_CATEGORIES = [
  'salário',
  'freelance',
  'vendas',
  'investimentos',
  'pró-labore',
  'outros'
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  'alimentação',
  'transporte',
  'moradia',
  'saúde',
  'educação',
  'lazer',
  'compras',
  'outros'
];
