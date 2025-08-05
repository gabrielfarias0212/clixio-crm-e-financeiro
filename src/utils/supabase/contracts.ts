
import { supabase } from '@/integrations/supabase/client';
import { ContractTemplate, GeneratedContract } from '@/types/contract';

// Contract Templates
export const fetchContractTemplates = async (): Promise<ContractTemplate[]> => {
  const { data, error } = await supabase
    .from('contract_templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching contract templates:', error);
    throw error;
  }

  return (data || []).map(template => ({
    ...template,
    category: 'custom', // Default category since it doesn't exist in DB
    clauses_order: [], // Default empty array since it doesn't exist in DB
    description: template.name // Use name as description fallback
  })) as ContractTemplate[];
};

export const fetchContractTemplate = async (id: string): Promise<ContractTemplate | null> => {
  const { data, error } = await supabase
    .from('contract_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching contract template:', error);
    return null;
  }

  return {
    ...data,
    category: 'custom', // Default category since it doesn't exist in DB
    clauses_order: [], // Default empty array since it doesn't exist in DB
    description: data.name // Use name as description fallback
  } as ContractTemplate;
};

export const createContractTemplate = async (template: Omit<ContractTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<ContractTemplate> => {
  // Only include fields that exist in the actual database schema
  const templateData = {
    user_id: template.user_id,
    name: template.name,
    content: template.content,
    is_default: template.is_default
  };

  const { data, error } = await supabase
    .from('contract_templates')
    .insert([templateData])
    .select()
    .single();

  if (error) {
    console.error('Error creating contract template:', error);
    throw error;
  }

  return {
    ...data,
    category: 'custom', // Default category
    clauses_order: [], // Default empty array
    description: data.name // Use name as description
  } as ContractTemplate;
};

export const updateContractTemplate = async (id: string, updates: Partial<ContractTemplate>): Promise<ContractTemplate> => {
  // Only include fields that exist in the actual database schema
  const allowedUpdates: any = {};
  if (updates.name !== undefined) allowedUpdates.name = updates.name;
  if (updates.content !== undefined) allowedUpdates.content = updates.content;
  if (updates.is_default !== undefined) allowedUpdates.is_default = updates.is_default;

  const { data, error } = await supabase
    .from('contract_templates')
    .update(allowedUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating contract template:', error);
    throw error;
  }

  return {
    ...data,
    category: 'custom', // Default category
    clauses_order: [], // Default empty array
    description: data.name // Use name as description
  } as ContractTemplate;
};

export const deleteContractTemplate = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('contract_templates')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting contract template:', error);
    throw error;
  }
};

// Generated Contracts - using contracts table that exists
export const fetchGeneratedContracts = async (): Promise<GeneratedContract[]> => {
  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching generated contracts:', error);
    throw error;
  }

  // Transform contracts table data to match GeneratedContract interface
  return (data || []).map(contract => ({
    id: contract.id,
    user_id: contract.user_id || '',
    template_id: contract.template_id || '',
    client_id: contract.client_id || '',
    title: contract.title || contract.contract_type || 'Untitled Contract',
    filled_data: {
      bride_name: contract.nome_noiva,
      groom_name: contract.nome_noivo,
      event_date: contract.data_evento,
      amount: contract.amount
    },
    pdf_url: contract.pdf_url,
    status: contract.status as 'draft' | 'completed' | 'sent' | 'signed' || 'draft',
    created_at: contract.created_at || new Date().toISOString(),
    updated_at: contract.created_at || new Date().toISOString()
  })) as GeneratedContract[];
};

export const createGeneratedContract = async (contract: Omit<GeneratedContract, 'id' | 'created_at' | 'updated_at'>): Promise<GeneratedContract> => {
  // Transform GeneratedContract data to contracts table format with all required fields
  const contractData = {
    user_id: contract.user_id,
    template_id: contract.template_id,
    client_id: contract.client_id,
    title: contract.title,
    status: contract.status,
    pdf_url: contract.pdf_url,
    contract_type: 'wedding',
    amount: contract.filled_data.amount || 0,
    nome_noiva: contract.filled_data.bride_name || '',
    nome_noivo: contract.filled_data.groom_name || '',
    data_evento: contract.filled_data.event_date || new Date().toISOString().split('T')[0],
    // Required fields with default values
    cidade_evento: 'A definir',
    local_cerimonia: 'A definir',
    endereco: 'A definir',
    cpf_noiva: '000.000.000-00',
    cpf_noivo: '000.000.000-00',
    rg_noiva: '00.000.000-0',
    rg_noivo: '00.000.000-0',
    qtd_convidados: 100,
    horario_cerimonia: '18:00:00',
    telefone_contato: '(00) 00000-0000',
    email_contato: 'contato@email.com'
  };

  const { data, error } = await supabase
    .from('contracts')
    .insert([contractData])
    .select()
    .single();

  if (error) {
    console.error('Error creating generated contract:', error);
    throw error;
  }

  // Transform back to GeneratedContract format
  return {
    id: data.id,
    user_id: data.user_id || '',
    template_id: data.template_id || '',
    client_id: data.client_id || '',
    title: data.title || 'Untitled Contract',
    filled_data: {
      bride_name: data.nome_noiva,
      groom_name: data.nome_noivo,
      event_date: data.data_evento,
      amount: data.amount
    },
    pdf_url: data.pdf_url,
    status: data.status as 'draft' | 'completed' | 'sent' | 'signed' || 'draft',
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.created_at || new Date().toISOString()
  } as GeneratedContract;
};

export const updateGeneratedContract = async (id: string, updates: Partial<GeneratedContract>): Promise<GeneratedContract> => {
  // Transform updates to contracts table format
  const contractUpdates: any = {};
  if (updates.title !== undefined) contractUpdates.title = updates.title;
  if (updates.status !== undefined) contractUpdates.status = updates.status;
  if (updates.pdf_url !== undefined) contractUpdates.pdf_url = updates.pdf_url;
  if (updates.filled_data) {
    if (updates.filled_data.bride_name !== undefined) contractUpdates.nome_noiva = updates.filled_data.bride_name;
    if (updates.filled_data.groom_name !== undefined) contractUpdates.nome_noivo = updates.filled_data.groom_name;
    if (updates.filled_data.event_date !== undefined) contractUpdates.data_evento = updates.filled_data.event_date;
    if (updates.filled_data.amount !== undefined) contractUpdates.amount = updates.filled_data.amount;
  }

  const { data, error } = await supabase
    .from('contracts')
    .update(contractUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating generated contract:', error);
    throw error;
  }

  // Transform back to GeneratedContract format
  return {
    id: data.id,
    user_id: data.user_id || '',
    template_id: data.template_id || '',
    client_id: data.client_id || '',
    title: data.title || 'Untitled Contract',
    filled_data: {
      bride_name: data.nome_noiva,
      groom_name: data.nome_noivo,
      event_date: data.data_evento,
      amount: data.amount
    },
    pdf_url: data.pdf_url,
    status: data.status as 'draft' | 'completed' | 'sent' | 'signed' || 'draft',
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.created_at || new Date().toISOString()
  } as GeneratedContract;
};

// Placeholder functions for non-existing tables - these will return empty arrays/null
export const fetchContractClauses = async () => {
  console.warn('Contract clauses table does not exist in database');
  return [];
};

export const createContractClause = async (clause: any) => {
  console.warn('Contract clauses table does not exist in database');
  throw new Error('Contract clauses feature not available');
};

export const updateContractClause = async (id: string, updates: any) => {
  console.warn('Contract clauses table does not exist in database');
  throw new Error('Contract clauses feature not available');
};

export const deleteContractClause = async (id: string) => {
  console.warn('Contract clauses table does not exist in database');
  throw new Error('Contract clauses feature not available');
};

export const fetchContractFields = async (templateId: string) => {
  console.warn('Contract fields table does not exist in database');
  return [];
};

export const createContractField = async (field: any) => {
  console.warn('Contract fields table does not exist in database');
  throw new Error('Contract fields feature not available');
};

export const updateContractField = async (id: string, updates: any) => {
  console.warn('Contract fields table does not exist in database');
  throw new Error('Contract fields feature not available');
};

export const deleteContractField = async (id: string) => {
  console.warn('Contract fields table does not exist in database');
  throw new Error('Contract fields feature not available');
};

export const createContractVersion = async (version: any) => {
  console.warn('Contract versions table does not exist in database');
  throw new Error('Contract versions feature not available');
};

export const fetchContractVersions = async (templateId: string) => {
  console.warn('Contract versions table does not exist in database');
  return [];
};
