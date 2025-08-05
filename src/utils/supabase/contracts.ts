
import { supabase } from '@/integrations/supabase/client';
import { ContractClause, ContractTemplate, ContractField, ContractVersion, GeneratedContract } from '@/types/contract';

// Contract Clauses
export const fetchContractClauses = async (): Promise<ContractClause[]> => {
  const { data, error } = await supabase
    .from('contract_clauses' as any)
    .select('*')
    .order('category', { ascending: true })
    .order('title', { ascending: true });

  if (error) {
    console.error('Error fetching contract clauses:', error);
    throw error;
  }

  return (data || []) as ContractClause[];
};

export const createContractClause = async (clause: Omit<ContractClause, 'id' | 'created_at' | 'updated_at'>): Promise<ContractClause> => {
  const { data, error } = await supabase
    .from('contract_clauses' as any)
    .insert([clause])
    .select()
    .single();

  if (error) {
    console.error('Error creating contract clause:', error);
    throw error;
  }

  return data as ContractClause;
};

export const updateContractClause = async (id: string, updates: Partial<ContractClause>): Promise<ContractClause> => {
  const { data, error } = await supabase
    .from('contract_clauses' as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating contract clause:', error);
    throw error;
  }

  return data as ContractClause;
};

export const deleteContractClause = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('contract_clauses' as any)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting contract clause:', error);
    throw error;
  }
};

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
    category: template.category || 'custom',
    clauses_order: template.clauses_order || [],
    description: template.description || ''
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
    category: data.category || 'custom',
    clauses_order: data.clauses_order || [],
    description: data.description || ''
  } as ContractTemplate;
};

export const createContractTemplate = async (template: Omit<ContractTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<ContractTemplate> => {
  const { data, error } = await supabase
    .from('contract_templates')
    .insert([template])
    .select()
    .single();

  if (error) {
    console.error('Error creating contract template:', error);
    throw error;
  }

  return {
    ...data,
    category: data.category || 'custom',
    clauses_order: data.clauses_order || [],
    description: data.description || ''
  } as ContractTemplate;
};

export const updateContractTemplate = async (id: string, updates: Partial<ContractTemplate>): Promise<ContractTemplate> => {
  const { data, error } = await supabase
    .from('contract_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating contract template:', error);
    throw error;
  }

  return {
    ...data,
    category: data.category || 'custom',
    clauses_order: data.clauses_order || [],
    description: data.description || ''
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

// Contract Fields
export const fetchContractFields = async (templateId: string): Promise<ContractField[]> => {
  const { data, error } = await supabase
    .from('contract_fields' as any)
    .select('*')
    .eq('template_id', templateId)
    .order('order_position', { ascending: true });

  if (error) {
    console.error('Error fetching contract fields:', error);
    throw error;
  }

  return (data || []) as ContractField[];
};

export const createContractField = async (field: Omit<ContractField, 'id' | 'created_at'>): Promise<ContractField> => {
  const { data, error } = await supabase
    .from('contract_fields' as any)
    .insert([field])
    .select()
    .single();

  if (error) {
    console.error('Error creating contract field:', error);
    throw error;
  }

  return data as ContractField;
};

export const updateContractField = async (id: string, updates: Partial<ContractField>): Promise<ContractField> => {
  const { data, error } = await supabase
    .from('contract_fields' as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating contract field:', error);
    throw error;
  }

  return data as ContractField;
};

export const deleteContractField = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('contract_fields' as any)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting contract field:', error);
    throw error;
  }
};

// Generated Contracts
export const fetchGeneratedContracts = async (): Promise<GeneratedContract[]> => {
  const { data, error } = await supabase
    .from('generated_contracts' as any)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching generated contracts:', error);
    throw error;
  }

  return (data || []) as GeneratedContract[];
};

export const createGeneratedContract = async (contract: Omit<GeneratedContract, 'id' | 'created_at' | 'updated_at'>): Promise<GeneratedContract> => {
  const { data, error } = await supabase
    .from('generated_contracts' as any)
    .insert([contract])
    .select()
    .single();

  if (error) {
    console.error('Error creating generated contract:', error);
    throw error;
  }

  return data as GeneratedContract;
};

export const updateGeneratedContract = async (id: string, updates: Partial<GeneratedContract>): Promise<GeneratedContract> => {
  const { data, error } = await supabase
    .from('generated_contracts' as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating generated contract:', error);
    throw error;
  }

  return data as GeneratedContract;
};

// Contract Versions
export const createContractVersion = async (version: Omit<ContractVersion, 'id' | 'created_at'>): Promise<ContractVersion> => {
  const { data, error } = await supabase
    .from('contract_versions' as any)
    .insert([version])
    .select()
    .single();

  if (error) {
    console.error('Error creating contract version:', error);
    throw error;
  }

  return data as ContractVersion;
};

export const fetchContractVersions = async (templateId: string): Promise<ContractVersion[]> => {
  const { data, error } = await supabase
    .from('contract_versions' as any)
    .select('*')
    .eq('template_id', templateId)
    .order('version_number', { ascending: false });

  if (error) {
    console.error('Error fetching contract versions:', error);
    throw error;
  }

  return (data || []) as ContractVersion[];
};
