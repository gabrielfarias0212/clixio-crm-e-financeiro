import { supabase } from '@/integrations/supabase/client';
import { Client, SalesFunnelStage } from '../types';
import { formatDateForSupabase } from './base';
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, fetchCalendarEvents } from './calendar-events';
import { v4 as uuidv4 } from 'uuid';

// Function to map client status to sales funnel stage
const mapStatusToFunnelStage = (status: string): SalesFunnelStage => {
  switch (status) {
    case 'primeiro_contato':
      return 'primeiro_contato';
    case 'orçamento enviado':
      return 'orcamento_enviado';
    case 'negociacao':
      return 'negociacao';
    case 'fechado':
      return 'contrato_fechado';
    case 'projeto_finalizado':
      return 'projeto_finalizado';
    default:
      return 'primeiro_contato';
  }
};

export const updateClient = async (id: string, clientData: Partial<Client>): Promise<Client | null> => {
  try {
    // Automatically set preWeddingScheduled based on preWeddingDate
    const updatedData = {
      ...clientData,
      pre_wedding_scheduled: !!clientData.preWeddingDate // true if date exists, false if null/empty
    };

    // Update sales funnel stage based on status if status is being updated
    const salesFunnelStage = clientData.status ? mapStatusToFunnelStage(clientData.status) : undefined;

    const updatePayload: any = {
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
    };

    // Add sales funnel stage if status is being updated
    if (salesFunnelStage) {
      updatePayload.sales_funnel_stage = salesFunnelStage;
    }

    const { data, error } = await supabase
      .from('wedding_clients')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating client:', error);
      return null;
    }

    const updatedClient = data ? parseClientForUpdate(data) : null;

    // Gerenciar evento de pré-wedding no calendário
    if (updatedClient) {
      await managePreWeddingCalendarEvent(updatedClient, clientData);
    }

    return updatedClient;
  } catch (error) {
    console.error('Exception updating client:', error);
    return null;
  }
};

// Função para gerenciar evento de pré-wedding no calendário
const managePreWeddingCalendarEvent = async (client: Client, updatedData: Partial<Client>) => {
  try {
    console.log('[ClientUpdate] Gerenciando evento de pré-wedding:', {
      clientId: client.id,
      clientName: client.name,
      hasPreWedding: client.hasPreWedding,
      preWeddingDate: client.preWeddingDate
    });

    // Buscar evento existente de pré-wedding para este cliente
    const allEvents = await fetchCalendarEvents();
    const existingEvent = allEvents.find(event => 
      event.type === 'pre-wedding' && event.clientId === client.id
    );

    // Se não tem pré-wedding ou não tem data, remover evento existente
    if (!client.hasPreWedding || !client.preWeddingDate) {
      if (existingEvent) {
        console.log('[ClientUpdate] Removendo evento de pré-wedding existente');
        await deleteCalendarEvent(existingEvent.id);
      }
      return;
    }

    // Criar dados do evento
    const eventData = {
      id: existingEvent?.id || uuidv4(),
      title: `Pré-Wedding - ${client.name}`,
      description: `Sessão de pré-wedding para ${client.name}`,
      date: client.preWeddingDate,
      startTime: client.preWeddingStartTime || "09:00",
      endTime: client.preWeddingEndTime || "10:00",
      type: 'pre-wedding' as const,
      color: 'purple' as const,
      clientId: client.id
    };

    // Atualizar ou criar evento
    if (existingEvent) {
      console.log('[ClientUpdate] Atualizando evento de pré-wedding existente');
      await updateCalendarEvent(eventData);
    } else {
      console.log('[ClientUpdate] Criando novo evento de pré-wedding');
      await createCalendarEvent(eventData);
    }

  } catch (error) {
    console.error('[ClientUpdate] Erro ao gerenciar evento de pré-wedding:', error);
    // Não falha a atualização do cliente se o evento falhar
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
    salesFunnelStage: data.sales_funnel_stage || 'primeiro_contato', // New field
    notes: data.notes,
    payments: [], // Will be loaded separately
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};
