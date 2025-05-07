import { Client, ClientStatus, NextAction, EventCategory, Payment } from "./types";
import { v4 as uuidv4 } from 'uuid';
import { dateToString } from "./dateUtils";

// Function to generate a random date within a range
const randomDate = (start: Date, end: Date): string => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return dateToString(date);
};

// Current date
const now = new Date();

// Create dates for wedding season (mostly in spring and summer)
const nextYear = new Date(now.getFullYear() + 1, 0, 1);
const inTwoYears = new Date(now.getFullYear() + 2, 0, 1);

// Sample status options
const statusOptions: ClientStatus[] = [
  "orçamento enviado",
  "follow-up",
  "fechado",
  "em andamento",
  "pago"
];

// Sample next action options
const nextActionOptions: NextAction[] = [
  "responder",
  "enviar proposta",
  "editar",
  "entregar",
  "nenhuma",
  "agendar reunião" // New option added
];

// Sample event categories
const eventCategories: EventCategory[] = [
  "Casamento",
  "Aniversario",
  "Civil",
  "Ensaio Estudio",
  "Ensaio externo",
  "Evento Corporativo",
  "15 anos" // New category added
];

// Function to generate a single client
const generateClient = (): Client => {
  // Randomly determine the client status
  const statusIndex = Math.floor(Math.random() * statusOptions.length);
  const status = statusOptions[statusIndex];

  // Set the next action based on status
  let nextAction: NextAction;
  if (status === "orçamento enviado") {
    nextAction = Math.random() > 0.5 ? "responder" : "enviar proposta";
  } else if (status === "follow-up") {
    nextAction = "responder";
  } else if (status === "fechado") {
    nextAction = "editar";
  } else if (status === "em andamento") {
    nextAction = "entregar";
  } else {
    nextAction = "nenhuma";
  }

  // Randomly generate a wedding date if not already closed
  const weddingDate = status === "orçamento enviado" && Math.random() > 0.7 
    ? null 
    : randomDate(nextYear, inTwoYears);

  // Contract value varies based on the client status
  let contractValue = 0;
  if (status === "orçamento enviado" || status === "follow-up") {
    contractValue = Math.floor(Math.random() * 4000) + 2000;
  } else {
    contractValue = Math.floor(Math.random() * 8000) + 3000;
  }

  // Down payment calculation (30-50% for closed contracts)
  const downPayment = (status === "fechado" || status === "em andamento" || status === "pago") 
    ? Math.round(contractValue * (0.3 + Math.random() * 0.2)) 
    : 0;

  // Generate payments history for clients with down payment
  const payments: Payment[] = [];
  if (downPayment > 0) {
    payments.push({
      id: uuidv4(),
      amount: downPayment,
      date: randomDate(new Date(now.getFullYear(), now.getMonth() - 2, 1), now),
      notes: "Entrada inicial"
    });

    if (status === "em andamento" || status === "pago") {
      const numExtraPayments = Math.floor(Math.random() * 3) + (status === "pago" ? 2 : 0);
      
      let remainingAmount = contractValue - downPayment;
      const paymentDates = Array(numExtraPayments).fill(0)
        .map(() => randomDate(new Date(now.getFullYear(), now.getMonth() - 3, 1), now))
        .sort();
      
      for (let j = 0; j < numExtraPayments; j++) {
        const isLastPayment = j === numExtraPayments - 1 && status === "pago";
        const paymentAmount = isLastPayment 
          ? remainingAmount 
          : Math.min(Math.round(remainingAmount / (numExtraPayments - j) * Math.random() * 1.5), remainingAmount);
        
        payments.push({
          id: uuidv4(),
          amount: paymentAmount,
          date: paymentDates[j],
          notes: isLastPayment ? "Pagamento final" : "Parcela"
        });
        
        remainingAmount -= paymentAmount;
      }
    }
  }

  // Randomly select an event category, with higher probability for weddings
  const eventCategory = Math.random() > 0.6 
    ? "Casamento" 
    : eventCategories[Math.floor(Math.random() * eventCategories.length)];

  // Create the client object
  return {
    id: uuidv4(),
    name: "", // Placeholder for name - will need to be populated from actual data
    weddingDate,
    contractValue,
    status,
    nextAction,
    email: "", // Placeholder for email - will need to be populated from actual data
    phone: "", // Placeholder for phone - will need to be populated from actual data
    notes: "Notas sobre o cliente e detalhes específicos do casamento.",
    downPayment,
    eventCategory,
    eventLocation: eventCategory === "Casamento" ? "São Paulo, SP" : "",
    preWeddingDate: eventCategory === "Casamento" ? randomDate(new Date(), nextYear) : null,
    contractLink: "", // Placeholder for contract link
    preWeddingScheduled: eventCategory === "Casamento" ? Math.random() > 0.5 : false,
    preWeddingCompleted: eventCategory === "Casamento" ? Math.random() > 0.6 : false,
    preWeddingDelivered: eventCategory === "Casamento" ? Math.random() > 0.7 : false,
    weddingPhotographed: eventCategory === "Casamento" ? Math.random() > 0.6 : false,
    inEditing: eventCategory === "Casamento" ? Math.random() > 0.7 : false,
    linkSent: eventCategory === "Casamento" ? Math.random() > 0.8 : false,
    boxDelivered: eventCategory === "Casamento" ? Math.random() > 0.9 : false,
    albumDesigned: eventCategory === "Casamento" ? Math.random() > 0.9 : false,
    albumApprovedDelivered: eventCategory === "Casamento" ? Math.random() > 0.9 : false,
    payments,
    createdAt: randomDate(new Date(now.getFullYear(), now.getMonth() - 3, 1), now),
    updatedAt: randomDate(new Date(now.getFullYear(), now.getMonth() - 1, 1), now),
  };
};

export const clients: Client[] = []; // Empty array to store clients from your actual database or imported data

// Now, clients can be populated using actual data or integrated with your existing system.
