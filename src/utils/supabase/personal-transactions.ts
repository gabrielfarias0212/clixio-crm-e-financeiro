
import { supabase } from "@/integrations/supabase/client";

export interface PersonalTransaction {
  id: string;
  user_id: string;
  type: 'entrada' | 'saida';
  amount: number;
  description: string;
  date: string;
  category?: string;
  pro_labore_week_key?: string;
  created_at: string;
  updated_at: string;
}

export const fetchPersonalTransactions = async (): Promise<PersonalTransaction[]> => {
  const { data, error } = await supabase
    .from('personal_transactions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar transações pessoais:', error);
    throw error;
  }

  // Type casting para garantir que o tipo está correto
  return (data || []) as PersonalTransaction[];
};

export const createPersonalTransaction = async (
  type: 'entrada' | 'saida',
  amount: number,
  description: string,
  category?: string,
  proLaboreWeekKey?: string
): Promise<PersonalTransaction> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('Usuário não autenticado');
  }

  const transactionData = {
    user_id: user.id,
    type,
    amount,
    description,
    category,
    pro_labore_week_key: proLaboreWeekKey,
    date: new Date().toISOString().split('T')[0]
  };

  const { data, error } = await supabase
    .from('personal_transactions')
    .insert(transactionData)
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar transação pessoal:', error);
    throw error;
  }

  // Type casting para garantir que o tipo está correto
  return data as PersonalTransaction;
};

export const deletePersonalTransaction = async (transactionId: string): Promise<void> => {
  const { error } = await supabase
    .from('personal_transactions')
    .delete()
    .eq('id', transactionId);

  if (error) {
    console.error('Erro ao remover transação pessoal:', error);
    throw error;
  }
};

// Função para migrar dados do localStorage para o banco
export const migrateLocalStorageToDatabase = async (): Promise<void> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    console.log('Usuário não autenticado, pulando migração');
    return;
  }

  try {
    // Verificar se já existem transações no banco
    const { data: existingTransactions } = await supabase
      .from('personal_transactions')
      .select('id')
      .limit(1);

    if (existingTransactions && existingTransactions.length > 0) {
      console.log('Transações já existem no banco, pulando migração');
      return;
    }

    // Buscar dados do localStorage
    const localData = localStorage.getItem('personalTransactions');
    if (!localData) {
      console.log('Nenhuma transação encontrada no localStorage');
      return;
    }

    const localTransactions = JSON.parse(localData);
    if (!Array.isArray(localTransactions) || localTransactions.length === 0) {
      console.log('Nenhuma transação válida encontrada no localStorage');
      return;
    }

    console.log(`Migrando ${localTransactions.length} transações para o banco de dados...`);

    // Converter dados do localStorage para o formato do banco
    const transactionsToInsert = localTransactions.map((transaction: any) => ({
      user_id: user.id,
      type: transaction.type as 'entrada' | 'saida', // Type casting explícito
      amount: parseFloat(transaction.amount),
      description: transaction.description,
      date: transaction.date ? new Date(transaction.date.split('/').reverse().join('-')).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      category: transaction.category,
      pro_labore_week_key: transaction.proLaboreWeekKey
    }));

    // Inserir no banco de dados
    const { error } = await supabase
      .from('personal_transactions')
      .insert(transactionsToInsert);

    if (error) {
      console.error('Erro durante a migração:', error);
      throw error;
    }

    console.log('Migração concluída com sucesso!');
    
    // Limpar localStorage após migração bem-sucedida
    localStorage.removeItem('personalTransactions');
    console.log('localStorage limpo após migração');

  } catch (error) {
    console.error('Erro durante a migração:', error);
    throw error;
  }
};
