
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

interface ProjectionCache {
  data: MonthlyProjection[];
  alerts: PaymentAlert[];
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

  // Função otimizada de cálculo de projeções
  const calculateProjections = useCallback(() => {
    console.log("=== Iniciando cálculo otimizado de projeções ===");
    
    // Verificar cache primeiro
    const cached = getCachedData();
    if (cached) {
      console.log("Usando dados do cache");
      setProjections(cached.data);
      setPaymentAlerts(cached.alerts);
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
          total: 0
        };
      });

      const alerts: PaymentAlert[] = [];

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
        // Calcular valor pago usando Map otimizado
        const clientTransactions = transactionsByClient.get(client.id) || [];
        const totalPaid = clientTransactions
          .filter(t => t.type === 'entrada')
          .reduce((sum, t) => sum + Number(t.amount), 0);
        
        const pendingAmount = Number(client.contractValue) - totalPaid;

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
              
              // Otimizar busca do mês correto
              const monthIndex = nextSixMonths.findIndex(month => {
                const monthStart = new Date(today.getFullYear(), today.getMonth() + nextSixMonths.indexOf(month), 1);
                const monthEnd = new Date(today.getFullYear(), today.getMonth() + nextSixMonths.indexOf(month) + 1, 0);
                return dueDate >= monthStart && dueDate <= monthEnd;
              });

              if (monthIndex !== -1) {
                nextSixMonths[monthIndex].guaranteed += Number(payment.amount);
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
            if (client.status === 'fechado' || client.status === 'em andamento') {
              nextSixMonths[monthIndex].probable += pendingAmount;
            } else if (client.status === 'orçamento enviado' || client.status === 'follow-up') {
              nextSixMonths[monthIndex].potential += pendingAmount * 0.3;
            }
          }
        }

        // Distribuir valores pendentes otimizado
        if (!client.weddingDate && pendingAmount > 0 && (client.status === 'fechado' || client.status === 'em andamento')) {
          const monthlyInstallment = pendingAmount / 3;
          for (let i = 0; i < Math.min(3, 6); i++) {
            nextSixMonths[i].probable += monthlyInstallment;
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
        timestamp: Date.now()
      };

      setProjections(nextSixMonths);
      setPaymentAlerts(sortedAlerts);

    } catch (error) {
      console.error("Erro ao calcular projeções:", error);
      setProjections([]);
      setPaymentAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [clientsData, transactionsData, getCachedData]);

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
    refreshProjections
  };
}
