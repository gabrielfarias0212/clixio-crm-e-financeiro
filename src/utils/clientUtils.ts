import { Client, ClientStatus } from "./types";
import { format } from "date-fns";

// Format date function
export const formatDate = (date: Date): string => {
  return format(date, "dd/MM/yyyy");
};

// Helper function to check if a client has fully paid
// Soma apenas pagamentos efetivamente recebidos (pendente/atrasado não contam)
export const valorPago = (client: Client): number =>
  (client.payments ?? [])
    .filter(p => !p.payment_status || p.payment_status === "pago")
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);

export const isFullyPaid = (client: Client): boolean => {
  return valorPago(client) >= client.contractValue;
};

// Helper function to check if the work is fully delivered
export const isWorkDelivered = (client: Client): boolean => {
  // If explicitly marked as delivered
  if (client.isDelivered) return true;
  
  // For weddings and anniversaries, check all workflow steps
  if (client.eventCategory === "Casamento" || client.eventCategory === "Aniversario") {
    const basicStepsCompleted = [
      client.weddingPhotographed,
      client.inEditing,
      client.linkSent
    ].every(Boolean);
    
    // If has pre-wedding, check pre-wedding steps too
    if (client.hasPreWedding !== false) {
      const preWeddingStepsCompleted = [
        client.preWeddingScheduled,
        client.preWeddingCompleted,
        client.preWeddingDelivered
      ].every(Boolean);
      
      return basicStepsCompleted && preWeddingStepsCompleted;
    }
    
    return basicStepsCompleted;
  }
  
  // For other events, just check if photographed and link sent
  return client.weddingPhotographed === true && client.linkSent === true;
};

// Helper function to determine the correct status based on payments and delivery
export const getUpdatedStatus = (client: Client, newPaymentAmount: number = 0): ClientStatus => {
  const totalPaid = client.payments.reduce((sum, payment) => sum + payment.amount, 0) + newPaymentAmount;
  const fullyPaid = totalPaid >= client.contractValue;
  const workDelivered = isWorkDelivered(client);
  
  // If work is delivered, mark as project finalized
  if (workDelivered && fullyPaid) {
    return "projeto_finalizado";
  }
  
  // If fully paid but not delivered, keep as closed
  if (fullyPaid) {
    return "fechado";
  }
  
  return client.status;
};

// Helper function to check if client should show delivery indicator
// Only show for clients with status "projeto_finalizado"
export const shouldShowDeliveredIndicator = (client: Client): boolean => {
  return client.status === "projeto_finalizado";
};


// Datas do app chegam como DD/MM/YYYY (ou ISO): normaliza para YYYY-MM-DD para comparar
export const toISODate = (d?: string | null): string => {
  if (!d) return "";
  const br = d.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  return d.slice(0, 10);
};

/**
 * Saldo do cliente separado em:
 * - exigivel: parcelas pendentes já vencidas ou que vencem até o fim do mês
 * - aVencer: parcelas pendentes com prazo combinado depois do mês (não cobra)
 * - semParcela: saldo sem nenhuma parcela cadastrada (conferir lançamento)
 */
export const saldoExigivel = (client: Client, ateISO: string) => {
  const saldo = Math.max(0, (client.contractValue || 0) - valorPago(client));
  const pendentes = (client.payments ?? []).filter(p => p.payment_status === "pendente" || p.payment_status === "atrasado");
  const dia = (p: { due_date?: string; date: string }) => toISODate(p.due_date || p.date);
  let exigivel = 0, aVencer = 0;
  for (const p of pendentes) {
    if (dia(p) <= ateISO) exigivel += p.amount || 0; else aVencer += p.amount || 0;
  }
  exigivel = Math.min(exigivel, saldo);
  aVencer = Math.min(aVencer, saldo - exigivel);
  const semParcela = Math.max(0, saldo - exigivel - aVencer);
  return { saldo, exigivel, aVencer, semParcela };
};

export const fimDoMesISO = (d: Date = new Date()): string => {
  const f = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}-${String(f.getDate()).padStart(2, "0")}`;
};
