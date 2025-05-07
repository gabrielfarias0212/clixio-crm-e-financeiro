
import { supabase } from '@/integrations/supabase/client';
import { Client } from '../types';
import { formatDateForSupabase } from './base';
import { fetchClient } from './client-fetch';
import { ClientUpdateData } from './client-types';

/**
 * Updates an existing client in the database
 */
export const updateClient = async (id: string, updates: ClientUpdateData): Promise<Client | null> => {
  const updateData: any = {
    name: updates.name,
    couple_name: updates.coupleName,
    email: updates.email,
    phone: updates.phone,
    wedding_date: updates.weddingDate ? formatDateForSupabase(updates.weddingDate) : undefined,
    contract_value: updates.contractValue,
    status: updates.status,
    next_action: updates.nextAction,
    notes: updates.notes,
    down_payment: updates.downPayment,
    event_category: updates.eventCategory,
    updated_at: new Date().toISOString()
  };

  Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

  const { data, error } = await supabase
    .from('wedding_clients')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating client:', error);
    return null;
  }

  return fetchClient(id);
};
