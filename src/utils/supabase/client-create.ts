
import { supabase } from '@/integrations/supabase/client';
import { Client, SalesFunnelStage } from '../types';
import { formatDateForSupabase } from './base';
import { parseClient } from './client-parsers';
import { createCalendarEvent } from './calendar-events';
import { v4 as uuidv4 } from 'uuid';

// Function to map client status to sales funnel stage
const mapStatusToFunnelStage = (status: string): SalesFunnelStage => {
  switch (status) {
    case 'orçamento enviado':
      return 'orcamento_enviado';
    case 'follow-up':
      return 'negociacao';
    case 'fechado':
    case 'em andamento':
    case 'pago':
      return 'contrato_fechado';
    case 'entregue':
      return 'projeto_finalizado';
    default:
      return 'primeiro_contato';
  }
};

export const createClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'payments'>): Promise<Client | null> => {
  try {
    const salesFunnelStage = mapStatusToFunnelStage(clientData.status);
    
    const { data, error } = await supabase
      .from('wedding_clients')
      .insert({
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
        pre_wedding_scheduled: !!clientData.preWeddingDate,
        contract_link: clientData.contractLink,
        has_pre_wedding: clientData.hasPreWedding,
        sales_funnel_stage: salesFunnelStage,
        lead_source: clientData.leadSource,
        notes: clientData.notes,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating client:', error);
      return null;
    }

    const newClient = parseClient(data);

    // Get current user for calendar events
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      return newClient; // Return client even if calendar events fail
    }

    // Create calendar event for wedding if date is provided
    if (newClient.weddingDate && newClient.eventCategory) {
      try {
        await createCalendarEvent({
          id: uuidv4(),
          title: `${newClient.eventCategory} - ${newClient.name}`,
          description: `${newClient.eventCategory} para ${newClient.name}`,
          date: newClient.weddingDate,
          startTime: newClient.weddingStartTime || "09:00",
          endTime: newClient.weddingEndTime || "18:00",
          type: 'client',
          color: 'blue',
          clientId: newClient.id
        });
      } catch (eventError) {
        console.error('Error creating calendar event for wedding:', eventError);
        // Don't fail client creation if event creation fails
      }
    }

    // Create calendar event for pre-wedding if date is provided
    if (newClient.hasPreWedding && newClient.preWeddingDate) {
      try {
        await createCalendarEvent({
          id: uuidv4(),
          title: `Pré-Wedding - ${newClient.name}`,
          description: `Sessão de pré-wedding para ${newClient.name}`,
          date: newClient.preWeddingDate,
          startTime: newClient.preWeddingStartTime || "09:00",
          endTime: newClient.preWeddingEndTime || "10:00",
          type: 'pre-wedding',
          color: 'purple',
          clientId: newClient.id
        });
      } catch (eventError) {
        console.error('Error creating calendar event for pre-wedding:', eventError);
        // Don't fail client creation if event creation fails
      }
    }

    return newClient;
  } catch (error) {
    console.error('Exception creating client:', error);
    return null;
  }
};
