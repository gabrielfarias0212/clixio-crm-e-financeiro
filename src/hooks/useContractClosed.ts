import { useState, useCallback } from "react";
import { Client } from "@/utils/types";
import { useClients } from "@/contexts/ClientsContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { toast } from "sonner";

type UpdateClientFn = (
  id: string,
  updates: Partial<Omit<Client, "id" | "createdAt" | "updatedAt" | "payments">>
) => Promise<Client | null>;

interface PendingUpdate {
  id: string;
  updates: Partial<Omit<Client, "id" | "createdAt" | "updatedAt" | "payments">>;
  client: Client;
}

export function useContractClosed() {
  const { updateClient, clients } = useClients();
  const { addTransaction } = useTransactions();

  const [pendingUpdate, setPendingUpdate] = useState<PendingUpdate | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Substitui o updateClient normal — intercepta quando status vira "fechado"
  const updateClientWithContractCheck: UpdateClientFn = useCallback(
    async (id, updates) => {
      const isClosing = updates.status === "fechado";

      if (!isClosing) {
        // Atualização normal, sem interceptação
        return updateClient(id, updates);
      }

      // Verificar se já estava fechado (evitar re-trigger em edições)
      const client = clients.find((c) => c.id === id);
      if (!client) return updateClient(id, updates);

      const jaEstaFechado = client.status === "fechado";
      if (jaEstaFechado) {
        return updateClient(id, updates);
      }

      // Guardar update pendente e abrir dialog
      setPendingUpdate({ id, updates, client: { ...client, ...updates } as Client });
      setDialogOpen(true);
      return null; // O update será feito após confirmação no dialog
    },
    [updateClient, clients]
  );

  const handleDialogConfirm = useCallback(
    async (entradaPaga: boolean, valorEntrada: number) => {
      if (!pendingUpdate) return;

      setDialogOpen(false);

      // 1. Salvar o cliente como fechado
      const updatedClient = await updateClient(pendingUpdate.id, pendingUpdate.updates);

      if (!updatedClient) {
        toast.error("Erro ao fechar contrato.");
        setPendingUpdate(null);
        return;
      }

      // 2. Se entrada foi paga, registrar no financeiro
      if (entradaPaga && valorEntrada > 0) {
        const today = new Date().toISOString().split("T")[0];

        await addTransaction({
          type: "entrada",
          category: "pagamento de cliente",
          amount: valorEntrada,
          date: today,
          description: `Entrada — ${updatedClient.name}`,
          clientId: updatedClient.id,
        });

        toast.success(
          `Contrato fechado e entrada de R$ ${valorEntrada.toFixed(2).replace(".", ",")} registrada no financeiro!`
        );
      } else {
        toast.success("Contrato fechado! Entrada não registrada.");
      }

      setPendingUpdate(null);
    },
    [pendingUpdate, updateClient, addTransaction]
  );

  const handleDialogCancel = useCallback(() => {
    setDialogOpen(false);
    setPendingUpdate(null);
  }, []);

  return {
    updateClientWithContractCheck,
    dialogOpen,
    pendingClient: pendingUpdate?.client ?? null,
    handleDialogConfirm,
    handleDialogCancel,
  };
}
