
import { supabase } from '@/integrations/supabase/client';
import { ContractFormSubmission, ContractFormInput } from '@/utils/types';
import { parseContractForm, formatContractFormInput } from './parsers';
import { toast } from 'sonner';

// Create a contract form for a client and get the access token
export const createContractFormForClient = async (clientId: string): Promise<string | null> => {
  try {
    console.log('Creating contract form for client:', clientId);
    
    const { data, error } = await supabase
      .rpc('create_contract_form_for_client', {
        client_id_param: clientId
      });
    
    if (error) {
      console.error('Error creating contract form:', error);
      toast.error('Falha ao criar formulário de contrato');
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception creating contract form:', error);
    toast.error('Falha ao criar formulário de contrato');
    return null;
  }
};

// Get a contract form by its access token
export const getContractFormByToken = async (token: string): Promise<ContractFormSubmission | null> => {
  try {
    const { data, error } = await supabase
      .from('contract_form_submissions')
      .select('*, wedding_clients(name, email, phone)')
      .eq('access_token', token)
      .single();
    
    if (error) {
      console.error('Error fetching contract form:', error);
      return null;
    }
    
    return parseContractForm(data);
  } catch (error) {
    console.error('Exception fetching contract form:', error);
    return null;
  }
};

// Get a contract form by client ID
export const getContractFormByClientId = async (clientId: string): Promise<ContractFormSubmission | null> => {
  try {
    const { data, error } = await supabase
      .from('contract_form_submissions')
      .select('*')
      .eq('client_id', clientId)
      .single();
    
    if (error) {
      console.error('Error fetching contract form:', error);
      return null;
    }
    
    return parseContractForm(data);
  } catch (error) {
    console.error('Exception fetching contract form:', error);
    return null;
  }
};

// Submit or update a contract form
export const submitContractForm = async (
  token: string, 
  formData: ContractFormInput
): Promise<boolean> => {
  try {
    const formattedData = {
      ...formatContractFormInput({
        ...formData,
        id: '',
        clientId: '',
        createdAt: '',
        updatedAt: '',
        accessToken: token,
        formStatus: 'completed'
      }),
      form_status: 'completed'
    };
    
    const { error } = await supabase
      .from('contract_form_submissions')
      .update(formattedData)
      .eq('access_token', token);
    
    if (error) {
      console.error('Error updating contract form:', error);
      toast.error('Falha ao atualizar formulário de contrato');
      return false;
    }
    
    toast.success('Formulário enviado com sucesso!');
    return true;
  } catch (error) {
    console.error('Exception updating contract form:', error);
    toast.error('Falha ao atualizar formulário de contrato');
    return false;
  }
};

// Update the status of a contract form
export const updateFormStatus = async (
  formId: string, 
  status: 'pending' | 'completed' | 'approved'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('contract_form_submissions')
      .update({ form_status: status })
      .eq('id', formId);
    
    if (error) {
      console.error('Error updating form status:', error);
      toast.error('Falha ao atualizar status do formulário');
      return false;
    }
    
    toast.success('Status atualizado com sucesso!');
    return true;
  } catch (error) {
    console.error('Exception updating form status:', error);
    toast.error('Falha ao atualizar status do formulário');
    return false;
  }
};

// Export form data to Excel format
export const exportFormToExcel = (formData: ContractFormSubmission): void => {
  import('xlsx').then((XLSX) => {
    const worksheet = XLSX.utils.json_to_sheet([{
      'Nome da Noiva': formData.brideName,
      'Nome do Noivo': formData.groomName,
      'RG da Contratante': formData.brideId,
      'CPF da Contratante': formData.brideCpf,
      'Telefone': formData.contactPhone,
      'Email': formData.contactEmail,
      'Endereço Completo': formData.completeAddress,
      'Data do Evento': formData.eventDate,
      'Horário do Evento': formData.eventTime,
      'Local do Evento': formData.eventLocation,
      'Endereço do Evento': formData.eventAddress,
      'Pacote Contratado': formData.contractedPackage,
      'Equipe de Cerimonial': formData.ceremonialTeam || 'Não informado',
      'Exclusividade': formData.hasExclusivity ? 'Sim' : 'Não',
      'Valor Total': formData.totalValue,
      'Forma de Pagamento': formData.paymentMethod,
      'Parcelamento': formData.installmentsInfo || 'Não parcelado',
      'Data Pagamento Final': formData.finalPaymentDate || 'Não informado',
      'Observações': formData.observations || 'Nenhuma observação',
      'Autoriza uso em Portfólio': formData.allowsPortfolioUsage ? 'Sim' : 'Não',
      'Aceitou Termos': formData.acceptsTerms ? 'Sim' : 'Não',
      'Status do Formulário': formData.formStatus
    }]);
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contrato');
    
    const clientName = formData.brideName.split(' ')[0];
    XLSX.writeFile(workbook, `Contrato_${clientName}_${new Date().toLocaleDateString()}.xlsx`);
  });
};
