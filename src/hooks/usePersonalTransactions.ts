
import { useState, useEffect } from "react";
import { toast } from "sonner";

export interface PersonalTransaction {
  id: string;
  type: 'entrada' | 'saida';
  amount: number;
  description: string;
  date: string;
}

export function usePersonalTransactions() {
  const [transactions, setTransactions] = useState<PersonalTransaction[]>([]);

  // Load transactions from localStorage on hook initialization
  useEffect(() => {
    const savedTransactions = localStorage.getItem('personalTransactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  // Save transactions to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem('personalTransactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (type: 'entrada' | 'saida', amount: string, description: string) => {
    if (!amount || !description) {
      toast.error('Preencha todos os campos');
      return false;
    }

    const newTransaction: PersonalTransaction = {
      id: Date.now().toString(),
      type,
      amount: parseFloat(amount),
      description,
      date: new Date().toLocaleDateString('pt-BR')
    };

    setTransactions(prev => [newTransaction, ...prev]);
    
    const successMessage = type === 'entrada' ? 'Entrada registrada com sucesso!' : 'Saída registrada com sucesso!';
    toast.success(successMessage);
    
    return true;
  };

  const getTotals = () => {
    const totalEntries = transactions
      .filter(t => t.type === 'entrada')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'saida')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalEntries - totalExpenses;

    return { totalEntries, totalExpenses, balance };
  };

  return {
    transactions,
    addTransaction,
    getTotals
  };
}
