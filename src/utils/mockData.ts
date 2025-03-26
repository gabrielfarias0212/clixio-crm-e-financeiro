
import { Client, ClientStatus, NextAction } from "./types";

// Function to generate a random date within a range
const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
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
  "nenhuma"
];

// Generate a list of 15 sample clients
export const clients: Client[] = Array.from({ length: 15 }, (_, i) => {
  // Determine status randomly but with a distribution
  const statusIndex = Math.floor(Math.random() * statusOptions.length);
  const status = statusOptions[statusIndex];
  
  // Set next action based on status (more realistic)
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
  
  // Generate a random wedding date, with some nulls for prospects
  const weddingDate = status === "orçamento enviado" && Math.random() > 0.7 
    ? null 
    : randomDate(nextYear, inTwoYears);
  
  // Contract value varies by status
  let contractValue = 0;
  if (status === "orçamento enviado" || status === "follow-up") {
    // Potential value
    contractValue = Math.floor(Math.random() * 4000) + 2000;
  } else {
    // Closed value
    contractValue = Math.floor(Math.random() * 8000) + 3000;
  }
  
  // Create a client with the generated data
  return {
    id: `client-${i + 1}`,
    name: [
      "Ana e Carlos Silva",
      "Mariana e João Pereira", 
      "Juliana e Ricardo Costa",
      "Daniela e Gabriel Santos",
      "Patricia e Bruno Oliveira",
      "Camila e André Ferreira",
      "Fernanda e Lucas Martins",
      "Beatriz e Rafael Almeida",
      "Aline e Thiago Rodrigues",
      "Bruna e Gustavo Lima",
      "Renata e Felipe Sousa",
      "Amanda e Daniel Carvalho",
      "Isabela e Matheus Gomes",
      "Natália e Eduardo Dias",
      "Carolina e Leonardo Barbosa"
    ][i],
    weddingDate,
    contractValue,
    status,
    nextAction,
    email: `client${i + 1}@example.com`,
    phone: `(11) 9${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}`,
    notes: "Notas sobre o cliente e detalhes específicos do casamento.",
    createdAt: randomDate(new Date(now.getFullYear(), now.getMonth() - 3, 1), now),
    updatedAt: randomDate(new Date(now.getFullYear(), now.getMonth() - 1, 1), now),
  };
});
