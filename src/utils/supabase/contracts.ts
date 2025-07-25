
import { supabase } from "@/integrations/supabase/client";
import { Contract, ContractTemplate, ContractFormData, ContractClause } from "@/types/contract";

export const fetchContracts = async (): Promise<Contract[]> => {
  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching contracts:', error);
    throw error;
  }

  return data || [];
};

export const fetchContract = async (id: string): Promise<Contract | null> => {
  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching contract:', error);
    throw error;
  }

  return data;
};

export const createContract = async (contractData: ContractFormData): Promise<Contract> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Split the couple names to get bride and groom names
  const coupleNamesArray = contractData.coupleNames.split(' e ').map(name => name.trim());
  const brideName = coupleNamesArray[0] || '';
  const groomName = coupleNamesArray[1] || '';

  const contractToInsert = {
    user_id: user.id,
    contractor_name: contractData.contractorName,
    couple_names: contractData.coupleNames,
    nome_noiva: brideName,
    nome_noivo: groomName,
    data_evento: contractData.eventDate,
    rg: contractData.rg,
    cpf_noiva: contractData.cpf || '',
    cpf_noivo: contractData.cpf || '',
    contractor_address: contractData.contractorAddress,
    contractor_city: contractData.contractorCity,
    endereco: contractData.contractorAddress,
    event_city: contractData.eventCity,
    cidade_evento: contractData.eventCity,
    event_address: contractData.eventAddress,
    local_cerimonia: contractData.eventAddress,
    horario_cerimonia: contractData.eventTime,
    guest_count: contractData.guestCount,
    qtd_convidados: contractData.guestCount,
    package_name: contractData.packageName,
    included_items: contractData.includedItems,
    payment_method: contractData.paymentMethod,
    amount: contractData.totalPrice,
    contract_type: contractData.eventType,
    status: 'draft',
    contractor_email: contractData.email,
    contractor_phone: contractData.phone,
    email_contato: contractData.email,
    telefone_contato: contractData.phone,
    ceremonial_team: contractData.ceremonialTeam || null
  };

  const { data, error } = await supabase
    .from('contracts')
    .insert(contractToInsert)
    .select()
    .single();

  if (error) {
    console.error('Error creating contract:', error);
    throw error;
  }

  // Criar cliente automaticamente
  await createClientFromContract(contractData);

  return data;
};

export const createClientFromContract = async (contractData: ContractFormData) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Verificar se cliente já existe
  const { data: existingClient } = await supabase
    .from('wedding_clients')
    .select('id')
    .eq('email', contractData.email)
    .single();

  if (existingClient) {
    // Atualizar cliente existente
    await supabase
      .from('wedding_clients')
      .update({
        name: contractData.contractorName,
        couple_name: contractData.coupleNames,
        phone: contractData.phone,
        wedding_date: contractData.eventDate,
        event_category: contractData.eventType,
        status: 'Contrato Gerado',
        contract_value: contractData.totalPrice,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingClient.id);
  } else {
    // Criar novo cliente
    await supabase
      .from('wedding_clients')
      .insert([{
        name: contractData.contractorName,
        couple_name: contractData.coupleNames,
        email: contractData.email,
        phone: contractData.phone,
        wedding_date: contractData.eventDate,
        event_category: contractData.eventType,
        status: 'Contrato Gerado',
        contract_value: contractData.totalPrice,
        sales_funnel_stage: 'contrato_enviado'
      }]);
  }
};

export const updateContract = async (id: string, contractData: Partial<ContractFormData>): Promise<Contract> => {
  // Mapear os campos do ContractFormData para os campos do banco
  const mappedData: any = {};
  
  if (contractData.contractorName) mappedData.contractor_name = contractData.contractorName;
  if (contractData.coupleNames) {
    mappedData.couple_names = contractData.coupleNames;
    const coupleNamesArray = contractData.coupleNames.split(' e ').map(name => name.trim());
    mappedData.nome_noiva = coupleNamesArray[0] || '';
    mappedData.nome_noivo = coupleNamesArray[1] || '';
  }
  if (contractData.eventDate) mappedData.data_evento = contractData.eventDate;
  if (contractData.rg) mappedData.rg = contractData.rg;
  if (contractData.cpf) {
    mappedData.cpf_noiva = contractData.cpf;
    mappedData.cpf_noivo = contractData.cpf;
  }
  if (contractData.email) {
    mappedData.contractor_email = contractData.email;
    mappedData.email_contato = contractData.email;
  }
  if (contractData.phone) {
    mappedData.contractor_phone = contractData.phone;
    mappedData.telefone_contato = contractData.phone;
  }
  if (contractData.contractorAddress) {
    mappedData.contractor_address = contractData.contractorAddress;
    mappedData.endereco = contractData.contractorAddress;
  }
  if (contractData.contractorCity) mappedData.contractor_city = contractData.contractorCity;
  if (contractData.eventCity) {
    mappedData.event_city = contractData.eventCity;
    mappedData.cidade_evento = contractData.eventCity;
  }
  if (contractData.eventAddress) {
    mappedData.event_address = contractData.eventAddress;
    mappedData.local_cerimonia = contractData.eventAddress;
  }
  if (contractData.eventTime) mappedData.horario_cerimonia = contractData.eventTime;
  if (contractData.guestCount) {
    mappedData.guest_count = contractData.guestCount;
    mappedData.qtd_convidados = contractData.guestCount;
  }
  if (contractData.packageName) mappedData.package_name = contractData.packageName;
  if (contractData.includedItems) mappedData.included_items = contractData.includedItems;
  if (contractData.paymentMethod) mappedData.payment_method = contractData.paymentMethod;
  if (contractData.totalPrice) mappedData.amount = contractData.totalPrice;
  if (contractData.eventType) mappedData.contract_type = contractData.eventType;
  if (contractData.ceremonialTeam !== undefined) mappedData.ceremonial_team = contractData.ceremonialTeam;

  const { data, error } = await supabase
    .from('contracts')
    .update(mappedData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating contract:', error);
    throw error;
  }

  return data;
};

export const deleteContract = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('contracts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting contract:', error);
    throw error;
  }
};

export const fetchContractTemplates = async (): Promise<ContractTemplate[]> => {
  const { data, error } = await supabase
    .from('contract_templates')
    .select('*')
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching contract templates:', error);
    throw error;
  }

  return data || [];
};

export const createContractTemplate = async (name: string, content: string, isDefault: boolean = false): Promise<ContractTemplate> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('contract_templates')
    .insert([{
      user_id: user.id,
      name,
      content,
      is_default: isDefault
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating contract template:', error);
    throw error;
  }

  return data;
};

export const updateContractTemplate = async (id: string, name: string, content: string): Promise<ContractTemplate> => {
  const { data, error } = await supabase
    .from('contract_templates')
    .update({ name, content })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating contract template:', error);
    throw error;
  }

  return data;
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

// Funções para gerenciar cláusulas de contrato
export const fetchContractClauses = async (): Promise<ContractClause[]> => {
  const { data, error } = await supabase
    .from('contract_clauses')
    .select('*')
    .order('clause_order', { ascending: true });

  if (error) {
    console.error('Error fetching contract clauses:', error);
    throw error;
  }

  return data || [];
};

export const createContractClause = async (
  title: string, 
  content: string, 
  clauseOrder: number, 
  isRequired: boolean = false
): Promise<ContractClause> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('contract_clauses')
    .insert([{
      user_id: user.id,
      title,
      content,
      clause_order: clauseOrder,
      is_required: isRequired
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating contract clause:', error);
    throw error;
  }

  return data;
};

export const updateContractClause = async (
  id: string, 
  title: string, 
  content: string, 
  clauseOrder: number, 
  isRequired: boolean
): Promise<ContractClause> => {
  const { data, error } = await supabase
    .from('contract_clauses')
    .update({ 
      title, 
      content, 
      clause_order: clauseOrder, 
      is_required: isRequired 
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating contract clause:', error);
    throw error;
  }

  return data;
};

export const deleteContractClause = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('contract_clauses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting contract clause:', error);
    throw error;
  }
};

export const reorderContractClauses = async (clauses: { id: string; order: number }[]): Promise<void> => {
  const updates = clauses.map(clause => 
    supabase
      .from('contract_clauses')
      .update({ clause_order: clause.order })
      .eq('id', clause.id)
  );

  const results = await Promise.all(updates);
  
  const errors = results.filter(result => result.error);
  if (errors.length > 0) {
    console.error('Error reordering contract clauses:', errors);
    throw new Error('Failed to reorder clauses');
  }
};
