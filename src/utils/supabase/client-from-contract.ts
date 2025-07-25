
import { supabase } from "@/integrations/supabase/client";
import { ContractFormData } from "@/types/contract";

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
