import { supabase } from "@/integrations/supabase/client";

export type ExpenseCategory =
  | "impostos"
  | "software"
  | "aluguel"
  | "internet"
  | "telefone"
  | "marketing"
  | "equipamento"
  | "contabilidade"
  | "outro";

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; emoji: string }[] = [
  { value: "impostos",      label: "Impostos / DAS",   emoji: "🏛️" },
  { value: "software",      label: "Software / SaaS",  emoji: "💻" },
  { value: "aluguel",       label: "Aluguel / Espaço", emoji: "🏢" },
  { value: "internet",      label: "Internet",          emoji: "📡" },
  { value: "telefone",      label: "Telefone / Plano",  emoji: "📱" },
  { value: "marketing",     label: "Marketing",         emoji: "📣" },
  { value: "equipamento",   label: "Equipamento",       emoji: "📷" },
  { value: "contabilidade", label: "Contabilidade",     emoji: "📊" },
  { value: "outro",         label: "Outro",             emoji: "📌" },
];

export interface BusinessFixedExpense {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  due_date: number | null;
  is_active: boolean;
  category: ExpenseCategory | null;
  created_at: string;
  updated_at: string;
}

export const fetchBusinessFixedExpenses = async (): Promise<BusinessFixedExpense[]> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('business_fixed_expenses')
    .select('*')
    .eq('user_id', user.id)
    .order('due_date', { ascending: true });

  if (error) throw error;
  return data as BusinessFixedExpense[];
};

export const createBusinessFixedExpense = async (
  description: string,
  amount: number,
  dueDate: number | null,
  category: ExpenseCategory | null = null
): Promise<BusinessFixedExpense> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('business_fixed_expenses')
    .insert({ user_id: user.id, description, amount, due_date: dueDate, is_active: true, category })
    .select()
    .single();

  if (error) throw error;
  return data as BusinessFixedExpense;
};

export const updateBusinessFixedExpense = async (
  id: string,
  updates: Partial<Pick<BusinessFixedExpense, 'description' | 'amount' | 'due_date' | 'is_active' | 'category'>>
): Promise<BusinessFixedExpense> => {
  const { data, error } = await supabase
    .from('business_fixed_expenses')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as BusinessFixedExpense;
};

export const deleteBusinessFixedExpense = async (id: string): Promise<void> => {
  const { error } = await supabase.from('business_fixed_expenses').delete().eq('id', id);
  if (error) throw error;
};
