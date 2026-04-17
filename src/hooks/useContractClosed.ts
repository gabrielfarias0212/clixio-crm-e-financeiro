import { useState, useCallback } from "react";
import { Client, ClientStatus, EventCategory, NextAction } from "@/utils/types";
import { useClients } from "@/contexts/ClientsContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { ContractClosedFormData } from "@/components/ContractClosedDialog";
import { toast } from "sonner";

interface PendingUpdate {
  id: string;
  client: Client;
}

export function useContractClosed() {
  const { updateClient, clients } = useClients();
  const { addTransaction } = useTransactions();

  const [pendingUpdate, setPendingUpdate] = useState<PendingUpdate | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Intercepta quando status vira "fechado" via drag no kanban
  const openContractDialog = useCallback(
    (clientId: string) => {
      const client = clients.find((c) => c.id === clientId);
      if (!client) return false;

      // Se já está fechado, não re-abre o dialog
      if (client.status === "fechado") return false;

      setPendingUpdate({ id: clientId, client });
      setDialogOpen(true);
      return true; // sinaliza que o dialog foi aberto
    },
    [clients]
  );

  const handleConfirm = useCallback(
    async (data: ContractClosedFormData) => {
      if (!pendingUpdate) return;

      setDialogOpen(false);

      // Atualizar o cliente com todos os dados do formulário
      const updatedClient = await updateClient(pendingUpdate.id, {
        name: data.name,
        coupleName: data.coupleName,
        email: data.email,
        phone: data.phone,
        eventCategory: data.eventCategory as EventCategory,
        weddingDate: data.weddingDate,
        weddingStartTime: data.weddingStartTime,
        weddingEndTime: data.weddingEndTime,
        contractValue: data.contractValue,
        downPayment: data.downPayment,
        eventLocation: data.eventLocation,
        contractLink: data.contractLink,
        notes: data.notes,
        status: "fechado" as ClientStatus,
        nextAction: "nenhuma" as NextAction,
        salesFunnelStage: "contrato_fechado",
        // Remover badge de cadastro pendente
        leadSource: pendingUpdate.client.leadSource || "Não informado",
      });

      if (!updatedClient) {
        toast.error("Erro ao cadastrar cliente.");
        setPendingUpdate(null);
        return;
      }

      // Registrar entrada no financeiro se foi paga
      if (data.entradaPaga && data.downPayment > 0) {
        const today = new Date().toISOString().split("T")[0];
        await addTransaction({
          type: "entrada",
          category: "pagamento de cliente",
          amount: data.downPayment,
          date: today,
          description: `Entrada — ${data.name}`,
          clientId: updatedClient.id,
        });

        toast.success(
          `Cliente cadastrado e entrada de ${new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(data.downPayment)} registrada no financeiro!`
        );
      } else {
        toast.success("Cliente cadastrado com sucesso!");
      }

      setPendingUpdate(null);
    },
    [pendingUpdate, updateClient, addTransaction]
  );

  const handleLater = useCallback(async () => {
    if (!pendingUpdate) return;

    setDialogOpen(false);

    // Mover para contrato fechado mas marcar como cadastro pendente nas notas
    await updateClient(pendingUpdate.id, {
      status: "fechado" as ClientStatus,
      salesFunnelStage: "contrato_fechado",
      nextAction: "nenhuma" as NextAction,
      notes: pendingUpdate.client.notes
        ? `${pendingUpdate.client.notes}\n\n⚠️ CADASTRO PENDENTE — completar informações do cliente.`
        : "⚠️ CADASTRO PENDENTE — completar informações do cliente.",
    });

    toast.warning("Contrato fechado. Lembre-se de completar o cadastro do cliente depois.", {
      duration: 5000,
    });

    setPendingUpdate(null);
  }, [pendingUpdate, updateClient]);

  const handleCancel = useCallback(() => {
    setDialogOpen(false);
    setPendingUpdate(null);
  }, []);

  return {
    openContractDialog,
    dialogOpen,
    pendingClient: pendingUpdate?.client ?? null,
    handleConfirm,
    handleLater,
    handleCancel,
  };
}
