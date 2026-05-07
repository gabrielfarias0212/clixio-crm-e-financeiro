
import { Client } from "@/utils/types";
import { useTransactions } from "@/contexts/TransactionsContext";
import { useMemo } from "react";

interface FinancialInfoProps {
  client: Client;
}

export function FinancialInfo({ client }: FinancialInfoProps) {
  const { transactions } = useTransactions();

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  // Calculate financial totals with improved logic to avoid double counting
  const financialTotals = useMemo(() => {
    console.log(`=== Calculando totais para cliente ${client.name} ===`);
    
    // Get all client transactions (entrada only)
    const clientTransactions = transactions.filter(transaction => 
      transaction.clientId === client.id && 
      transaction.type === 'entrada'
    );
    
    console.log(`Transações do cliente encontradas:`, clientTransactions.length);
    clientTransactions.forEach(t => console.log(`- ID: ${t.id}, Valor: ${t.amount}, PaymentID: ${t.paymentId || 'null'}`));
    
    // Get payments
    console.log(`Pagamentos do cliente:`, client.payments.length);
    client.payments.forEach(p => console.log(`- ID: ${p.id}, Valor: ${p.amount}`));
    
    // Strategy: Use a hybrid approach to avoid double counting
    let totalPayments = 0;
    let transactionPayments = 0;
    let orphanedTransactions = 0;
    
    // First, sum all payments from the payments table
    // Somar apenas pagamentos efetivamente pagos (não pendentes nem atrasados)
    const paymentsTotal = client.payments
      .filter(p => p.payment_status === "pago")
      .reduce((sum, payment) => sum + Number(payment.amount), 0);
    console.log(`Total de pagamentos diretos: ${paymentsTotal}`);
    
    // Then, find transactions that don't have a corresponding payment
    const orphanedTransactionsList = clientTransactions.filter(transaction => {
      // If transaction has a paymentId, it's already linked to a payment
      if (transaction.paymentId) {
        return false;
      }
      
      // Check if there's a payment with the same amount and similar date
      const hasMatchingPayment = client.payments.some(payment => {
        const paymentAmount = Number(payment.amount);
        const transactionAmount = Number(transaction.amount);
        const paymentDate = new Date(payment.date).toDateString();
        const transactionDate = new Date(transaction.date).toDateString();
        
        // Consider it a match if amounts are equal and dates are the same
        return paymentAmount === transactionAmount && paymentDate === transactionDate;
      });
      
      return !hasMatchingPayment;
    });
    
    orphanedTransactions = orphanedTransactionsList.reduce((sum, transaction) => 
      sum + Number(transaction.amount), 0
    );
    
    console.log(`Transações órfãs (sem pagamento correspondente):`, orphanedTransactionsList.length);
    orphanedTransactionsList.forEach(t => console.log(`- ID: ${t.id}, Valor: ${t.amount}, Data: ${t.date}`));
    console.log(`Total de transações órfãs: ${orphanedTransactions}`);
    
    // Total payments = payments from table + orphaned transactions
    totalPayments = paymentsTotal + orphanedTransactions;
    
    const remainingValue = client.contractValue - totalPayments;
    
    console.log(`Resumo do cálculo:`, {
      contractValue: client.contractValue,
      paymentsFromTable: paymentsTotal,
      orphanedTransactions: orphanedTransactions,
      totalPayments,
      remainingValue
    });
    
    return {
      totalPayments,
      remainingValue,
      hasOrphanedTransactions: orphanedTransactions > 0,
      paymentsFromTable: paymentsTotal,
      orphanedTransactionsAmount: orphanedTransactions
    };
  }, [client, transactions]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Informações Financeiras</h2>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-700">Valor do Contrato:</span>
          <span className="font-medium">{formatCurrency(client.contractValue)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">Valor Pago:</span>
          <span className="font-medium text-green-600">
            {formatCurrency(financialTotals.totalPayments)}
          </span>
        </div>
        
        {/* Show breakdown if there are orphaned transactions */}
        {financialTotals.hasOrphanedTransactions && (
          <div className="ml-4 space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>• Pagamentos registrados:</span>
              <span>{formatCurrency(financialTotals.paymentsFromTable)}</span>
            </div>
            <div className="flex justify-between">
              <span>• Transações sem pagamento:</span>
              <span>{formatCurrency(financialTotals.orphanedTransactionsAmount)}</span>
            </div>
          </div>
        )}
        
        <div className="flex justify-between">
          <span className="text-gray-700">Valor Restante:</span>
          <span className={`font-medium ${financialTotals.remainingValue > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(financialTotals.remainingValue)}
          </span>
        </div>
      </div>
    </div>
  );
}
