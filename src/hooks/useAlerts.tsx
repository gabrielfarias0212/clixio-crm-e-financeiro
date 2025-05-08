
import { useMemo } from "react";
import { AlertItem, Client } from "@/utils/types";
import { stringToDate } from "@/utils/dateUtils";
import { differenceInDays } from "date-fns";

export function useAlerts(clients: Client[]) {
  const alerts = useMemo(() => {
    const now = new Date();
    
    // Pending tasks (based on nextAction not being "nenhuma")
    const pendingTasks: AlertItem[] = clients
      .filter(client => client.nextAction !== "nenhuma")
      .map(client => ({
        type: "task" as const,
        title: `Ação pendente: ${client.nextAction}`,
        description: `Cliente: ${client.name}`,
        client,
        date: now, // Current date as these are already pending
        urgency: "medium" as const
      }));
    
    // Payment alerts (contracts without full payment)
    const paymentAlerts: AlertItem[] = clients
      .filter(client => {
        if (client.status !== "fechado" && client.status !== "em andamento") return false;
        const totalPaid = client.payments.reduce((sum, payment) => sum + payment.amount, 0);
        return totalPaid < client.contractValue; // Still has pending payments
      })
      .map(client => {
        const totalPaid = client.payments.reduce((sum, payment) => sum + payment.amount, 0);
        const pendingAmount = client.contractValue - totalPaid;
        return {
          type: "payment" as const,
          title: `Pagamento pendente: R$ ${pendingAmount.toFixed(2)}`,
          description: `Cliente: ${client.name}`,
          client,
          date: now, // Current date as these are already pending
          urgency: "medium" as const
        };
      });

    // Due payment alerts (payments with due dates)
    const duePaymentAlerts: AlertItem[] = [];
    clients.forEach(client => {
      client.payments.forEach(payment => {
        if (payment.due_date && payment.payment_status === "pendente") {
          const dueDate = stringToDate(payment.due_date);
          if (dueDate) {
            const daysUntilDue = differenceInDays(dueDate, now);
            
            // If due date is in the past or today
            if (daysUntilDue <= 0) {
              duePaymentAlerts.push({
                type: "due_payment",
                title: `Pagamento ATRASADO: R$ ${payment.amount.toFixed(2)}`,
                description: `Cliente: ${client.name} - Venceu em ${payment.due_date}`,
                client,
                date: dueDate,
                payment,
                urgency: "high"
              });
            } 
            // If due date is within the next 7 days
            else if (daysUntilDue <= 7) {
              duePaymentAlerts.push({
                type: "due_payment",
                title: `Pagamento a vencer: R$ ${payment.amount.toFixed(2)}`,
                description: `Cliente: ${client.name} - Vence em ${daysUntilDue} ${daysUntilDue === 1 ? 'dia' : 'dias'} (${payment.due_date})`,
                client,
                date: dueDate,
                payment,
                urgency: "medium"
              });
            }
            // If due date is within the next 15 days
            else if (daysUntilDue <= 15) {
              duePaymentAlerts.push({
                type: "due_payment",
                title: `Pagamento próximo: R$ ${payment.amount.toFixed(2)}`,
                description: `Cliente: ${client.name} - Vence em ${daysUntilDue} dias (${payment.due_date})`,
                client,
                date: dueDate,
                payment,
                urgency: "low"
              });
            }
          }
        }
      });
    });
    
    // Combine and sort all due payment alerts by urgency (high -> medium -> low)
    const sortedDuePaymentAlerts = [...duePaymentAlerts].sort((a, b) => {
      const urgencyOrder = { high: 0, medium: 1, low: 2 };
      return (urgencyOrder[a.urgency || 'medium'] - urgencyOrder[b.urgency || 'medium']) || 
             differenceInDays(a.date, b.date);
    });

    return { 
      tasks: pendingTasks, 
      payments: [...paymentAlerts, ...sortedDuePaymentAlerts] as AlertItem[]
    };
  }, [clients]);

  return alerts;
}
