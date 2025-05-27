
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

        // Processar pagamentos agendados
        client.payments.forEach(payment => {
          if (payment.payment_status === 'pendente' && payment.due_date) {
            const dueDate = new Date(payment.due_date);
            const monthIndex = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30));
            
            if (monthIndex >= 0 && monthIndex < 6) {
              nextSixMonths[monthIndex].guaranteed += Number(payment.amount);
              console.log(`Pagamento garantido: R$ ${payment.amount} em ${payment.due_date}`);
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
        });

        // Projetar pagamentos baseados na data do evento
        if (client.weddingDate && pendingAmount > 0) {
          const eventDate = new Date(client.weddingDate);
          const monthsUntilEvent = Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30));
          
          if (monthsUntilEvent >= 0 && monthsUntilEvent < 6) {
            // Se o evento é próximo, considerar como receita provável
            if (client.status === 'fechado' || client.status === 'em andamento') {
              nextSixMonths[monthsUntilEvent].probable += pendingAmount;
              console.log(`Receita provável: R$ ${pendingAmount} para evento em ${client.weddingDate}`);
            } else if (client.status === 'orçamento enviado' || client.status === 'follow-up') {
              nextSixMonths[monthsUntilEvent].potential += pendingAmount * 0.3; // 30% de chance
              console.log(`Receita potencial: R$ ${pendingAmount * 0.3} para orçamento ${client.name}`);
            }
          }
        }

        // Para clientes sem data de evento, distribuir em parcelas mensais
        if (!client.weddingDate && pendingAmount > 0 && (client.status === 'fechado' || client.status === 'em andamento')) {
          const monthlyInstallment = pendingAmount / 3; // Distribuir em 3 meses
          for (let i = 0; i < 3 && i < 6; i++) {
            nextSixMonths[i].probable += monthlyInstallment;
          }
        }
      });

      // Calcular totais
      nextSixMonths.forEach(month => {
        month.total = month.guaranteed + month.probable + month.potential;
      });

      console.log("=== Projeções Calculadas ===");
      nextSixMonths.forEach(month => {
        console.log(`${month.month}/${month.year}: Garantido R$ ${month.guaranteed}, Provável R$ ${month.probable}, Potencial R$ ${month.potential}, Total R$ ${month.total}`);
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
