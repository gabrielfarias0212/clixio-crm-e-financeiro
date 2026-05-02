// src/utils/supabase/client-messages.ts

import { supabase } from '@/integrations/supabase/client';
import { ClientMessage, MessageType } from '@/utils/types';

// Cast necessário porque client_messages não está nos types gerados pelo Supabase.
// Após rodar a migration, você pode regenerar os types com: supabase gen types typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export const saveClientMessage = async (
  clientId: string,
  messageType: MessageType,
  messageText: string
): Promise<ClientMessage | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await db
      .from('client_messages')
      .insert({
        client_id: clientId,
        user_id: user?.id ?? null,
        message_type: messageType,
        message_text: messageText,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar mensagem:', error);
      return null;
    }

    return data as ClientMessage;
  } catch (err) {
    console.error('Erro inesperado ao salvar mensagem:', err);
    return null;
  }
};

export const fetchClientMessages = async (
  clientId: string
): Promise<ClientMessage[]> => {
  try {
    const { data, error } = await db
      .from('client_messages')
      .select('*')
      .eq('client_id', clientId)
      .order('sent_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar mensagens:', error);
      return [];
    }

    return (data ?? []) as ClientMessage[];
  } catch (err) {
    console.error('Erro inesperado ao buscar mensagens:', err);
    return [];
  }
};
