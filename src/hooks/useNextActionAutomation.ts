
import { useState, useEffect } from 'react';
import { Client, ClientStatus, NextAction, DEFAULT_STATUS_ACTION_MAPPING } from '@/utils/types';
import { toast } from 'sonner';

export interface UseNextActionAutomationProps {
  client: Client;
  onClientUpdate?: (updatedClient: Client) => void;
}

interface PendingUpdate {
  newStatus: ClientStatus;
  suggestedAction: NextAction;
}

export function useNextActionAutomation({ client, onClientUpdate }: UseNextActionAutomationProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<PendingUpdate | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  // Mock history for now since we don't have the table yet
  useEffect(() => {
    // In a real implementation, this would fetch from client_status_history table
    setHistory([]);
  }, [client.id]);

  const getSuggestedAction = (status: ClientStatus): NextAction => {
    return DEFAULT_STATUS_ACTION_MAPPING[status] || client.nextAction;
  };

  const handleStatusChange = async (newStatus: ClientStatus) => {
    if (!client.autoUpdateNextAction) {
      console.log('Automation is disabled for this client');
      return;
    }

    const suggestedAction = getSuggestedAction(newStatus);
    
    // If the suggested action is different from current action, show confirmation
    if (suggestedAction !== client.nextAction) {
      console.log('Status change detected, showing automation dialog:', {
        newStatus,
        currentAction: client.nextAction,
        suggestedAction
      });
      
      setPendingUpdate({ newStatus, suggestedAction });
      setShowConfirmDialog(true);
    } else {
      console.log('Status changed but action remains the same:', suggestedAction);
    }
  };

  const confirmAutomaticUpdate = async () => {
    if (!pendingUpdate) return;

    try {
      toast.success('Próxima ação atualizada automaticamente!');
    } catch (error) {
      console.error('Error in automation confirmation:', error);
      toast.error('Erro ao confirmar automação');
    } finally {
      setShowConfirmDialog(false);
      setPendingUpdate(null);
    }
  };

  const rejectAutomaticUpdate = () => {
    setShowConfirmDialog(false);
    setPendingUpdate(null);
    toast.info('Próxima ação mantida como estava');
  };

  return {
    history,
    showConfirmDialog,
    pendingUpdate,
    handleStatusChange,
    confirmAutomaticUpdate,
    rejectAutomaticUpdate,
    setShowConfirmDialog
  };
}
