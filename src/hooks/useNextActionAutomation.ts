
import { useState, useEffect } from 'react';
import { Client, ClientStatus, NextAction, DEFAULT_STATUS_ACTION_MAPPING, ClientStatusHistory } from '@/utils/types';
import { supabase } from '@/integrations/supabase/client';

interface UseNextActionAutomationProps {
  client: Client;
  onClientUpdate: (updatedClient: Client) => void;
}

export function useNextActionAutomation({ client, onClientUpdate }: UseNextActionAutomationProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [history, setHistory] = useState<ClientStatusHistory[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{
    newStatus: ClientStatus;
    suggestedAction: NextAction;
  } | null>(null);

  // Load status history
  useEffect(() => {
    loadStatusHistory();
  }, [client.id]);

  const loadStatusHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('client_status_history')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading status history:', error);
        return;
      }

      const mappedHistory: ClientStatusHistory[] = data.map(item => ({
        id: item.id,
        clientId: item.client_id,
        previousStatus: item.previous_status,
        newStatus: item.new_status,
        previousNextAction: item.previous_next_action,
        newNextAction: item.new_next_action,
        changeType: item.change_type as 'manual' | 'automatic' | 'system',
        changedByUserId: item.changed_by_user_id,
        notes: item.notes,
        createdAt: item.created_at
      }));

      setHistory(mappedHistory);
    } catch (error) {
      console.error('Exception loading status history:', error);
    }
  };

  const getSuggestedNextAction = (status: ClientStatus): NextAction => {
    return DEFAULT_STATUS_ACTION_MAPPING[status] || "nenhuma";
  };

  const handleStatusChange = async (newStatus: ClientStatus, force: boolean = false) => {
    if (!client.autoUpdateNextAction) {
      // Automation disabled, just update status
      await updateClientStatus(newStatus, client.nextAction, 'manual');
      return;
    }

    const suggestedAction = getSuggestedNextAction(newStatus);
    
    // If current action differs from suggested and user hasn't forced, show confirmation
    if (!force && client.nextAction !== suggestedAction) {
      setPendingUpdate({ newStatus, suggestedAction });
      setShowConfirmDialog(true);
      return;
    }

    // Apply automatic update
    await updateClientStatus(newStatus, suggestedAction, 'automatic');
  };

  const updateClientStatus = async (
    newStatus: ClientStatus, 
    newNextAction: NextAction, 
    changeType: 'manual' | 'automatic' | 'system'
  ) => {
    setIsUpdating(true);
    
    try {
      // Update client in database
      const { data, error } = await supabase
        .from('wedding_clients')
        .update({
          status: newStatus,
          next_action: newNextAction,
          updated_at: new Date().toISOString()
        })
        .eq('id', client.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating client status:', error);
        return;
      }

      // Record in history
      await recordStatusChange(
        client.status,
        newStatus,
        client.nextAction,
        newNextAction,
        changeType
      );

      // Update local client state
      const updatedClient: Client = {
        ...client,
        status: newStatus,
        nextAction: newNextAction,
        updatedAt: new Date().toISOString()
      };

      onClientUpdate(updatedClient);
      await loadStatusHistory(); // Reload history

    } catch (error) {
      console.error('Exception updating client status:', error);
    } finally {
      setIsUpdating(false);
      setShowConfirmDialog(false);
      setPendingUpdate(null);
    }
  };

  const recordStatusChange = async (
    previousStatus: ClientStatus,
    newStatus: ClientStatus,
    previousNextAction: NextAction,
    newNextAction: NextAction,
    changeType: 'manual' | 'automatic' | 'system',
    notes?: string
  ) => {
    try {
      const { error } = await supabase
        .from('client_status_history')
        .insert({
          client_id: client.id,
          previous_status: previousStatus,
          new_status: newStatus,
          previous_next_action: previousNextAction,
          new_next_action: newNextAction,
          change_type: changeType,
          notes: notes || (changeType === 'automatic' ? 'Próxima ação atualizada automaticamente' : undefined)
        });

      if (error) {
        console.error('Error recording status change:', error);
      }
    } catch (error) {
      console.error('Exception recording status change:', error);
    }
  };

  const toggleAutomation = async (enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('wedding_clients')
        .update({
          auto_update_next_action: enabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', client.id);

      if (error) {
        console.error('Error toggling automation:', error);
        return;
      }

      const updatedClient: Client = {
        ...client,
        autoUpdateNextAction: enabled
      };

      onClientUpdate(updatedClient);

    } catch (error) {
      console.error('Exception toggling automation:', error);
    }
  };

  const confirmAutomaticUpdate = () => {
    if (pendingUpdate) {
      updateClientStatus(pendingUpdate.newStatus, pendingUpdate.suggestedAction, 'automatic');
    }
  };

  const rejectAutomaticUpdate = () => {
    if (pendingUpdate) {
      updateClientStatus(pendingUpdate.newStatus, client.nextAction, 'manual');
    }
  };

  return {
    isUpdating,
    history,
    showConfirmDialog,
    pendingUpdate,
    handleStatusChange,
    toggleAutomation,
    confirmAutomaticUpdate,
    rejectAutomaticUpdate,
    getSuggestedNextAction,
    setShowConfirmDialog
  };
}
