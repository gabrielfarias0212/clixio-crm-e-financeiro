
import React from 'react';
import { Payment, Client } from "@/utils/types";
import { formatCurrency } from "@/utils/currency";

interface PaymentReceiptTemplateProps {
  payment: Payment;
  client: Client;
  receiptNumber: string;
  contractValue: number;
  totalPaid: number;
  remainingBalance: number;
}

export function PaymentReceiptTemplate({
  payment,
  client,
  receiptNumber,
  contractValue,
  totalPaid,
  remainingBalance
}: PaymentReceiptTemplateProps) {
  const currentDate = new Date().toLocaleDateString('pt-BR');
  
  return (
    <div className="bg-white p-8 print:p-6 print:shadow-none">
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>
      
      <div className="print-area">
        {/* Cabeçalho */}
        <div className="text-center mb-8 border-b-2 border-gray-200 pb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            COMPROVANTE DE PAGAMENTO
          </h1>
          <p className="text-gray-600">Fotografia Profissional</p>
          <p className="text-sm text-gray-500 mt-2">
            Comprovante Nº: {receiptNumber}
          </p>
        </div>

        {/* Informações do Cliente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Dados do Cliente
            </h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Nome:</span> {client.name}</p>
              {client.email && (
                <p><span className="font-medium">Email:</span> {client.email}</p>
              )}
              {client.phone && (
                <p><span className="font-medium">Telefone:</span> {client.phone}</p>
              )}
              {client.eventCategory && (
                <p><span className="font-medium">Evento:</span> {client.eventCategory}</p>
              )}
              {client.weddingDate && (
                <p><span className="font-medium">Data do Evento:</span> {new Date(client.weddingDate).toLocaleDateString('pt-BR')}</p>
              )}
              {client.eventLocation && (
                <p><span className="font-medium">Local:</span> {client.eventLocation}</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Detalhes do Pagamento
            </h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Data do Pagamento:</span> {payment.date}</p>
              <p><span className="font-medium">Valor Pago:</span> <span className="text-green-600 font-bold">{formatCurrency(payment.amount)}</span></p>
              <p><span className="font-medium">Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  payment.payment_status === 'pago' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {payment.payment_status === 'pago' ? 'Pago' : 'Pendente'}
                </span>
              </p>
              {payment.due_date && (
                <p><span className="font-medium">Data de Vencimento:</span> {payment.due_date}</p>
              )}
              {payment.notes && (
                <p><span className="font-medium">Observações:</span> {payment.notes}</p>
              )}
            </div>
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Resumo Financeiro do Contrato
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-4 bg-white rounded border">
              <p className="text-gray-600 mb-1">Valor Total do Contrato</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(contractValue)}</p>
            </div>
            <div className="text-center p-4 bg-white rounded border">
              <p className="text-gray-600 mb-1">Total Pago</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="text-center p-4 bg-white rounded border">
              <p className="text-gray-600 mb-1">Saldo Devedor</p>
              <p className={`text-xl font-bold ${remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(remainingBalance)}
              </p>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="border-t-2 border-gray-200 pt-6 text-center text-sm text-gray-600">
          <p className="mb-2">Comprovante emitido em: {currentDate}</p>
          <p className="text-xs">
            Este comprovante é válido como prova de pagamento. 
            Guarde-o para seus registros financeiros.
          </p>
          {remainingBalance > 0 && (
            <p className="mt-3 text-orange-600 font-medium">
              ⚠️ Atenção: Ainda há saldo devedor de {formatCurrency(remainingBalance)} para quitação completa do contrato.
            </p>
          )}
          {remainingBalance <= 0 && (
            <p className="mt-3 text-green-600 font-medium">
              ✅ Parabéns! Contrato totalmente quitado.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
