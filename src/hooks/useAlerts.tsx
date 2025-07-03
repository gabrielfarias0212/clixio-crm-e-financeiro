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
      .map(client => {
        let description = `Cliente: ${client.name}`;
        let urgency: "high" | "medium" | "low" = "medium";
        
        // Calculate days since wedding if wedding date exists
        if (client.weddingDate) {
          const weddingDate = stringToDate(client.weddingDate);
          if (weddingDate) {
            const daysSinceWedding = differenceInDays(now, weddingDate);
            
            if (daysSinceWedding > 0) {
              // Wedding already happened
              description += ` - Casamento foi há ${daysSinceWedding} ${daysSinceWedding === 1 ? 'dia' : 'dias'}`;
              
              // Adjust urgency based on days passed
              if (daysSinceWedding > 30) {
                urgency = "high";
              } else if (daysSinceWedding > 15) {
                urgency = "medium";
              } else {
                urgency = "low";
              }
            } else {
              // Wedding in the future
              const daysUntilWedding = Math.abs(daysSinceWedding);
              description += ` - Casamento em ${daysUntilWedding} ${daysUntilWedding === 1 ? 'dia' : 'dias'}`;
              urgency = "low";
            }
          }
        }
        
        return {
          type: "task" as const,
          title: `Ação pendente: ${client.nextAction}`,
          description,
          client,
          date: now,
          urgency
        };
      });
    
    // Deliver tasks (clients with nextAction "entregar")
    const deliverTasks: AlertItem[] = clients
      .filter(client => client.nextAction === "entregar")
      .map(client => {
        let description = `Cliente: ${client.name}`;
        let urgency: "high" | "medium" | "low" = "medium";
        
        // Calculate days since wedding if wedding date exists
        if (client.weddingDate) {
          const weddingDate = stringToDate(client.weddingDate);
          if (weddingDate) {
            const daysSinceWedding = differenceInDays(now, weddingDate);
            
            if (daysSinceWedding > 0) {
              // Wedding already happened
              description += ` - Casamento foi há ${daysSinceWedding} ${daysSinceWedding === 1 ? 'dia' : 'dias'}`;
              
              // Adjust urgency based on days passed
              if (daysSinceWedding > 30) {
                urgency = "high";
              } else if (daysSinceWedding > 15) {
                urgency = "medium";
              } else {
                urgency = "low";
              }
            } else {
              // Wedding in the future
              const daysUntilWedding = Math.abs(daysSinceWedding);
              description += ` - Casamento em ${daysUntilWedding} ${daysUntilWedding === 1 ? 'dia' : 'dias'}`;
              urgency = "low";
            }
          }
        }
        
        return {
          type: "task" as const,
          title: `Ação pendente: ${client.nextAction}`,
          description,
          client,
          date: now,
          urgency
        };
      });
    
    // Payment alerts for upcoming weddings (less than 30 days)
    // Only show if payment is not complete and wedding date is within 30 days
    const paymentAlerts: AlertItem[] = clients
      .filter(client => {
        // Check if client has a wedding date
        if (!client.weddingDate) return false;
        
        // Check if client status is active
        if (client.status !== "fechado") return false;
        
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

    // Due payment alerts (payments with due dates) - EXPANDED to include ALL pending and overdue payments
    const duePaymentAlerts: AlertItem[] = [];
    clients.forEach(client => {
      client.payments.forEach(payment => {
        // Include ALL pending and overdue payments
        if (payment.payment_status === "pendente" || payment.payment_status === "atrasado") {
          let urgency: "high" | "medium" | "low" = "medium";
          let title = "";
          let description = "";
          
          if (payment.payment_status === "atrasado") {
            // Payment is marked as overdue
            title = `Pagamento ATRASADO: R$ ${payment.amount.toFixed(2)}`;
            description = `Cliente: ${client.name} - Status: Atrasado`;
            urgency = "high";
            
            if (payment.due_date) {
              description += ` - Venceu em ${payment.due_date}`;
            }
          } else if (payment.payment_status === "pendente") {
            // Payment is pending
            if (payment.due_date) {
              const dueDate = stringToDate(payment.due_date);
              if (dueDate) {
                const daysUntilDue = differenceInDays(dueDate, now);
                
                if (daysUntilDue <= 0) {
                  // Due date has passed
                  title = `Pagamento ATRASADO: R$ ${payment.amount.toFixed(2)}`;
                  description = `Cliente: ${client.name} - Venceu há ${Math.abs(daysUntilDue)} ${Math.abs(daysUntilDue) === 1 ? 'dia' : 'dias'} (${payment.due_date})`;
                  urgency = "high";
                } else if (daysUntilDue <= 7) {
                  // Due within 7 days
                  title = `Pagamento a vencer: R$ ${payment.amount.toFixed(2)}`;
                  description = `Cliente: ${client.name} - Vence em ${daysUntilDue} ${daysUntilDue === 1 ? 'dia' : 'dias'} (${payment.due_date})`;
                  urgency = "high";
                } else if (daysUntilDue <= 15) {
                  // Due within 15 days
                  title = `Pagamento próximo: R$ ${payment.amount.toFixed(2)}`;
                  description = `Cliente: ${client.name} - Vence em ${daysUntilDue} dias (${payment.due_date})`;
                  urgency = "medium";
                } else {
                  // Due later but still pending
                  title = `Pagamento pendente: R$ ${payment.amount.toFixed(2)}`;
                  description = `Cliente: ${client.name} - Vence em ${daysUntilDue} dias (${payment.due_date})`;
                  urgency = "low";
                }
              } else {
                // Invalid due date
                title = `Pagamento pendente: R$ ${payment.amount.toFixed(2)}`;
                description = `Cliente: ${client.name} - Data de vencimento: ${payment.due_date}`;
                urgency = "medium";
              }
            } else {
              // No due date set, but payment is pending
              title = `Pagamento pendente: R$ ${payment.amount.toFixed(2)}`;
              description = `Cliente: ${client.name} - Sem data de vencimento definida`;
              urgency = "low";
            }
          }
          
          duePaymentAlerts.push({
            type: "due_payment",
            title,
            description,
            client,
            date: payment.due_date ? stringToDate(payment.due_date) || now : now,
            payment,
            urgency
          });
        }
      });
    });
    
    // Pre-wedding alerts for clients with unscheduled pre-weddings
    // UPDATED: Only show if preWeddingDate is NOT filled (indicating it's not scheduled)
    const preWeddingAlerts: AlertItem[] = clients
      .filter(client => {
        // Requirement: Client needs a pre-wedding
        const needsPreWedding = client.hasPreWedding !== false;
        
        // UPDATED: Pre-wedding not scheduled if preWeddingDate is empty/null
        const notScheduled = !client.preWeddingDate;
        
        // Status: Client has confirmed status
        const hasConfirmedStatus = client.status === "fechado";
        
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
