
import { useMemo } from "react";
import { AlertItem, Client, CalendarEvent } from "@/utils/types";
import { stringToDate } from "@/utils/dateUtils";
import { differenceInDays, isBefore, isAfter, startOfDay, addDays } from "date-fns";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";

export function useAlerts(clients: Client[]) {
  const { events } = useCalendarEvents();
  
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
    
    // Pre-wedding alerts for clients with unscheduled pre-weddings
    const preWeddingAlerts: AlertItem[] = clients
      .filter(client => {
        // Only show pre-wedding alerts for clients where:
        // 1. The client needs pre-wedding (hasPreWedding is true)
        // 2. The pre-wedding has not been scheduled (preWeddingDate is null or preWeddingScheduled is false)
        // 3. The client status is confirmed or in progress (not a quote or follow-up)
        return client.hasPreWedding !== false && 
               (!client.preWeddingDate || client.preWeddingScheduled === false) && 
               (client.status === "fechado" || client.status === "em andamento");
      })
      .map(client => {
        const weddingDate = client.weddingDate ? stringToDate(client.weddingDate) : null;
        let urgency: "high" | "medium" | "low" = "medium";
        
        // Calculate urgency based on wedding date proximity
        if (weddingDate) {
          const daysUntilWedding = differenceInDays(weddingDate, now);
          if (daysUntilWedding <= 30) {
            urgency = "high";
          } else if (daysUntilWedding <= 60) {
            urgency = "medium";
          } else {
            urgency = "low";
          }
        }
        
        return {
          type: "pre_wedding" as const,
          title: "Pré-wedding não agendado",
          description: `Cliente: ${client.name} - Agendar pré-wedding/ensaio`,
          client,
          date: now,
          urgency
        };
      });
    
    // Calendar event alerts (upcoming events within 7 days)
    const calendarEventAlerts: AlertItem[] = [];
    const today = startOfDay(new Date());
    const nextWeek = addDays(today, 7);
    
    events.forEach(event => {
      const eventDate = stringToDate(event.date);
      if (eventDate) {
        if (isAfter(eventDate, today) && isBefore(eventDate, nextWeek)) {
          const daysUntilEvent = differenceInDays(eventDate, today);
          
          // Find related client if exists
          const relatedClient = event.clientId ? 
            clients.find(c => c.id === event.clientId) : undefined;
            
          calendarEventAlerts.push({
            type: "event",
            title: `Evento próximo: ${event.title}`,
            description: `${event.date} às ${event.startTime}${relatedClient ? ` - Cliente: ${relatedClient.name}` : ''}`,
            client: relatedClient || clients[0], // Use first client as fallback for non-client events
            date: eventDate,
            urgency: daysUntilEvent <= 1 ? "high" : daysUntilEvent <= 3 ? "medium" : "low"
          });
        }
      }
    });
    
    // Combine and sort all alerts by urgency and type
    const allPaymentAlerts = [...paymentAlerts, ...duePaymentAlerts].sort((a, b) => {
      const urgencyOrder = { high: 0, medium: 1, low: 2 };
      return (urgencyOrder[a.urgency || 'medium'] - urgencyOrder[b.urgency || 'medium']) || 
             differenceInDays(a.date, b.date);
    });

    return { 
      tasks: pendingTasks, 
      payments: allPaymentAlerts as AlertItem[],
      events: calendarEventAlerts as AlertItem[],
      preWedding: preWeddingAlerts as AlertItem[]
    };
  }, [clients, events]);

  return alerts;
}
