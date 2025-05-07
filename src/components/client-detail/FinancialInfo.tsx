
import { Client } from "@/utils/types";

interface FinancialInfoProps {
  client: Client;
}

export function FinancialInfo({ client }: FinancialInfoProps) {
  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  const totalPayments = client.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const remainingValue = client.contractValue - totalPayments;

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
            {formatCurrency(totalPayments)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">Valor Restante:</span>
          <span className={`font-medium ${remainingValue > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(remainingValue)}
          </span>
        </div>
      </div>
    </div>
  );
}
