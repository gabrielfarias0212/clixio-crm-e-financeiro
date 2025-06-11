
import { Client } from "@/utils/types";
import { ClientInfo } from "@/components/client-detail/ClientInfo";
import { FinancialInfo } from "@/components/client-detail/FinancialInfo";
import { ClientNotes } from "@/components/client-detail/ClientNotes";
import { ClientPayments } from "@/components/ClientPayments";
import { ClientStatusHistory } from "@/components/client-detail/ClientStatusHistory";
import { AutomationConfirmDialog } from "@/components/client-detail/AutomationConfirmDialog";
import { useNextActionAutomation } from "@/hooks/useNextActionAutomation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useClients } from "@/contexts/ClientsContext";
import { toast } from "sonner";

interface ClientDetailsProps {
  client: Client;
  onUpdate?: (updatedClient: Client) => void;
}

export function ClientDetails({ client, onUpdate }: ClientDetailsProps) {
  const { updateClient } = useClients();
  const {
    history,
    showConfirmDialog,
    pendingUpdate,
    confirmAutomaticUpdate,
    rejectAutomaticUpdate,
    setShowConfirmDialog
  } = useNextActionAutomation({
    client,
    onClientUpdate: onUpdate || (() => {})
  });

  const handleToggleAutomation = async (enabled: boolean) => {
    try {
      console.log('Toggling automation for client:', client.id, 'to:', enabled);
      
      const updatedClient = await updateClient(client.id, {
        autoUpdateNextAction: enabled
      });

      if (updatedClient && onUpdate) {
        onUpdate(updatedClient);
        toast.success(enabled ? 'Automação habilitada!' : 'Automação desabilitada!');
      } else {
        toast.error('Erro ao alterar configuração de automação');
      }
    } catch (error) {
      console.error('Error toggling automation:', error);
      toast.error('Erro ao alterar configuração de automação');
    }
  };

  return (
    <div className="space-y-8">
      {/* Informações gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <ClientInfo client={client} />
        <FinancialInfo client={client} />
      </div>
      
      {/* Configurações de Automação */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Automação</CardTitle>
          <CardDescription>
            Controle como as próximas ações são atualizadas automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="automation"
              checked={client.autoUpdateNextAction || false}
              onCheckedChange={handleToggleAutomation}
            />
            <Label htmlFor="automation">
              Atualizar próxima ação automaticamente baseada no status
            </Label>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Quando habilitado, a próxima ação será sugerida automaticamente ao alterar o status do contrato.
          </p>
        </CardContent>
      </Card>
      
      {/* Histórico de Pagamentos */}
      <ClientPayments client={client} onUpdate={onUpdate} />
      
      {/* Histórico de Status */}
      <ClientStatusHistory history={history} />
      
      {/* Notas */}
      <ClientNotes notes={client.notes} />

      {/* Dialog de Confirmação de Automação */}
      {pendingUpdate && (
        <AutomationConfirmDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          newStatus={pendingUpdate.newStatus}
          currentAction={client.nextAction}
          suggestedAction={pendingUpdate.suggestedAction}
          onConfirm={confirmAutomaticUpdate}
          onReject={rejectAutomaticUpdate}
        />
      )}
    </div>
  );
}
