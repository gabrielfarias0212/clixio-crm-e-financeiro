
import { supabase } from "@/integrations/supabase/client";
import { Contract, ContractTemplate, ContractFormData, ContractClause } from "@/types/contract";
import { createClientFromContract } from "./client-from-contract";

export const fetchContracts = async (): Promise<Contract[]> => {
  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching contracts:', error);
    throw error;
  }

  // Mapear os dados do banco para a interface Contract
  const mappedData: Contract[] = (data || []).map(contract => ({
    ...contract,
    contract_number: 0, // Default value since it doesn't exist in DB
    rg: contract.rg_noiva || contract.rg_noivo || '',
    cpf: contract.cpf_noiva || contract.cpf_noivo || ''
  }));

  return mappedData;
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

  if (!data) return null;

  // Mapear os dados do banco para a interface Contract
  const mappedData: Contract = {
    ...data,
    contract_number: 0, // Default value since it doesn't exist in DB
    rg: data.rg_noiva || data.rg_noivo || '',
    cpf: data.cpf_noiva || data.cpf_noivo || ''
  };

  return mappedData;
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
    rg_noiva: contractData.rg,
    rg_noivo: contractData.rg,
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

  // Mapear os dados retornados para a interface Contract
  const mappedData: Contract = {
    ...data,
    contract_number: 0, // Default value since it doesn't exist in DB
    rg: data.rg_noiva || data.rg_noivo || '',
    cpf: data.cpf_noiva || data.cpf_noivo || ''
  };

  return mappedData;
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
  if (contractData.rg) {
    mappedData.rg_noiva = contractData.rg;
    mappedData.rg_noivo = contractData.rg;
  }
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

  // Mapear os dados retornados para a interface Contract
  const mappedResponse: Contract = {
    ...data,
    contract_number: 0, // Default value since it doesn't exist in DB
    rg: data.rg_noiva || data.rg_noivo || '',
    cpf: data.cpf_noiva || data.cpf_noivo || ''
  };

  return mappedResponse;
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

// Funções temporárias para cláusulas de contrato - usando mock data até a tabela ser criada no Supabase
export const fetchContractClauses = async (): Promise<ContractClause[]> => {
  // Mock data até a tabela contract_clauses ser reconhecida pelo Supabase
  const mockClauses: ContractClause[] = [
    {
      id: '1',
      user_id: 'temp',
      title: 'OBJETO DO CONTRATO',
      content: 'A CONTRATADA prestará ao CONTRATANTE os serviços de cobertura fotográfica para o evento acima descrito, respeitando os padrões técnicos e artísticos da empresa.',
      clause_order: 1,
      is_required: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      user_id: 'temp',
      title: 'EXCLUSIVIDADE',
      content: 'A equipe da Gabriel Farias Fotografias será a única responsável pela cobertura do evento. A contratação de outro profissional sem consentimento resultará na rescisão do contrato e retenção de 30% do valor.',
      clause_order: 2,
      is_required: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      user_id: 'temp',
      title: 'VALOR E FORMA DE PAGAMENTO',
      content: 'Valor total: {{precoTotal}}\nForma de pagamento: {{formaPagamento}}\n*A hora extra, se houver, será cobrada à parte no valor de R$ 600,00 por hora ou fração superior a 30 minutos.*',
      clause_order: 3,
      is_required: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  return mockClauses;
};

export const createContractClause = async (
  title: string, 
  content: string, 
  clauseOrder: number, 
  isRequired: boolean = false
): Promise<ContractClause> => {
  // Mock implementation
  const mockClause: ContractClause = {
    id: Date.now().toString(),
    user_id: 'temp',
    title,
    content,
    clause_order: clauseOrder,
    is_required: isRequired,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  return mockClause;
};

export const updateContractClause = async (
  id: string, 
  title: string, 
  content: string, 
  clauseOrder: number, 
  isRequired: boolean
): Promise<ContractClause> => {
  // Mock implementation
  const mockClause: ContractClause = {
    id,
    user_id: 'temp',
    title,
    content,
    clause_order: clauseOrder,
    is_required: isRequired,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  return mockClause;
};

export const deleteContractClause = async (id: string): Promise<void> => {
  // Mock implementation
  console.log('Deleting clause:', id);
};

export const reorderContractClauses = async (clauses: { id: string; order: number }[]): Promise<void> => {
  // Mock implementation
  console.log('Reordering clauses:', clauses);
};

// Export createClientFromContract function
export { createClientFromContract };
