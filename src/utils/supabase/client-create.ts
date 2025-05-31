
import { supabase } from '@/integrations/supabase/client';
import { Client } from '../types';
import { formatDateForSupabase } from './base';
import { createCalendarEvent } from './calendar-events';
import { v4 as uuidv4 } from 'uuid';

export const createClient = async (clientData: Omit<Client, 'id' | 'payments' | 'createdAt' | 'updatedAt'>): Promise<Client | null> => {
  try {
    // Automatically set preWeddingScheduled based on preWeddingDate
    const dataToInsert = {
      name: clientData.name,
      email: clientData.email,
      phone: clientData.phone,
      couple_name: clientData.coupleName,
      wedding_date: clientData.weddingDate ? formatDateForSupabase(clientData.weddingDate) : null,
      wedding_start_time: clientData.weddingStartTime,
      wedding_end_time: clientData.weddingEndTime,
      contract_value: clientData.contractValue,
      down_payment: clientData.downPayment,
      status: clientData.status,
      next_action: clientData.nextAction,
      event_category: clientData.eventCategory,
      event_location: clientData.eventLocation,
      pre_wedding_date: clientData.preWeddingDate ? formatDateForSupabase(clientData.preWeddingDate) : null,
      pre_wedding_start_time: clientData.preWeddingStartTime,
      pre_wedding_end_time: clientData.preWeddingEndTime,
      pre_wedding_scheduled: !!clientData.preWeddingDate, // true if date exists, false if null/empty
      contract_link: clientData.contractLink,
      has_pre_wedding: clientData.hasPreWedding,
      notes: clientData.notes
    };

    const { data, error } = await supabase
      .from('wedding_clients')
      .insert(dataToInsert)
      .select()
      .single();

    if (error) {
      console.error('Error creating client:', error);
      return null;
    }

    const createdClient = data ? parseClientForCreate(data) : null;

    // Se o cliente foi criado com sucesso e tem data de pré-wedding, criar evento no calendário
    if (createdClient && clientData.preWeddingDate && clientData.hasPreWedding) {
      console.log('[ClientCreate] Criando evento de pré-wedding no calendário:', {
        clientId: createdClient.id,
        clientName: createdClient.name,
        preWeddingDate: clientData.preWeddingDate
      });

      const calendarEvent = {
        id: uuidv4(),
        title: `Pré-Wedding - ${createdClient.name}`,
        description: `Sessão de pré-wedding para ${createdClient.name}`,
        date: clientData.preWeddingDate,
        startTime: clientData.preWeddingStartTime || "09:00",
        endTime: clientData.preWeddingEndTime || "10:00",
        type: 'pre-wedding' as const,
        color: 'purple' as const,
        clientId: createdClient.id
      };

      try {
        await createCalendarEvent(calendarEvent);
        console.log('[ClientCreate] Evento de pré-wedding criado com sucesso');
      } catch (calendarError) {
        console.error('[ClientCreate] Erro ao criar evento no calendário:', calendarError);
        // Não falha a criação do cliente se o evento falhar
      }
    }

    return createdClient;
  } catch (error) {
    console.error('Exception creating client:', error);
    return null;
  }
};

// Helper function to parse client data for create response
const parseClientForCreate = (data: any): Client => {
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
