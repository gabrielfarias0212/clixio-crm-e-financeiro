
import { Client, Transaction } from "./types";

interface FinancialSummary {
  totalPayments: number;
  remainingValue: number;
  hasOrphanedTransactions: boolean;
  paymentsFromTable: number;
  orphanedTransactionsAmount: number;
}

/**
 * Calculates financial totals for a client, avoiding double counting
 * between payments and transactions
 */
export const calculateClientFinancials = (
  client: Client, 
  transactions: Transaction[]
): FinancialSummary => {
  console.log(`=== Calculating financials for client ${client.name} ===`);
  
  // Get all client transactions (entrada only)
  const clientTransactions = transactions.filter(transaction => 
    transaction.clientId === client.id && 
    transaction.type === 'entrada'
  );
  
  // Sum all payments from the payments table
  const paymentsTotal = client.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  
  // Find transactions that don't have a corresponding payment
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
  
  const orphanedTransactions = orphanedTransactionsList.reduce((sum, transaction) => 
    sum + Number(transaction.amount), 0
  );
  
  // Total payments = payments from table + orphaned transactions
  const totalPayments = paymentsTotal + orphanedTransactions;
  const remainingValue = client.contractValue - totalPayments;
  
  console.log(`Financial calculation summary:`, {
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
};

/**
 * Identifies transactions that should be linked to existing payments
 * but currently aren't
 */
export const findOrphanedTransactions = (
  client: Client,
  transactions: Transaction[]
): Transaction[] => {
  const clientTransactions = transactions.filter(transaction => 
    transaction.clientId === client.id && 
    transaction.type === 'entrada' &&
    !transaction.paymentId
  );
  
  return clientTransactions.filter(transaction => {
    // Check if there's a payment that should be linked to this transaction
    return client.payments.some(payment => {
      const paymentAmount = Number(payment.amount);
      const transactionAmount = Number(transaction.amount);
      const paymentDate = new Date(payment.date).toDateString();
      const transactionDate = new Date(transaction.date).toDateString();
      
      return paymentAmount === transactionAmount && paymentDate === transactionDate;
    });
  });
};
