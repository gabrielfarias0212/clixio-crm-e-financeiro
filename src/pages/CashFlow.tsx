import { CashFlowSummary } from "@/components/cashflow/CashFlowSummary";
import { CashFlowTable } from "@/components/cashflow/CashFlowTable";
import { CashFlowChart } from "@/components/cashflow/CashFlowChart";
import { AddTransaction } from "@/components/cashflow/AddTransaction";
import { useEffect, useState } from "react";
import { useTransactions } from "@/contexts/TransactionsContext";

export default function CashFlow() {
  const { transactions, fetchTransactions } = useTransactions();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    document.title = "Financeiro | Wedding CRM";
    fetchTransactions();
  }, [fetchTransactions]);

  const totalEntries = transactions.reduce((sum, transaction) => {
    return transaction.type === 'entry' ? sum + transaction.value : sum;
  }, 0);

  const totalExpenses = transactions.reduce((sum, transaction) => {
    return transaction.type === 'expense' ? sum + transaction.value : sum;
  }, 0);

  const balance = totalEntries - totalExpenses;

  const filteredTransactions = selectedDate
    ? transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return (
        transactionDate.getFullYear() === selectedDate.getFullYear() &&
        transactionDate.getMonth() === selectedDate.getMonth() &&
        transactionDate.getDate() === selectedDate.getDate()
      );
    })
    : transactions;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <CashFlowSummary totalEntries={totalEntries} totalExpenses={totalExpenses} balance={balance} />
      <AddTransaction />
      <CashFlowChart transactions={transactions} />
      <CashFlowTable transactions={filteredTransactions} setSelectedDate={setSelectedDate} />
    </div>
  );
}
