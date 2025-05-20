import { supabase } from '@/integrations/supabase/client';
import { Client } from '../types';
import { formatDateForSupabase } from './base';
import { parseClient } from './client-parsers';
import { ClientCreateData } from './client-types';

export const createClient = async (clientData: ClientCreateData): Promise<Client | null> => {
  console.log('Creating client with data:', clientData);
  
  try {
    const { data, error } = await supabase
      .from('wedding_clients')
      .insert({
        name: clientData.name,
        couple_name: clientData.coupleName,
        email: clientData.email,
        phone: clientData.phone,
        wedding_date: clientData.weddingDate ? formatDateForSupabase(clientData.weddingDate) : null,
        wedding_start_time: clientData.weddingStartTime,
        wedding_end_time: clientData.weddingEndTime,
        contract_value: clientData.contractValue,
        status: clientData.status,
        next_action: clientData.nextAction,
        notes: clientData.notes,
        down_payment: clientData.downPayment,
        event_category: clientData.eventCategory,
        event_location: clientData.eventLocation,
        pre_wedding_date: clientData.preWeddingDate ? formatDateForSupabase(clientData.preWeddingDate) : null,
        pre_wedding_start_time: clientData.preWeddingStartTime,
        pre_wedding_end_time: clientData.preWeddingEndTime,
        contract_link: clientData.contractLink,
        has_pre_wedding: clientData.hasPreWedding !== false, // Default to true if undefined
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating client:', error);
      return null;
    }
    
    console.log('Client created successfully:', data);
    
    // Return the created client with the correct structure
    return parseClient({
      ...data,
      payments: []
    });
  } catch (error) {
    console.error('Exception creating client:', error);
    return null;
  }
};
