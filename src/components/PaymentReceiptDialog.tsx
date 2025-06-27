
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, X } from "lucide-react";
import { Payment, Client } from "@/utils/types";
import { PaymentReceiptTemplate } from "./PaymentReceiptTemplate";

interface PaymentReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment;
  client: Client;
}

export function PaymentReceiptDialog({ 
  open, 
  onOpenChange, 
  payment, 
  client 
}: PaymentReceiptDialogProps) {
  
  const handlePrint = () => {
    // Create the receipt content
    const receiptContent = generateReceiptHTML();
    
    // Open new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    }
  };

  const handleDownload = () => {
    // Same as print - modern browsers allow saving as PDF from print dialog
    handlePrint();
  };

  const generateReceiptHTML = () => {
    // Calculate financial summary
    const contractValue = Number(client.contractValue) || 0;
    const totalPaid = client.payments
      .filter(p => p.payment_status === 'pago')
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const remainingBalance = contractValue - totalPaid;
    const receiptNumber = `${client.id.slice(0, 8).toUpperCase()}-${payment.id.slice(0, 4).toUpperCase()}`;
    const currentDate = new Date().toLocaleDateString('pt-BR');
    const isContractPaid = remainingBalance <= 0;

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    };

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Comprovante de Pagamento</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            font-size: 14px;
            line-height: 1.5;
            color: #000;
            background: white;
            padding: 40px;
        }
        
        .receipt-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
        }
        
        .receipt-header {
            position: relative;
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #000;
        }
        
        .receipt-number {
            position: absolute;
            top: 0;
            right: 0;
            font-size: 12px;
            color: #666;
            background: #f5f5f5;
            padding: 8px 12px;
            border-radius: 4px;
        }
        
        .camera-icon {
            font-size: 24px;
            margin-bottom: 10px;
        }
        
        .receipt-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #000;
        }
        
        .receipt-subtitle {
            font-size: 16px;
            color: #666;
            margin-bottom: 15px;
        }
        
        .receipt-section {
            margin-bottom: 30px;
        }
        
        .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 1px solid #ddd;
            color: #333;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
        }
        
        .info-label {
            font-weight: bold;
            color: #555;
            margin-right: 10px;
        }
        
        .info-value {
            color: #000;
        }
        
        .payment-amount {
            font-size: 18px;
            font-weight: bold;
            color: #28a745;
        }
        
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
        }
        
        .status-paid {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .status-pending {
            background-color: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
        }
        
        .financial-summary {
            background-color: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            border: 1px solid #dee2e6;
            margin: 30px 0;
        }
        
        .financial-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-top: 15px;
        }
        
        .financial-item {
            text-align: center;
            padding: 20px;
            background: white;
            border-radius: 6px;
            border: 1px solid #dee2e6;
        }
        
        .financial-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 8px;
            text-transform: uppercase;
            font-weight: bold;
        }
        
        .financial-value {
            font-size: 18px;
            font-weight: bold;
        }
        
        .value-contract { color: #007bff; }
        .value-paid { color: #28a745; }
        .value-remaining { color: #dc3545; }
        .value-zero { color: #28a745; }
        
        .receipt-footer {
            border-top: 2px solid #000;
            padding-top: 25px;
            text-align: center;
            margin-top: 40px;
        }
        
        .footer-date {
            font-weight: bold;
            margin-bottom: 15px;
            font-size: 14px;
        }
        
        .footer-note {
            font-size: 12px;
            color: #666;
            margin-bottom: 20px;
            line-height: 1.4;
        }
        
        .footer-alert {
            margin-top: 20px;
            padding: 15px;
            border-radius: 6px;
            font-weight: bold;
        }
        
        .alert-success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .alert-warning {
            background-color: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
        }
        
        @media print {
            body { padding: 20px; }
            .receipt-container { max-width: none; }
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="receipt-header">
            <div class="receipt-number">
                Comprovante Nº: ${receiptNumber}
            </div>
            
            <div class="camera-icon">📷</div>
            <div class="receipt-title">COMPROVANTE DE PAGAMENTO</div>
            <div class="receipt-subtitle">Fotografia Profissional</div>
        </div>

        <div class="receipt-section">
            <div class="section-title">Dados do Cliente</div>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Nome:</span>
                    <span class="info-value">${client.name}</span>
                </div>
                ${client.email ? `
                <div class="info-item">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${client.email}</span>
                </div>
                ` : ''}
                ${client.phone ? `
                <div class="info-item">
                    <span class="info-label">Telefone:</span>
                    <span class="info-value">${client.phone}</span>
                </div>
                ` : ''}
                ${client.eventCategory ? `
                <div class="info-item">
                    <span class="info-label">Evento:</span>
                    <span class="info-value">${client.eventCategory}</span>
                </div>
                ` : ''}
                ${client.weddingDate ? `
                <div class="info-item">
                    <span class="info-label">Data do Evento:</span>
                    <span class="info-value">${new Date(client.weddingDate).toLocaleDateString('pt-BR')}</span>
                </div>
                ` : ''}
                ${client.eventLocation ? `
                <div class="info-item">
                    <span class="info-label">Local:</span>
                    <span class="info-value">${client.eventLocation}</span>
                </div>
                ` : ''}
            </div>
        </div>

        <div class="receipt-section">
            <div class="section-title">Detalhes do Pagamento</div>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Data do Pagamento:</span>
                    <span class="info-value">${payment.date}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Valor Pago:</span>
                    <span class="info-value payment-amount">${formatCurrency(payment.amount)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Status:</span>
                    <span class="info-value">
                        <span class="status-badge ${payment.payment_status === 'pago' ? 'status-paid' : 'status-pending'}">
                            ${payment.payment_status === 'pago' ? 'Pago' : 'Pendente'}
                        </span>
                    </span>
                </div>
                ${payment.due_date ? `
                <div class="info-item">
                    <span class="info-label">Vencimento:</span>
                    <span class="info-value">${payment.due_date}</span>
                </div>
                ` : ''}
            </div>
            ${payment.notes ? `
            <div class="info-item">
                <span class="info-label">Observações:</span>
                <span class="info-value">${payment.notes}</span>
            </div>
            ` : ''}
        </div>

        <div class="financial-summary">
            <div class="section-title">Resumo Financeiro do Contrato</div>
            <div class="financial-grid">
                <div class="financial-item">
                    <div class="financial-label">Valor Total do Contrato</div>
                    <div class="financial-value value-contract">${formatCurrency(contractValue)}</div>
                </div>
                <div class="financial-item">
                    <div class="financial-label">Total Pago</div>
                    <div class="financial-value value-paid">${formatCurrency(totalPaid)}</div>
                </div>
                <div class="financial-item">
                    <div class="financial-label">Saldo Devedor</div>
                    <div class="financial-value ${remainingBalance <= 0 ? 'value-zero' : 'value-remaining'}">
                        ${formatCurrency(remainingBalance)}
                    </div>
                </div>
            </div>
        </div>

        <div class="receipt-footer">
            <div class="footer-date">Comprovante emitido em: ${currentDate}</div>
            <div class="footer-note">
                Este comprovante é válido como prova de pagamento.<br>
                Guarde-o para seus registros financeiros.
            </div>
            
            ${isContractPaid ? `
            <div class="footer-alert alert-success">
                ✅ Parabéns! Contrato totalmente quitado.
            </div>
            ` : `
            <div class="footer-alert alert-warning">
                ⚠️ Atenção: Ainda há saldo devedor de ${formatCurrency(remainingBalance)} para quitação completa do contrato.
            </div>
            `}
        </div>
    </div>
</body>
</html>`;
  };

  // Calculate financial summary for preview
  const contractValue = Number(client.contractValue) || 0;
  const totalPaid = client.payments
    .filter(p => p.payment_status === 'pago')
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const remainingBalance = contractValue - totalPaid;
  const receiptNumber = `${client.id.slice(0, 8).toUpperCase()}-${payment.id.slice(0, 4).toUpperCase()}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Comprovante de Pagamento</DialogTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <PaymentReceiptTemplate
          payment={payment}
          client={client}
          receiptNumber={receiptNumber}
          contractValue={contractValue}
          totalPaid={totalPaid}
          remainingBalance={remainingBalance}
        />
      </DialogContent>
    </Dialog>
  );
}
