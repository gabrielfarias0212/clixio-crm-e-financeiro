
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

  // Calculate financial totals considering both payments and transactions
  const financialTotals = useMemo(() => {
    // Calculate total from payments
    const totalFromPayments = client.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    
    // Calculate total from transactions related to this client (entrada only)
    // Exclude transactions that already have a payment_id to avoid double counting
    const clientTransactions = transactions.filter(transaction => 
      transaction.clientId === client.id && 
      transaction.type === 'entrada' && 
      !transaction.paymentId
    );
    
    const totalFromTransactions = clientTransactions.reduce((sum, transaction) => 
      sum + Number(transaction.amount), 0
    );
    
    const totalPayments = totalFromPayments + totalFromTransactions;
    const remainingValue = client.contractValue - totalPayments;
    
    console.log(`Cliente ${client.name}:`, {
      contractValue: client.contractValue,
      totalFromPayments,
      totalFromTransactions,
      totalPayments,
      remainingValue
    });
    
    return {
      totalPayments,
      remainingValue,
      hasTransactionPayments: totalFromTransactions > 0
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
        {financialTotals.hasTransactionPayments && (
          <div className="text-xs text-gray-500 ml-4">
            * Inclui transações financeiras relacionadas ao cliente
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
