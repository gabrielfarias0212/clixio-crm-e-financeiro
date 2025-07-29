
import { useEffect, useState } from "react";
import { useTransactions } from "@/contexts/TransactionsContext";

export default function CashFlow() {
  const { transactions, refreshTransactions } = useTransactions();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    document.title = "Financeiro | Wedding CRM";
    refreshTransactions();
  }, [refreshTransactions]);

  const totalEntries = transactions.reduce((sum, transaction) => {
    return transaction.type === 'entrada' ? sum + transaction.amount : sum;
  }, 0);

  const totalExpenses = transactions.reduce((sum, transaction) => {
    return transaction.type === 'saída' ? sum + transaction.amount : sum;
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
      <h1 className="text-2xl font-bold">Fluxo de Caixa</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800">Entradas</h3>
          <p className="text-2xl font-bold text-green-600">
            {totalEntries.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800">Saídas</h3>
          <p className="text-2xl font-bold text-red-600">
            {totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        
        <div className={`${balance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} border rounded-lg p-6`}>
          <h3 className={`text-lg font-semibold ${balance >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
            Saldo
          </h3>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Transações</h2>
          
          {filteredTransactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhuma transação encontrada</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Data</th>
                    <th className="text-left p-2">Descrição</th>
                    <th className="text-left p-2">Categoria</th>
                    <th className="text-left p-2">Tipo</th>
                    <th className="text-right p-2">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-2">{transaction.description}</td>
                      <td className="p-2">{transaction.category}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          transaction.type === 'entrada' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type === 'entrada' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td className={`p-2 text-right font-semibold ${
                        transaction.type === 'entrada' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'saída' ? '-' : ''}
                        {transaction.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
