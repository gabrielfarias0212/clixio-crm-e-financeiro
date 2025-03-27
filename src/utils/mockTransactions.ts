
import { Transaction } from "./types";
import { clients } from "./mockData";
import { v4 as uuidv4 } from 'uuid';

// Generate some sample transactions based on existing client payments
export const transactions: Transaction[] = [];

// Add existing client payments as transactions
clients.forEach(client => {
  client.payments.forEach(payment => {
    transactions.push({
      id: uuidv4(),
      amount: payment.amount,
      date: payment.date,
      type: "entrada",
      category: "pagamento de cliente",
      description: `Pagamento de ${client.name}`,
      clientId: client.id,
      paymentId: payment.id,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000))
    });
  });
});

// Add some sample expenses
const expenseCategories: TransactionCategory[] = [
  "despesa operacional",
  "material",
  "serviço terceirizado",
  "imposto",
  "outras despesas"
];

const expenseDescriptions = [
  "Aluguel de estúdio",
  "Equipamento de iluminação",
  "Papel fotográfico",
  "Serviço de edição",
  "Gasolina",
  "Manutenção de equipamento",
  "Impostos mensais",
  "Materiais de escritório"
];

// Generate 15 random expenses
for (let i = 0; i < 15; i++) {
  const randomCategory = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
  const randomDescription = expenseDescriptions[Math.floor(Math.random() * expenseDescriptions.length)];
  
  transactions.push({
    id: uuidv4(),
    amount: Math.floor(Math.random() * 2000) + 100,
    date: new Date(Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000)),
    type: "saída",
    category: randomCategory,
    description: randomDescription,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000))
  });
}

// Sort transactions by date (newest first)
transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
