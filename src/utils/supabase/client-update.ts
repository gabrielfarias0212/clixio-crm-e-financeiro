
import { supabase } from '@/integrations/supabase/client';
import { Client } from '../types';
import { formatDateForSupabase } from './base';
import { fetchClient } from './client-fetch';
import { ClientUpdateData } from './client-types';

/**
 * Updates an existing client in the database
 */
export const updateClient = async (id: string, updates: ClientUpdateData): Promise<Client | null> => {
  console.log("Attempting to update client with ID:", id);
  console.log("Update data:", updates);

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
    event_location: updates.eventLocation,
    pre_wedding_date: updates.preWeddingDate ? formatDateForSupabase(updates.preWeddingDate) : undefined,
    contract_link: updates.contractLink,
    // Delivery workflow fields
    pre_wedding_scheduled: updates.preWeddingScheduled,
    pre_wedding_completed: updates.preWeddingCompleted,
    pre_wedding_delivered: updates.preWeddingDelivered,
    wedding_photographed: updates.weddingPhotographed,
    in_editing: updates.inEditing,
    link_sent: updates.linkSent,
    box_delivered: updates.boxDelivered,
    album_designed: updates.albumDesigned,
    album_approved_delivered: updates.albumApprovedDelivered,
    updated_at: new Date().toISOString()
  };

  Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

  try {
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

    console.log('Client updated successfully:', data);
    return await fetchClient(id);
  } catch (error) {
    console.error('Exception updating client:', error);
    return null;
  }
};
