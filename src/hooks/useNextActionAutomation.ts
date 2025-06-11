
import { useState, useEffect } from 'react';
import { Client, ClientStatus, NextAction, DEFAULT_STATUS_ACTION_MAPPING } from '@/utils/types';
import { useClients } from '@/contexts/ClientsContext';
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
  const { updateClient } = useClients();
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
      return;
    }

    const suggestedAction = getSuggestedAction(newStatus);
    
    // If the suggested action is different from current action, show confirmation
    if (suggestedAction !== client.nextAction) {
      setPendingUpdate({ newStatus, suggestedAction });
      setShowConfirmDialog(true);
    }
  };

  const confirmAutomaticUpdate = async () => {
    if (!pendingUpdate) return;

    try {
      const updatedClient = await updateClient(client.id, {
        status: pendingUpdate.newStatus,
        nextAction: pendingUpdate.suggestedAction
      });

      if (updatedClient && onClientUpdate) {
        onClientUpdate(updatedClient);
        toast.success('Status e próxima ação atualizados automaticamente!');
      }
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Erro ao atualizar cliente');
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

  const toggleAutomation = async (enabled: boolean) => {
    try {
      const updatedClient = await updateClient(client.id, {
        autoUpdateNextAction: enabled
      });

      if (updatedClient && onClientUpdate) {
        onClientUpdate(updatedClient);
        toast.success(enabled ? 'Automação habilitada!' : 'Automação desabilitada!');
      }
    } catch (error) {
      console.error('Error toggling automation:', error);
      toast.error('Erro ao alterar configuração de automação');
    }
  };

  return {
    history,
    showConfirmDialog,
    pendingUpdate,
    handleStatusChange,
    confirmAutomaticUpdate,
    rejectAutomaticUpdate,
    toggleAutomation,
    setShowConfirmDialog
  };
}
