
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
  const isContractPaid = remainingBalance <= 0;
  
  return (
    <>
      <style>
        {`
          @media print {
            /* Reset everything for print */
            *, *::before, *::after {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            
            /* Hide everything except the receipt */
            body * {
              visibility: hidden;
            }
            
            /* Show only the receipt content */
            .receipt-content, .receipt-content * {
              visibility: visible !important;
            }
            
            /* Position the receipt to fill the page */
            .receipt-content {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              height: 100vh !important;
              background: white !important;
              padding: 2cm !important;
              font-family: Arial, sans-serif !important;
              font-size: 14px !important;
              line-height: 1.4 !important;
              color: #000 !important;
            }
            
            /* Hide non-print elements */
            .no-print {
              display: none !important;
              visibility: hidden !important;
            }
            
            /* Styling for print */
            .receipt-header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
            }
            
            .receipt-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            
            .receipt-subtitle {
              font-size: 16px;
              color: #666;
              margin-bottom: 5px;
            }
            
            .receipt-number {
              font-size: 12px;
              color: #888;
              margin-top: 10px;
            }
            
            .receipt-section {
              margin-bottom: 25px;
            }
            
            .receipt-section-title {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 10px;
              border-bottom: 1px solid #ccc;
              padding-bottom: 5px;
            }
            
            .receipt-row {
              margin-bottom: 8px;
              display: flex;
              justify-content: space-between;
            }
            
            .receipt-label {
              font-weight: bold;
              width: 40%;
            }
            
            .receipt-value {
              width: 60%;
            }
            
            .receipt-status {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
            }
            
            .receipt-status.paid {
              background-color: #d4edda;
              color: #155724;
              border: 1px solid #c3e6cb;
            }
            
            .receipt-status.pending {
              background-color: #fff3cd;
              color: #856404;
              border: 1px solid #ffeaa7;
            }
            
            .receipt-financial-summary {
              background-color: #f8f9fa;
              padding: 20px;
              border: 1px solid #dee2e6;
              margin-bottom: 25px;
            }
            
            .receipt-financial-grid {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 20px;
              margin-top: 15px;
            }
            
            .receipt-financial-item {
              text-align: center;
              padding: 15px;
              background-color: white;
              border: 1px solid #dee2e6;
            }
            
            .receipt-financial-label {
              font-size: 12px;
              color: #666;
              margin-bottom: 5px;
              font-weight: bold;
            }
            
            .receipt-financial-value {
              font-size: 16px;
              font-weight: bold;
            }
            
            .receipt-financial-value.contract {
              color: #007bff;
            }
            
            .receipt-financial-value.paid {
              color: #28a745;
            }
            
            .receipt-financial-value.remaining {
              color: #dc3545;
            }
            
            .receipt-financial-value.zero {
              color: #28a745;
            }
            
            .receipt-footer {
              border-top: 2px solid #000;
              padding-top: 20px;
              text-align: center;
              margin-top: 30px;
            }
            
            .receipt-footer-date {
              font-weight: bold;
              margin-bottom: 10px;
            }
            
            .receipt-footer-note {
              font-size: 12px;
              color: #666;
              margin-bottom: 15px;
            }
            
            .receipt-footer-alert {
              margin-top: 15px;
              padding: 10px;
              border-radius: 4px;
              font-weight: bold;
            }
            
            .receipt-footer-alert.warning {
              background-color: #fff3cd;
              color: #856404;
              border: 1px solid #ffeaa7;
            }
            
            .receipt-footer-alert.success {
              background-color: #d4edda;
              color: #155724;
              border: 1px solid #c3e6cb;
            }
            
            @page {
              margin: 0;
              size: A4;
            }
          }
        `}
      </style>
      
      <div className="receipt-content">
        {/* Cabeçalho */}
        <div className="receipt-header">
          <div className="receipt-title">
            COMPROVANTE DE PAGAMENTO
          </div>
          <div className="receipt-subtitle">Fotografia Profissional</div>
          <div className="receipt-number">
            Comprovante Nº: {receiptNumber}
          </div>
        </div>

        {/* Informações do Cliente */}
        <div className="receipt-section">
          <div className="receipt-section-title">Dados do Cliente</div>
          <div className="receipt-row">
            <span className="receipt-label">Nome:</span>
            <span className="receipt-value">{client.name}</span>
          </div>
          {client.email && (
            <div className="receipt-row">
              <span className="receipt-label">Email:</span>
              <span className="receipt-value">{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="receipt-row">
              <span className="receipt-label">Telefone:</span>
              <span className="receipt-value">{client.phone}</span>
            </div>
          )}
          {client.eventCategory && (
            <div className="receipt-row">
              <span className="receipt-label">Evento:</span>
              <span className="receipt-value">{client.eventCategory}</span>
            </div>
          )}
          {client.weddingDate && (
            <div className="receipt-row">
              <span className="receipt-label">Data do Evento:</span>
              <span className="receipt-value">{new Date(client.weddingDate).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
          {client.eventLocation && (
            <div className="receipt-row">
              <span className="receipt-label">Local:</span>
              <span className="receipt-value">{client.eventLocation}</span>
            </div>
          )}
        </div>

        {/* Detalhes do Pagamento */}
        <div className="receipt-section">
          <div className="receipt-section-title">Detalhes do Pagamento</div>
          <div className="receipt-row">
            <span className="receipt-label">Data do Pagamento:</span>
            <span className="receipt-value">{payment.date}</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">Valor Pago:</span>
            <span className="receipt-value" style={{ fontWeight: 'bold', color: '#28a745' }}>
              {formatCurrency(payment.amount)}
            </span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">Status:</span>
            <span className="receipt-value">
              <span className={`receipt-status ${payment.payment_status === 'pago' ? 'paid' : 'pending'}`}>
                {payment.payment_status === 'pago' ? 'Pago' : 'Pendente'}
              </span>
            </span>
          </div>
          {payment.due_date && (
            <div className="receipt-row">
              <span className="receipt-label">Data de Vencimento:</span>
              <span className="receipt-value">{payment.due_date}</span>
            </div>
          )}
          {payment.notes && (
            <div className="receipt-row">
              <span className="receipt-label">Observações:</span>
              <span className="receipt-value">{payment.notes}</span>
            </div>
          )}
        </div>

        {/* Resumo Financeiro */}
        <div className="receipt-financial-summary">
          <div className="receipt-section-title">Resumo Financeiro do Contrato</div>
          <div className="receipt-financial-grid">
            <div className="receipt-financial-item">
              <div className="receipt-financial-label">Valor Total do Contrato</div>
              <div className="receipt-financial-value contract">{formatCurrency(contractValue)}</div>
            </div>
            <div className="receipt-financial-item">
              <div className="receipt-financial-label">Total Pago</div>
              <div className="receipt-financial-value paid">{formatCurrency(totalPaid)}</div>
            </div>
            <div className="receipt-financial-item">
              <div className="receipt-financial-label">Saldo Devedor</div>
              <div className={`receipt-financial-value ${remainingBalance <= 0 ? 'zero' : 'remaining'}`}>
                {formatCurrency(remainingBalance)}
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="receipt-footer">
          <div className="receipt-footer-date">Comprovante emitido em: {currentDate}</div>
          <div className="receipt-footer-note">
            Este comprovante é válido como prova de pagamento. 
            Guarde-o para seus registros financeiros.
          </div>
          
          {isContractPaid ? (
            <div className="receipt-footer-alert success">
              ✅ Parabéns! Contrato totalmente quitado.
            </div>
          ) : (
            <div className="receipt-footer-alert warning">
              ⚠️ Atenção: Ainda há saldo devedor de {formatCurrency(remainingBalance)} para quitação completa do contrato.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
