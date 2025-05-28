
import { useMemo } from "react";
import { AlertItem, Client, CalendarEvent } from "@/utils/types";
import { stringToDate } from "@/utils/dates";
import { differenceInDays, isBefore, isAfter, startOfDay, addDays } from "date-fns";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { isFullyPaid } from "@/utils/clientUtils";

export function useAlerts(clients: Client[] = []) {
  const { events } = useCalendarEvents();
  
  const alerts = useMemo(() => {
    const now = new Date();
    
    // Edit tasks (clients with nextAction "editar")
    const editTasks: AlertItem[] = clients
      .filter(client => client.nextAction === "editar")
      .map(client => ({
        type: "task" as const,
        title: `Ação pendente: ${client.nextAction}`,
        description: `Cliente: ${client.name}`,
        client,
        date: now,
        urgency: "medium" as const
      }));
    
    // Deliver tasks (clients with nextAction "entregar")
    const deliverTasks: AlertItem[] = clients
      .filter(client => client.nextAction === "entregar")
      .map(client => ({
        type: "task" as const,
        title: `Ação pendente: ${client.nextAction}`,
        description: `Cliente: ${client.name}`,
        client,
        date: now,
        urgency: "medium" as const
      }));
    
    // Payment alerts for upcoming weddings (less than 30 days)
    // Only show if payment is not complete and wedding date is within 30 days
    const paymentAlerts: AlertItem[] = clients
      .filter(client => {
        // Check if client has a wedding date
        if (!client.weddingDate) return false;
        
        // Check if client status is active
        if (client.status !== "fechado" && client.status !== "em andamento") return false;
        
        // Check if fully paid already
        if (isFullyPaid(client)) return false;
        
        // Calculate days until wedding
        const weddingDate = stringToDate(client.weddingDate);
        if (!weddingDate) return false;
        
        const daysUntilWedding = differenceInDays(weddingDate, now);
        
        // Only alert if wedding is within 30 days or already happened (for overdue payments)
        return daysUntilWedding <= 30;
      })
      .map(client => {
        const totalPaid = client.payments.reduce((sum, payment) => sum + payment.amount, 0);
        const pendingAmount = client.contractValue - totalPaid;
        const weddingDate = stringToDate(client.weddingDate || "");
        const daysUntilWedding = weddingDate ? differenceInDays(weddingDate, now) : null;
        
        // Create description with days information
        let description = `Cliente: ${client.name}`;
        
        // Check if event already happened
        const eventPassed = daysUntilWedding !== null && daysUntilWedding < 0;
        
        if (daysUntilWedding !== null) {
          if (eventPassed) {
            // Event already happened, show how many days ago
            const daysAgo = Math.abs(daysUntilWedding);
            description += ` - Casamento foi há ${daysAgo} ${daysAgo === 1 ? 'dia' : 'dias'}`;
          } else {
            // Event is in the future
            description += ` - Casamento em ${daysUntilWedding} ${daysUntilWedding === 1 ? 'dia' : 'dias'}`;
          }
        }
        
        // Set title and urgency based on whether event has passed
        let title = `Pagamento pendente: R$ ${pendingAmount.toFixed(2)}`;
        let urgency: "high" | "medium" | "low" = "medium";
        
        if (eventPassed) {
          title = `Pagamento ATRASADO: R$ ${pendingAmount.toFixed(2)}`;
          urgency = "high";
        } else if (daysUntilWedding && daysUntilWedding <= 7) {
          urgency = "high";
        }
        
        return {
          type: "payment" as const,
          title,
          description,
          client,
          date: now,
          urgency,
          isOverdue: eventPassed // Add a flag for overdue payments
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
    
    // Pre-wedding alerts for clients with unscheduled pre-weddings
    // - Show only when wedding date is <= 120 days away or no date set
    // - Don't show if pre-wedding is scheduled or not needed
    const preWeddingAlerts: AlertItem[] = clients
      .filter(client => {
        // Verify if we need to show a pre-wedding alert for this client
        
        // Requirement: Client needs a pre-wedding
        const needsPreWedding = client.hasPreWedding !== false;
        
        // Scheduling: Pre-wedding not scheduled yet
        const notScheduled = !client.preWeddingDate || client.preWeddingScheduled === false;
        
        // Status: Client has confirmed status
        const hasConfirmedStatus = client.status === "fechado" || client.status === "em andamento";
        
        // Timeframe: Wedding within 120 days OR no date defined
        const weddingDate = client.weddingDate ? stringToDate(client.weddingDate) : null;
        const daysUntilWedding = weddingDate ? differenceInDays(weddingDate, now) : null;
        const isWithinTimeframe = daysUntilWedding === null || daysUntilWedding <= 120;
        
        return needsPreWedding && notScheduled && hasConfirmedStatus && isWithinTimeframe;
      })
      .map(client => {
        const weddingDate = client.weddingDate ? stringToDate(client.weddingDate) : null;
        let urgency: "high" | "medium" | "low" = "medium";
        let daysUntilWedding = null;
        
        // Calculate urgency based on wedding date proximity
        if (weddingDate) {
          daysUntilWedding = differenceInDays(weddingDate, now);
          
          if (daysUntilWedding <= 30) {
            urgency = "high";  // 30 days or less: high urgency
          } else if (daysUntilWedding <= 60) {
            urgency = "medium"; // 31-60 days: medium urgency
          } else {
            urgency = "low";    // 61-120 days: low urgency
          }
        }
        
        // Create description with wedding date information
        const descriptionWithDays = daysUntilWedding 
          ? `Cliente: ${client.name} - Agendar pré-wedding/ensaio (Casamento em ${daysUntilWedding} dias)`
          : `Cliente: ${client.name} - Agendar pré-wedding/ensaio`;
        
        return {
          type: "pre_wedding" as const,
          title: "Pré-wedding não agendado",
          description: descriptionWithDays,
          client,
          date: now,
          urgency
        };
      });
    
    // Combine and sort all payment alerts by urgency and type
    const allPaymentAlerts = [...paymentAlerts, ...duePaymentAlerts].sort((a, b) => {
      const urgencyOrder = { high: 0, medium: 1, low: 2 };
      return (urgencyOrder[a.urgency || 'medium'] - urgencyOrder[b.urgency || 'medium']) || 
             differenceInDays(a.date, b.date);
    });

    return { 
      editTasks, 
      deliverTasks,
      payments: allPaymentAlerts as AlertItem[],
      preWedding: preWeddingAlerts as AlertItem[]
    };
  }, [clients, events]);

  return alerts;
}
