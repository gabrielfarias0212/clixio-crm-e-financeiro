
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
    <>
      <style>
        {`
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              box-sizing: border-box;
            }
            
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              height: 100% !important;
              font-family: system-ui, -apple-system, sans-serif !important;
              background: white !important;
              visibility: visible !important;
            }
            
            body * {
              visibility: hidden !important;
            }
            
            .print-area, .print-area * {
              visibility: visible !important;
            }
            
            .print-area {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              height: auto !important;
              margin: 0 !important;
              padding: 20px !important;
              background: white !important;
              box-shadow: none !important;
              border: none !important;
              transform: none !important;
              overflow: visible !important;
            }
            
            .print-hidden {
              display: none !important;
              visibility: hidden !important;
            }
            
            /* Reset all styling to ensure clean print */
            .text-center { text-align: center !important; }
            .text-left { text-align: left !important; }
            .font-bold { font-weight: bold !important; }
            .text-2xl { font-size: 1.5rem !important; line-height: 2rem !important; }
            .text-lg { font-size: 1.125rem !important; line-height: 1.75rem !important; }
            .text-sm { font-size: 0.875rem !important; line-height: 1.25rem !important; }
            .text-xs { font-size: 0.75rem !important; line-height: 1rem !important; }
            .mb-2 { margin-bottom: 0.5rem !important; }
            .mb-4 { margin-bottom: 1rem !important; }
            .mb-6 { margin-bottom: 1.5rem !important; }
            .mb-8 { margin-bottom: 2rem !important; }
            .mt-2 { margin-top: 0.5rem !important; }
            .mt-3 { margin-top: 0.75rem !important; }
            .pb-2 { padding-bottom: 0.5rem !important; }
            .pb-6 { padding-bottom: 1.5rem !important; }
            .pt-6 { padding-top: 1.5rem !important; }
            .p-4 { padding: 1rem !important; }
            .p-6 { padding: 1.5rem !important; }
            .p-8 { padding: 2rem !important; }
            .px-2 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
            .py-1 { padding-top: 0.25rem !important; padding-bottom: 0.25rem !important; }
            .rounded { border-radius: 0.25rem !important; }
            .border { border: 1px solid #d1d5db !important; }
            .border-b { border-bottom: 1px solid #d1d5db !important; }
            .border-b-2 { border-bottom: 2px solid #d1d5db !important; }
            .border-t-2 { border-top: 2px solid #d1d5db !important; }
            .space-y-2 > * + * { margin-top: 0.5rem !important; }
            .space-y-3 > * + * { margin-top: 0.75rem !important; }
            .grid { display: grid !important; }
            .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
            .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
            .gap-4 { gap: 1rem !important; }
            .gap-6 { gap: 1.5rem !important; }
            .bg-gray-50 { background-color: #f9fafb !important; }
            .bg-white { background-color: #ffffff !important; }
            .bg-green-100 { background-color: #dcfce7 !important; }
            .bg-yellow-100 { background-color: #fef3c7 !important; }
            .text-gray-800 { color: #1f2937 !important; }
            .text-gray-600 { color: #4b5563 !important; }
            .text-gray-500 { color: #6b7280 !important; }
            .text-blue-600 { color: #2563eb !important; }
            .text-green-600 { color: #16a34a !important; }
            .text-green-800 { color: #166534 !important; }
            .text-yellow-800 { color: #92400e !important; }
            .text-red-600 { color: #dc2626 !important; }
            .text-orange-600 { color: #ea580c !important; }
            
            @page {
              margin: 1cm !important;
              size: A4 !important;
            }
          }
        `}
      </style>
      
      <div className="bg-white p-8 print-area">
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
        <div className="grid grid-cols-1 gap-6 mb-8">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">
                Dados do Cliente
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-bold">Nome:</span> {client.name}</p>
                {client.email && (
                  <p><span className="font-bold">Email:</span> {client.email}</p>
                )}
                {client.phone && (
                  <p><span className="font-bold">Telefone:</span> {client.phone}</p>
                )}
                {client.eventCategory && (
                  <p><span className="font-bold">Evento:</span> {client.eventCategory}</p>
                )}
                {client.weddingDate && (
                  <p><span className="font-bold">Data do Evento:</span> {new Date(client.weddingDate).toLocaleDateString('pt-BR')}</p>
                )}
                {client.eventLocation && (
                  <p><span className="font-bold">Local:</span> {client.eventLocation}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">
                Detalhes do Pagamento
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-bold">Data do Pagamento:</span> {payment.date}</p>
                <p><span className="font-bold">Valor Pago:</span> <span className="text-green-600 font-bold">{formatCurrency(payment.amount)}</span></p>
                <p><span className="font-bold">Status:</span> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    payment.payment_status === 'pago' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {payment.payment_status === 'pago' ? 'Pago' : 'Pendente'}
                  </span>
                </p>
                {payment.due_date && (
                  <p><span className="font-bold">Data de Vencimento:</span> {payment.due_date}</p>
                )}
                {payment.notes && (
                  <p><span className="font-bold">Observações:</span> {payment.notes}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="bg-gray-50 p-6 rounded mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Resumo Financeiro do Contrato
          </h3>
          <div className="grid grid-cols-1 gap-4 text-sm">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded border">
                <p className="text-gray-600 mb-1 font-bold">Valor Total do Contrato</p>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(contractValue)}</p>
              </div>
              <div className="text-center p-4 bg-white rounded border">
                <p className="text-gray-600 mb-1 font-bold">Total Pago</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(totalPaid)}</p>
              </div>
              <div className="text-center p-4 bg-white rounded border">
                <p className="text-gray-600 mb-1 font-bold">Saldo Devedor</p>
                <p className={`text-lg font-bold ${remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(remainingBalance)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="border-t-2 border-gray-200 pt-6 text-center text-sm text-gray-600">
          <p className="mb-2 font-bold">Comprovante emitido em: {currentDate}</p>
          <p className="text-xs">
            Este comprovante é válido como prova de pagamento. 
            Guarde-o para seus registros financeiros.
          </p>
          {remainingBalance > 0 && (
            <p className="mt-3 text-orange-600 font-bold">
              ⚠️ Atenção: Ainda há saldo devedor de {formatCurrency(remainingBalance)} para quitação completa do contrato.
            </p>
          )}
          {remainingBalance <= 0 && (
            <p className="mt-3 text-green-600 font-bold">
              ✅ Parabéns! Contrato totalmente quitado.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
