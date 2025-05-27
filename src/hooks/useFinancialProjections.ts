
import { useState, useEffect, useCallback } from "react";
import { useClients } from "@/contexts/ClientsContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { Client, Payment } from "@/utils/types";

interface MonthlyProjection {
  month: string;
  year: number;
  guaranteed: number; // Pagamentos agendados com data
  probable: number;   // Valores de contratos fechados
  potential: number;  // Orçamentos em negociação
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

export function useFinancialProjections() {
  const { clients } = useClients();
  const { transactions } = useTransactions();
  const [projections, setProjections] = useState<MonthlyProjection[]>([]);
  const [paymentAlerts, setPaymentAlerts] = useState<PaymentAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const calculateProjections = useCallback(() => {
    console.log("=== Calculando Projeções Financeiras ===");
    setLoading(true);

    try {
      const today = new Date();
      const nextSixMonths: MonthlyProjection[] = [];
      
      // Gerar próximos 6 meses
      for (let i = 0; i < 6; i++) {
        const targetDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
        const monthName = targetDate.toLocaleDateString('pt-BR', { month: 'long' });
        const year = targetDate.getFullYear();
        
        nextSixMonths.push({
          month: monthName,
          year,
          guaranteed: 0,
          probable: 0,
          potential: 0,
          total: 0
        });
      }

      const alerts: PaymentAlert[] = [];

      clients.forEach(client => {
        // Calcular valor já pago pelo cliente
        const clientTransactions = transactions.filter(t => t.clientId === client.id && t.type === 'entrada');
        const totalPaid = clientTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
        const pendingAmount = Number(client.contractValue) - totalPaid;

        console.log(`Cliente ${client.name}: Contrato R$ ${client.contractValue}, Pago R$ ${totalPaid}, Pendente R$ ${pendingAmount}`);

        // Processar pagamentos agendados - CORRIGIDO
        client.payments.forEach(payment => {
          if (payment.payment_status === 'pendente' && payment.due_date) {
            // Parse da data corretamente
            const dueDateParts = payment.due_date.split('/');
            if (dueDateParts.length === 3) {
              // Formato DD/MM/YYYY
              const dueDate = new Date(
                parseInt(dueDateParts[2]), // ano
                parseInt(dueDateParts[1]) - 1, // mês (0-based)
                parseInt(dueDateParts[0]) // dia
              );
              
              console.log(`Processando pagamento: R$ ${payment.amount} vencimento ${payment.due_date} -> ${dueDate.toISOString()}`);
              
              // Encontrar o mês correto para este pagamento
              for (let i = 0; i < 6; i++) {
                const monthStart = new Date(today.getFullYear(), today.getMonth() + i, 1);
                const monthEnd = new Date(today.getFullYear(), today.getMonth() + i + 1, 0);
                
                if (dueDate >= monthStart && dueDate <= monthEnd) {
                  nextSixMonths[i].guaranteed += Number(payment.amount);
                  console.log(`Pagamento garantido adicionado ao mês ${i} (${nextSixMonths[i].month}): R$ ${payment.amount}`);
                  break;
                }
              }

              // Criar alertas para pagamentos próximos
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

        // Projetar pagamentos baseados na data do evento - MELHORADO
        if (client.weddingDate && pendingAmount > 0) {
          const eventDate = new Date(client.weddingDate);
          console.log(`Cliente ${client.name}: Data do evento ${client.weddingDate} -> ${eventDate.toISOString()}`);
          
          // Encontrar o mês do evento
          for (let i = 0; i < 6; i++) {
            const monthStart = new Date(today.getFullYear(), today.getMonth() + i, 1);
            const monthEnd = new Date(today.getFullYear(), today.getMonth() + i + 1, 0);
            
            if (eventDate >= monthStart && eventDate <= monthEnd) {
              if (client.status === 'fechado' || client.status === 'em andamento') {
                // Para contratos fechados, considerar como receita provável no mês do evento
                nextSixMonths[i].probable += pendingAmount;
                console.log(`Receita provável adicionada ao mês ${i} (${nextSixMonths[i].month}): R$ ${pendingAmount} para evento de ${client.name}`);
              } else if (client.status === 'orçamento enviado' || client.status === 'follow-up') {
                // Para orçamentos, considerar como potencial com 30% de probabilidade
                nextSixMonths[i].potential += pendingAmount * 0.3;
                console.log(`Receita potencial adicionada ao mês ${i} (${nextSixMonths[i].month}): R$ ${pendingAmount * 0.3} para orçamento ${client.name}`);
              }
              break;
            }
          }
        }

        // Para clientes sem data de evento definida mas com valor pendente
        if (!client.weddingDate && pendingAmount > 0 && (client.status === 'fechado' || client.status === 'em andamento')) {
          // Distribuir o valor pendente nos próximos 3 meses
          const monthlyInstallment = pendingAmount / 3;
          for (let i = 0; i < 3 && i < 6; i++) {
            nextSixMonths[i].probable += monthlyInstallment;
            console.log(`Receita distribuída para mês ${i} (${nextSixMonths[i].month}): R$ ${monthlyInstallment} do cliente ${client.name}`);
          }
        }
      });

      // Calcular totais
      nextSixMonths.forEach(month => {
        month.total = month.guaranteed + month.probable + month.potential;
      });

      console.log("=== Projeções Finais ===");
      nextSixMonths.forEach((month, index) => {
        console.log(`Mês ${index} - ${month.month}/${month.year}:`);
        console.log(`  Garantido: R$ ${month.guaranteed.toFixed(2)}`);
        console.log(`  Provável: R$ ${month.probable.toFixed(2)}`);
        console.log(`  Potencial: R$ ${month.potential.toFixed(2)}`);
        console.log(`  Total: R$ ${month.total.toFixed(2)}`);
      });

      setProjections(nextSixMonths);
      setPaymentAlerts(alerts.sort((a, b) => a.daysUntilDue - b.daysUntilDue));

    } catch (error) {
      console.error("Erro ao calcular projeções:", error);
      setProjections([]);
      setPaymentAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [clients, transactions]);

  useEffect(() => {
    calculateProjections();
  }, [calculateProjections]);

  const totalGuaranteed = projections.reduce((sum, p) => sum + p.guaranteed, 0);
  const totalProbable = projections.reduce((sum, p) => sum + p.probable, 0);
  const totalPotential = projections.reduce((sum, p) => sum + p.potential, 0);

  return {
    projections,
    paymentAlerts,
    loading,
    summary: {
      totalGuaranteed,
      totalProbable,
      totalPotential,
      totalProjected: totalGuaranteed + totalProbable + totalPotential
    },
    refreshProjections: calculateProjections
  };
}
