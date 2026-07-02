import { useMemo } from "react";
import { AlertItem, Client, CalendarEvent } from "@/utils/types";
import { stringToDate } from "@/utils/dates";
import { differenceInDays, isBefore, isAfter, startOfDay, addDays } from "date-fns";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { isFullyPaid } from "@/utils/clientUtils";
import { fetchCompanySettings } from "@/utils/supabase/settings";
import { useState, useEffect } from "react";

export function useAlerts(clients: Client[] = []) {
  const { events } = useCalendarEvents();
  const [preWeddingReminderDays, setPreWeddingReminderDays] = useState(90);

  useEffect(() => {
    fetchCompanySettings().then(s => {
      if (s?.pre_wedding_reminder_days) setPreWeddingReminderDays(s.pre_wedding_reminder_days);
    }).catch(() => {});
  }, []);
  
  const alerts = useMemo(() => {
    const now = new Date();
    
    // Edit tasks — clients in workflow stage 'edicao'
    const editTasks: AlertItem[] = clients
      .filter(client => client.workflowStage === "edicao")
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
          title: `Edição pendente`,
          description,
          client,
          date: now,
          urgency
        };
      });

    // Calendar Events editing alerts (pré-weddings, ensaios, sessões que já aconteceram)
    const calendarEditingAlerts: AlertItem[] = events
      .filter(event => {
        // Filtrar apenas eventos relevantes para edição
        const editableEventTypes = ['pre-wedding', 'photoshoot', 'editing', 'custom'];
        if (!editableEventTypes.includes(event.type)) return false;
        
        // Verificar se o evento já aconteceu
        const eventDate = stringToDate(event.date);
        if (!eventDate) return false;
        
        const daysSinceEvent = differenceInDays(now, eventDate);
        if (daysSinceEvent <= 0) return false; // Evento ainda não aconteceu
        
        // Filtrar eventos já marcados como editados ou entregues
        if (event.isEdited === true || event.isDelivered === true) return false;
        
        return true;
      })
      .map(event => {
        const eventDate = stringToDate(event.date);
        const daysSinceEvent = eventDate ? differenceInDays(now, eventDate) : 0;
        
        // Encontrar cliente associado se existir
        const associatedClient = event.clientId ? 
          clients.find(client => client.id === event.clientId) : null;
        
        // Criar cliente fictício se não existir associação
        const eventClient: Client = associatedClient || {
          id: event.id,
          name: event.title,
          email: '',
          phone: '',
          notes: event.description || '',
          status: 'fechado' as const,
          nextAction: 'editar' as const,
          contractValue: 0,
          downPayment: 0,
          eventCategory: 'Ensaio externo' as const,
          weddingDate: null,
          preWeddingDate: null,
          weddingStartTime: undefined,
          weddingEndTime: undefined,
          eventLocation: undefined,
          preWeddingStartTime: undefined,
          preWeddingEndTime: undefined,
          contractLink: undefined,
          hasPreWedding: undefined,
          preWeddingScheduled: undefined,
          preWeddingCompleted: undefined,
          preWeddingDelivered: undefined,
          weddingPhotographed: undefined,
          inEditing: undefined,
          linkSent: undefined,
          boxDelivered: undefined,
          albumDesigned: undefined,
          albumApprovedDelivered: undefined,
          isDelivered: undefined,
          coupleName: undefined,
          salesFunnelStage: 'projeto_finalizado' as const,
          payments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Determinar urgência baseada nos dias passados
        let urgency: "high" | "medium" | "low" = "medium";
        if (daysSinceEvent > 15) {
          urgency = "high";
        } else if (daysSinceEvent > 8) {
          urgency = "medium";
        } else {
          urgency = "low";
        }
        
        // Traduzir tipo de evento
        const eventTypeNames = {
          'pre-wedding': 'Pré-wedding',
          'photoshoot': 'Ensaio',
          'editing': 'Sessão de edição',
          'custom': 'Evento personalizado'
        };
        
        const eventTypeName = eventTypeNames[event.type as keyof typeof eventTypeNames] || 'Evento';
        
        let description = `${eventTypeName}: ${event.title}`;
        if (associatedClient) {
          description += ` - Cliente: ${associatedClient.name}`;
        }
        description += ` - Realizado há ${daysSinceEvent} ${daysSinceEvent === 1 ? 'dia' : 'dias'}`;
        
        if (event.description) {
          description += ` - ${event.description}`;
        }
        
        return {
          type: "calendar_event" as const,
          title: `Edição pendente: ${eventTypeName}`,
          description,
          client: eventClient,
          event,
          date: eventDate || now,
          urgency
        };
      });
    
    // Combinar alertas de edição de clientes e eventos do calendário
    const allEditTasks = [...editTasks, ...calendarEditingAlerts];
    
    // Deliver tasks — baseado no fluxo de trabalho: link enviado mas entrega física pendente
    const deliverTasks: AlertItem[] = clients
      .filter(client =>
        client.linkSent === true && client.boxDelivered !== true &&
        client.status !== "projeto_finalizado"
      )
      .sort((a, b) => {
        // Ordenar do evento mais antigo para o mais recente
        const da = a.weddingDate ? new Date(a.weddingDate).getTime() : 0;
        const db = b.weddingDate ? new Date(b.weddingDate).getTime() : 0;
        return da - db;
      })
      .map(client => {
        let description = `Cliente: ${client.name}`;
        let urgency: "high" | "medium" | "low" = "medium";
        
        if (client.weddingDate) {
          const weddingDate = stringToDate(client.weddingDate);
          if (weddingDate) {
            const daysSinceWedding = differenceInDays(now, weddingDate);
            
            if (daysSinceWedding > 0) {
              description += ` - Evento foi há ${daysSinceWedding} ${daysSinceWedding === 1 ? 'dia' : 'dias'}`;
              
              if (daysSinceWedding > 30) {
                urgency = "high";
              } else if (daysSinceWedding > 15) {
                urgency = "medium";
              } else {
                urgency = "low";
              }
            } else {
              const daysUntilWedding = Math.abs(daysSinceWedding);
              description += ` - Evento em ${daysUntilWedding} ${daysUntilWedding === 1 ? 'dia' : 'dias'}`;
              urgency = "low";
            }
          }
        }
        
        return {
          type: "task" as const,
          title: `Entrega pendente`,
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
    
    // Alertas de sessões/ensaios não agendados
    // - Casamentos: hasPreWedding=true sem preWeddingDate
    // - Ensaios (qualquer categoria não-casamento): status fechado sem weddingDate (sessão principal)
    // Eventos que têm um ensaio/sessão separado antes do evento principal (como pré-wedding)
    const isEventWithPreSession = (cat: string) => {
      const c = (cat || '').toLowerCase()
      return c.includes('casamento') || c.includes('debutante') || c.includes('15 anos') || c.includes('debut')
    }
    const isCasamento = isEventWithPreSession // alias para compatibilidade

    const preWeddingAlerts: AlertItem[] = clients
      .filter(client => {
        if (client.status !== "fechado") return false
        if (client.preWeddingCompleted === true) return false

        const category = client.eventCategory || ''
        const weddingDate = client.weddingDate ? stringToDate(client.weddingDate) : null
        const daysUntilWedding = weddingDate ? differenceInDays(weddingDate, now) : null

        if (isCasamento(category)) {
          // Casamento: só alerta se hasPreWedding=true e sem data de pré agendada
          if (!client.hasPreWedding) return false
          if (client.preWeddingDate) return false
          // Dentro do prazo de lembrete
          return daysUntilWedding === null || daysUntilWedding <= preWeddingReminderDays
        } else {
          // Ensaio (gestante, infantil, corporativo, externo, aniversário etc.)
          // Alerta se ainda não tem data do evento principal agendada
          return !client.weddingDate
        }
      })
      .map(client => {
        const category = client.eventCategory || ''
        const weddingDate = client.weddingDate ? stringToDate(client.weddingDate) : null
        const daysUntilWedding = weddingDate ? differenceInDays(weddingDate, now) : null
        let urgency: "high" | "medium" | "low" = "medium"

        if (isCasamento(category)) {
          // Urgência baseada na proximidade do casamento
          if (daysUntilWedding !== null) {
            if (daysUntilWedding <= 30) urgency = "high"
            else if (daysUntilWedding <= 60) urgency = "medium"
            else urgency = "low"
          }
        }
        // Ensaios sem data ficam como medium por padrão

        const isEnsaio = !isCasamento(category)
        const title = isEnsaio
          ? `Ensaio não agendado`
          : `Pré-wedding não agendado`

        const description = isEnsaio
          ? `Cliente: ${client.name} - ${category || 'Ensaio'} sem data agendada`
          : daysUntilWedding !== null
            ? `Cliente: ${client.name} - Agendar pré-wedding (Casamento em ${daysUntilWedding} dias)`
            : `Cliente: ${client.name} - Agendar pré-wedding/ensaio`

        return {
          type: "pre_wedding" as const,
          title,
          description,
          client,
          date: now,
          urgency
        }
      })
    
    // Combine and sort all payment alerts by urgency and type
    const allPaymentAlerts = [...paymentAlerts, ...duePaymentAlerts].sort((a, b) => {
      const urgencyOrder = { high: 0, medium: 1, low: 2 };
      return (urgencyOrder[a.urgency || 'medium'] - urgencyOrder[b.urgency || 'medium']) || 
             differenceInDays(a.date, b.date);
    });

    return { 
      editTasks: allEditTasks, 
      deliverTasks,
      payments: allPaymentAlerts as AlertItem[],
      preWedding: preWeddingAlerts as AlertItem[]
    };
  }, [clients, events, preWeddingReminderDays]);

  return alerts;
}
