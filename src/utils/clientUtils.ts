
import { Client, ClientStatus } from "./types";

// Helper function to check if a client has fully paid
export const isFullyPaid = (client: Client): boolean => {
  const totalPaid = client.payments.reduce((sum, payment) => sum + payment.amount, 0);
  return totalPaid >= client.contractValue;
};

// Helper function to update client status based on payments
export const getUpdatedStatus = (client: Client, newPaymentAmount: number = 0): ClientStatus => {
  const totalPaid = client.payments.reduce((sum, payment) => sum + payment.amount, 0) + newPaymentAmount;
  
  if (totalPaid >= client.contractValue) {
    return "pago";
  }
  
  return client.status;
};
