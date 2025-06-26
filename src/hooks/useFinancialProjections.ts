
import { useState, useEffect, useCallback, useMemo } from "react";
import { useClients } from "@/contexts/ClientsContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { Client, Payment } from "@/utils/types";

interface MonthlyProjection {
  month: string;
  year: number;
  guaranteed: number;
  probable: number;
  potential: number;
  total: number;
  events: ProjectionEvent[];
}

interface PaymentAlert {
  id: string;
  clientName: string;
  amount: number;
  dueDate: string;
  daysUntilDue: number;
  status: 'overdue' | 'due_soon' | 'upcoming';
  description: string;
}

interface ProjectionEvent {
  id: string;
  clientName: string;
  clientId: string;
  eventDate: string;
  amount: number;
  type: 'guaranteed' | 'probable' | 'potential';
  status: string;
  description: string;
  location?: string;
}

interface ProjectionCache {
  data: MonthlyProjection[];
  alerts: PaymentAlert[];
  events: {
    guaranteed: ProjectionEvent[];
    probable: ProjectionEvent[];
    potential: ProjectionEvent[];
  };
  timestamp: number;
}

// Cache com TTL de 5 minutos
const CACHE_TTL = 5 * 60 * 1000;
let projectionCache: ProjectionCache | null = null;

export function useFinancialProjections() {
  const { clients } = useClients();
  const { transactions } = useTransactions();
  const [projections, setProjections] = useState<MonthlyProjection[]>([]);
  const [paymentAlerts, setPaymentAlerts] = useState<PaymentAlert[]>([]);
  const [detailedEvents, setDetailedEvents] = useState<{
    guaranteed: ProjectionEvent[];
    probable: ProjectionEvent[];
    potential: ProjectionEvent[];
  }>({
    guaranteed: [],
    probable: [],
    potential: []
  });
  const [loading, setLoading] = useState(true);

  // Memoizar dados de entrada para evitar recálculos desnecessários
  const clientsData = useMemo(() => clients, [clients]);
  const transactionsData = useMemo(() => transactions, [transactions]);

  // Função otimizada para verificar cache
  const getCachedData = useCallback(() => {
    if (projectionCache && Date.now() - projectionCache.timestamp < CACHE_TTL) {
      return projectionCache;
    }
    return null;
  }, []);

  // Função para verificar se um contrato está totalmente quitado
  const isContractFullyPaid = useCallback((client: Client, clientTransactions: typeof transactionsData) => {
    // Calcular valor total pago através de transações
    const totalPaidViaTransactions = clientTransactions
      .filter(t => t.type === 'entrada')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    // Calcular valor total pago através de pagamentos marcados como "pago"
    const totalPaidViaPayments = client.payments
      .filter(p => p.payment_status === 'pago')
      .reduce((sum, p) => sum + Number(p.amount), 0);
    
    // Usar o maior valor entre transações e pagamentos
    const totalPaid = Math.max(totalPaidViaTransactions, totalPaidViaPayments);
    
    const contractValue = Number(client.contractValue) || 0;
    const pendingAmount = contractValue - totalPaid;
    
    console.log(`Cliente ${client.name}:`, {
      contractValue,
      totalPaidViaTransactions,
      totalPaidViaPayments,
      totalPaid,
      pendingAmount,
      isFullyPaid: pendingAmount <= 0
    });
    
    // Considerar quitado se o valor pendente é <= 0
    return pendingAmount <= 0;
  }, []);

  // Função otimizada de cálculo de projeções
  const calculateProjections = useCallback(() => {
    console.log("=== Iniciando cálculo otimizado de projeções ===");
    
    // Verificar cache primeiro
    const cached = getCachedData();
    if (cached) {
      console.log("Usando dados do cache");
      setProjections(cached.data);
      setPaymentAlerts(cached.alerts);
      setDetailedEvents(cached.events);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const today = new Date();
      
      // Pre-calcular os próximos 6 meses uma vez
      const nextSixMonths: MonthlyProjection[] = Array.from({ length: 6 }, (_, i) => {
        const targetDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
        return {
          month: targetDate.toLocaleDateString('pt-BR', { month: 'long' }),
          year: targetDate.getFullYear(),
          guaranteed: 0,
          probable: 0,
          potential: 0,
          total: 0,
          events: []
        };
      });

      const alerts: PaymentAlert[] = [];
      const events = {
        guaranteed: [] as ProjectionEvent[],
        probable: [] as ProjectionEvent[],
        potential: [] as ProjectionEvent[]
      };

      // Otimizar o processamento de clientes usando Map para lookup de transações
      const transactionsByClient = new Map<string, typeof transactionsData>();
      transactionsData.forEach(t => {
        if (t.clientId) {
          if (!transactionsByClient.has(t.clientId)) {
            transactionsByClient.set(t.clientId, []);
          }
          transactionsByClient.get(t.clientId)!.push(t);
        }
      });

      clientsData.forEach(client => {
        // Verificar se o contrato está totalmente quitado
        const clientTransactions = transactionsByClient.get(client.id) || [];
        const isFullyPaid = isContractFullyPaid(client, clientTransactions);
        
        // Se o contrato está quitado, pular este cliente das projeções
        if (isFullyPaid) {
          console.log(`Pulando cliente ${client.name} - contrato quitado`);
          return;
        }
        
        // Calcular valor pago usando Map otimizado
        const totalPaid = clientTransactions
          .filter(t => t.type === 'entrada')
          .reduce((sum, t) => sum + Number(t.amount), 0);
        
        const pendingAmount = Number(client.contractValue) - totalPaid;

        // Só processar se há valor pendente
        if (pendingAmount <= 0) {
          return;
        }

        // Processar pagamentos agendados otimizado
        client.payments.forEach(payment => {
          if (payment.payment_status === 'pendente' && payment.due_date) {
            const dueDateParts = payment.due_date.split('/');
            if (dueDateParts.length === 3) {
              const dueDate = new Date(
                parseInt(dueDateParts[2]),
                parseInt(dueDateParts[1]) - 1,
                parseInt(dueDateParts[0])
              );
              
              // Adicionar evento garantido
              events.guaranteed.push({
                id: payment.id,
                clientName: client.name,
                clientId: client.id,
                eventDate: dueDate.toISOString(),
                amount: Number(payment.amount),
                type: 'guaranteed',
                status: client.status || 'pendente',
                description: payment.notes || 'Pagamento agendado',
                location: client.eventLocation
              });
              
              // Otimizar busca do mês correto
              const monthIndex = nextSixMonths.findIndex(month => {
                const monthStart = new Date(today.getFullYear(), today.getMonth() + nextSixMonths.indexOf(month), 1);
                const monthEnd = new Date(today.getFullYear(), today.getMonth() + nextSixMonths.indexOf(month) + 1, 0);
                return dueDate >= monthStart && dueDate <= monthEnd;
              });

              if (monthIndex !== -1) {
                nextSixMonths[monthIndex].guaranteed += Number(payment.amount);
                nextSixMonths[monthIndex].events.push(events.guaranteed[events.guaranteed.length - 1]);
              }

              // Criar alertas otimizado
              const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              
              if (daysUntilDue <= 30) {
                let status: PaymentAlert['status'] = 'upcoming';
                if (daysUntilDue < 0) status = 'overdue';
                else if (daysUntilDue <= 7) status = 'due_soon';

                alerts.push({
                  id: payment.id,
                  clientName: client.name,
                  amount: Number(payment.amount),
                  dueDate: payment.due_date,
                  daysUntilDue,
                  status,
                  description: payment.notes || 'Pagamento agendado'
                });
              }
            }
          }
        });

        // Projetar pagamentos baseados na data do evento otimizado
        if (client.weddingDate && pendingAmount > 0) {
          const eventDate = new Date(client.weddingDate);
          
          const monthIndex = nextSixMonths.findIndex(month => {
            const monthStart = new Date(today.getFullYear(), today.getMonth() + nextSixMonths.indexOf(month), 1);
            const monthEnd = new Date(today.getFullYear(), today.getMonth() + nextSixMonths.indexOf(month) + 1, 0);
            return eventDate >= monthStart && eventDate <= monthEnd;
          });

          if (monthIndex !== -1) {
            if (client.status === 'fechado') {
              nextSixMonths[monthIndex].probable += pendingAmount;
              
              const probableEvent: ProjectionEvent = {
                id: `probable-${client.id}`,
                clientName: client.name,
                clientId: client.id,
                eventDate: client.weddingDate,
                amount: pendingAmount,
                type: 'probable',
                status: client.status || 'fechado',
                description: `Valor pendente do contrato - ${client.eventCategory || 'Casamento'}`,
                location: client.eventLocation
              };
              
              events.probable.push(probableEvent);
              nextSixMonths[monthIndex].events.push(probableEvent);
            } else if (client.status === 'orçamento enviado' || client.status === 'negociacao') {
              const potentialAmount = pendingAmount * 0.3;
              nextSixMonths[monthIndex].potential += potentialAmount;
              
              const potentialEvent: ProjectionEvent = {
                id: `potential-${client.id}`,
                clientName: client.name,
                clientId: client.id,
                eventDate: client.weddingDate,
                amount: potentialAmount,
                type: 'potential',
                status: client.status || 'orçamento enviado',
                description: `Receita potencial (30%) - ${client.eventCategory || 'Casamento'}`,
                location: client.eventLocation
              };
              
              events.potential.push(potentialEvent);
              nextSixMonths[monthIndex].events.push(potentialEvent);
            }
          }
        }

        // Distribuir valores pendentes otimizado apenas se não tem data de evento
        if (!client.weddingDate && pendingAmount > 0 && client.status === 'fechado') {
          const monthlyInstallment = pendingAmount / 3;
          for (let i = 0; i < Math.min(3, 6); i++) {
            nextSixMonths[i].probable += monthlyInstallment;
            
            const installmentEvent: ProjectionEvent = {
              id: `installment-${client.id}-${i}`,
              clientName: client.name,
              clientId: client.id,
              eventDate: new Date(today.getFullYear(), today.getMonth() + i, 15).toISOString(),
              amount: monthlyInstallment,
              type: 'probable',
              status: client.status || 'fechado',
              description: `Parcela ${i + 1}/3 - Valor pendente`,
              location: client.eventLocation
            };
            
            events.probable.push(installmentEvent);
            nextSixMonths[i].events.push(installmentEvent);
          }
        }
      });

      // Calcular totais uma vez
      nextSixMonths.forEach(month => {
        month.total = month.guaranteed + month.probable + month.potential;
      });

      // Ordenar alertas uma vez
      const sortedAlerts = alerts.sort((a, b) => a.daysUntilDue - b.daysUntilDue);

      // Cache dos resultados
      projectionCache = {
        data: nextSixMonths,
        alerts: sortedAlerts,
        events,
        timestamp: Date.now()
      };

      setProjections(nextSixMonths);
      setPaymentAlerts(sortedAlerts);
      setDetailedEvents(events);

    } catch (error) {
      console.error("Erro ao calcular projeções:", error);
      setProjections([]);
      setPaymentAlerts([]);
      setDetailedEvents({ guaranteed: [], probable: [], potential: [] });
    } finally {
      setLoading(false);
    }
  }, [clientsData, transactionsData, getCachedData, isContractFullyPaid]);

  useEffect(() => {
    calculateProjections();
  }, [calculateProjections]);

  // Memoizar summary para evitar recálculos
  const summary = useMemo(() => {
    const totalGuaranteed = projections.reduce((sum, p) => sum + p.guaranteed, 0);
    const totalProbable = projections.reduce((sum, p) => sum + p.probable, 0);
    const totalPotential = projections.reduce((sum, p) => sum + p.potential, 0);

    return {
      totalGuaranteed,
      totalProbable,
      totalPotential,
      totalProjected: totalGuaranteed + totalProbable + totalPotential
    };
  }, [projections]);

  // Função de refresh que limpa o cache
  const refreshProjections = useCallback(() => {
    projectionCache = null;
    calculateProjections();
  }, [calculateProjections]);

  return {
    projections,
    paymentAlerts,
    loading,
    summary,
    detailedEvents,
    refreshProjections
  };
}
