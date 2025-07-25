
import { supabase } from "@/integrations/supabase/client";
import { Contract, ContractTemplate, ContractFormData } from "@/types/contract";

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

  const contractToInsert = {
    user_id: user.id,
    contractor_name: contractData.contractorName,
    couple_names: contractData.coupleNames,
    data_evento: contractData.eventDate,
    bride_rg: contractData.brideRg,
    groom_rg: contractData.groomRg,
    contractor_address: contractData.contractorAddress,
    contractor_city: contractData.contractorCity,
    event_city: contractData.eventCity,
    event_address: contractData.eventAddress,
    horario_cerimonia: contractData.eventTime,
    guest_count: contractData.guestCount,
    package_name: contractData.packageName,
    included_items: contractData.includedItems,
    payment_method: contractData.paymentMethod,
    amount: contractData.totalPrice,
    contract_type: contractData.eventType,
    status: 'draft',
    contractor_email: contractData.email,
    contractor_phone: contractData.phone
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
  if (contractData.coupleNames) mappedData.couple_names = contractData.coupleNames;
  if (contractData.eventDate) mappedData.data_evento = contractData.eventDate;
  if (contractData.brideRg) mappedData.bride_rg = contractData.brideRg;
  if (contractData.groomRg) mappedData.groom_rg = contractData.groomRg;
  if (contractData.email) mappedData.contractor_email = contractData.email;
  if (contractData.phone) mappedData.contractor_phone = contractData.phone;
  if (contractData.contractorAddress) mappedData.contractor_address = contractData.contractorAddress;
  if (contractData.contractorCity) mappedData.contractor_city = contractData.contractorCity;
  if (contractData.eventCity) mappedData.event_city = contractData.eventCity;
  if (contractData.eventAddress) mappedData.event_address = contractData.eventAddress;
  if (contractData.eventTime) mappedData.horario_cerimonia = contractData.eventTime;
  if (contractData.guestCount) mappedData.guest_count = contractData.guestCount;
  if (contractData.packageName) mappedData.package_name = contractData.packageName;
  if (contractData.includedItems) mappedData.included_items = contractData.includedItems;
  if (contractData.paymentMethod) mappedData.payment_method = contractData.paymentMethod;
  if (contractData.totalPrice) mappedData.amount = contractData.totalPrice;
  if (contractData.eventType) mappedData.contract_type = contractData.eventType;

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
