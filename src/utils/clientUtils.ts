import { Client, ClientStatus } from "./types";
import { format } from "date-fns";

// Format date function
export const formatDate = (date: Date): string => {
  return format(date, "dd/MM/yyyy");
};

// Helper function to check if a client has fully paid
export const isFullyPaid = (client: Client): boolean => {
  const totalPaid = client.payments.reduce((sum, payment) => sum + payment.amount, 0);
  return totalPaid >= client.contractValue;
};

// Helper function to check if the work is fully delivered
export const isWorkDelivered = (client: Client): boolean => {
  // If explicitly marked as delivered
  if (client.isDelivered) return true;
  
  // For weddings and anniversaries, check all workflow steps
  if (client.eventCategory === "Casamento" || client.eventCategory === "Aniversario") {
    const basicStepsCompleted = [
      client.weddingPhotographed,
      client.inEditing,
      client.linkSent
    ].every(Boolean);
    
    // If has pre-wedding, check pre-wedding steps too
    if (client.hasPreWedding !== false) {
      const preWeddingStepsCompleted = [
        client.preWeddingScheduled,
        client.preWeddingCompleted,
        client.preWeddingDelivered
      ].every(Boolean);
      
      return basicStepsCompleted && preWeddingStepsCompleted;
    }
    
    return basicStepsCompleted;
  }
  
  // For other events, just check if photographed and link sent
  return client.weddingPhotographed === true && client.linkSent === true;
};

// Helper function to determine the correct status based on payments and delivery
export const getUpdatedStatus = (client: Client, newPaymentAmount: number = 0): ClientStatus => {
  const totalPaid = client.payments.reduce((sum, payment) => sum + payment.amount, 0) + newPaymentAmount;
  const fullyPaid = totalPaid >= client.contractValue;
  const workDelivered = isWorkDelivered(client);
  
  // If work is delivered, mark as delivered
  if (workDelivered && fullyPaid) {
    return "entregue";
  }
  
  // If fully paid but not delivered, keep as paid
  if (fullyPaid) {
    return "pago";
  }
  
  return client.status;
};

// Helper function to check if client should show delivery indicator
export const shouldShowDeliveredIndicator = (client: Client): boolean => {
  return client.status === "entregue" || isWorkDelivered(client);
};
