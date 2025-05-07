
import { supabase } from '@/integrations/supabase/client';
import { FinancialCategory } from '../types';

export const fetchFinancialCategories = async (): Promise<FinancialCategory[]> => {
  const { data, error } = await supabase
    .from('financial_categories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar categorias financeiras:', error);
    return [];
  }
  return (data || []).map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    type: cat.type,
    createdAt: cat.created_at ? new Date(cat.created_at) : new Date(),
  }));
};

export const createFinancialCategory = async ({
  name,
  type,
  photographer_id = '00000000-0000-0000-0000-000000000000',
}: { name: string; type: "entrada" | "saída"; photographer_id?: string }) => {
  try {
    console.log('Criando categoria financeira:', { name, type, photographer_id });
    
    const { data, error } = await supabase
      .from('financial_categories')
      .insert([
        {
          name,
          type,
          photographer_id
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar categoria financeira:', error);
      return null;
    }
    
    console.log('Categoria financeira criada com sucesso:', data);
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    } as FinancialCategory;
  } catch (error) {
    console.error('Exceção ao criar categoria financeira:', error);
    return null;
  }
};
