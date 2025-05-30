
import { supabase } from '@/integrations/supabase/client';
import { Client } from '../types';
import { formatDateForSupabase } from './base';

export const updateClient = async (id: string, clientData: Partial<Client>): Promise<Client | null> => {
  try {
    // Automatically set preWeddingScheduled based on preWeddingDate
    const updatedData = {
      ...clientData,
      pre_wedding_scheduled: !!clientData.preWeddingDate // true if date exists, false if null/empty
    };

    const { data, error } = await supabase
      .from('wedding_clients')
      .update({
        name: updatedData.name,
        email: updatedData.email,
        phone: updatedData.phone,
        couple_name: updatedData.coupleName,
        wedding_date: updatedData.weddingDate ? formatDateForSupabase(updatedData.weddingDate) : null,
        wedding_start_time: updatedData.weddingStartTime,
        wedding_end_time: updatedData.weddingEndTime,
        contract_value: updatedData.contractValue,
        down_payment: updatedData.downPayment,
        status: updatedData.status,
        next_action: updatedData.nextAction,
        event_category: updatedData.eventCategory,
        event_location: updatedData.eventLocation,
        pre_wedding_date: updatedData.preWeddingDate ? formatDateForSupabase(updatedData.preWeddingDate) : null,
        pre_wedding_start_time: updatedData.preWeddingStartTime,
        pre_wedding_end_time: updatedData.preWeddingEndTime,
        pre_wedding_scheduled: updatedData.pre_wedding_scheduled,
        contract_link: updatedData.contractLink,
        has_pre_wedding: updatedData.hasPreWedding,
        notes: updatedData.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating client:', error);
      return null;
    }

    return data ? parseClientForUpdate(data) : null;
  } catch (error) {
    console.error('Exception updating client:', error);
    return null;
  }
};

// Helper function to parse client data for update response
const parseClientForUpdate = (data: any): Client => {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    coupleName: data.couple_name,
    weddingDate: data.wedding_date,
    weddingStartTime: data.wedding_start_time,
    weddingEndTime: data.wedding_end_time,
    contractValue: Number(data.contract_value) || 0,
    downPayment: Number(data.down_payment) || 0,
    status: data.status,
    nextAction: data.next_action,
    eventCategory: data.event_category,
    eventLocation: data.event_location,
    preWeddingDate: data.pre_wedding_date,
    preWeddingStartTime: data.pre_wedding_start_time,
    preWeddingEndTime: data.pre_wedding_end_time,
    preWeddingScheduled: data.pre_wedding_scheduled,
    contractLink: data.contract_link,
    hasPreWedding: data.has_pre_wedding,
    notes: data.notes,
    payments: [], // Will be loaded separately
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};
