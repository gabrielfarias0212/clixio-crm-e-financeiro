
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BudgetReceiptTemplate } from './BudgetReceiptTemplate';
import { BudgetWithItems } from '@/types/budget';
import { PhotographerProfile } from '@/hooks/usePhotographerProfile';
import { Download, Printer } from 'lucide-react';

interface BudgetReceiptDialogProps {
  budget: BudgetWithItems;
  photographerProfile?: PhotographerProfile | null;
  children: React.ReactNode;
}

export function BudgetReceiptDialog({
  budget,
  photographerProfile,
  children
}: BudgetReceiptDialogProps) {
  const handlePrintBudget = () => {
    const budgetHTML = createBudgetHTML(budget, photographerProfile);
    
    // Create a new window and write the content
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(budgetHTML);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
    }
  };

  const createBudgetHTML = (budget: BudgetWithItems, photographerProfile?: PhotographerProfile | null) => {
    const createdDate = new Date(budget.created_at).toLocaleDateString('pt-BR');
    const validityDate = new Date(budget.created_at);
    validityDate.setDate(validityDate.getDate() + budget.validity_days);
    const validityFormatted = validityDate.toLocaleDateString('pt-BR');

    const statusLabels: Record<string, string> = {
      draft: 'Rascunho',
      sent: 'Enviado',
      approved: 'Aprovado',
      rejected: 'Rejeitado',
    };

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    };

    // Generate company header HTML
    const generateCompanyHeader = () => {
      if (!photographerProfile) {
        return `
          <div class="camera-icon">📷</div>
          <h1 class="text-3xl font-bold mb-3 text-gray-800">ORÇAMENTO</h1>
          <p class="text-xl text-gray-600">Fotografia Profissional</p>
        `;
      }

      let headerHTML = '';
      
      // Logo or camera icon
      if (photographerProfile.logo_url) {
        headerHTML += `<img src="${photographerProfile.logo_url}" alt="Logo" style="height: 4rem; width: auto; margin-bottom: 0.75rem;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />`;
        headerHTML += `<div class="camera-icon" style="display: none; font-size: 2.5rem; margin-bottom: 0.75rem;">📷</div>`;
      } else {
        headerHTML += `<div class="camera-icon" style="font-size: 2.5rem; margin-bottom: 0.75rem;">📷</div>`;
      }

      headerHTML += `<h1 style="font-size: 1.875rem; font-weight: 700; margin-bottom: 0.75rem; color: #1f2937;">ORÇAMENTO</h1>`;

      // Company name
      if (photographerProfile.company_name) {
        headerHTML += `<p style="font-size: 1.25rem; color: #4b5563; font-weight: 500; margin-bottom: 0.5rem;">${photographerProfile.company_name}</p>`;
      }

      // Brand name (if different from company name)
      if (photographerProfile.brand_name && photographerProfile.brand_name !== photographerProfile.company_name) {
        headerHTML += `<p style="font-size: 1.125rem; color: #6b7280; margin-bottom: 0.5rem;">${photographerProfile.brand_name}</p>`;
      }

      // If no company or brand name, show default
      if (!photographerProfile.company_name && !photographerProfile.brand_name) {
        headerHTML += `<p style="font-size: 1.25rem; color: #4b5563;">Fotografia Profissional</p>`;
      }

      // Contact info
      const contactInfo = [];
      if (photographerProfile.whatsapp) contactInfo.push(`📞 ${photographerProfile.whatsapp}`);
      if (photographerProfile.email) contactInfo.push(`✉️ ${photographerProfile.email}`);
      if (photographerProfile.website) contactInfo.push(`🌐 ${photographerProfile.website}`);

      if (contactInfo.length > 0) {
        headerHTML += `<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem; margin-top: 1rem; font-size: 0.875rem; color: #4b5563;">${contactInfo.map(info => `<span>${info}</span>`).join('')}</div>`;
      }

      return headerHTML;
    };

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Orçamento - ${budget.budget_title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 14px;
            line-height: 1.5;
            color: #000;
            background: white;
            padding: 2rem;
        }
        
        .budget-container {
            max-width: 56rem;
            margin: 0 auto;
            background: white;
            padding: 2rem;
        }
        
        .budget-header {
            position: relative;
            text-align: center;
            margin-bottom: 2.5rem;
            padding-bottom: 1.5rem;
            border-bottom: 2px solid #1f2937;
        }
        
        .camera-icon {
            font-size: 2.5rem;
            margin-bottom: 0.75rem;
            color: #4b5563;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin-bottom: 2rem;
        }
        
        .info-section {
            margin-bottom: 2rem;
        }
        
        .section-title {
            font-size: 1.125rem;
            font-weight: 600;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid #d1d5db;
            color: #374151;
        }
        
        .info-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.75rem;
        }
        
        .info-label {
            font-weight: 500;
            color: #4b5563;
        }
        
        .info-value {
            color: #1f2937;
        }
        
        .status-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 0.25rem;
            font-size: 0.875rem;
            font-weight: 500;
            border: 1px solid;
        }
        
        .status-approved {
            background-color: #dcfce7;
            color: #166534;
            border-color: #86efac;
        }
        
        .status-sent {
            background-color: #dbeafe;
            color: #1e40af;
            border-color: #93c5fd;
        }
        
        .status-rejected {
            background-color: #fee2e2;
            color: #991b1b;
            border-color: #fca5a5;
        }
        
        .status-default {
            background-color: #f3f4f6;
            color: #1f2937;
            border-color: #d1d5db;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #d1d5db;
            margin-bottom: 1.5rem;
        }
        
        .items-table th,
        .items-table td {
            border: 1px solid #d1d5db;
            padding: 1rem;
            text-align: left;
        }
        
        .items-table th {
            background-color: #f3f4f6;
            font-weight: 600;
        }
        
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        
        .total-section {
            text-align: right;
            margin-top: 1.5rem;
        }
        
        .total-box {
            display: inline-block;
            background-color: #f3f4f6;
            padding: 1rem;
            border-radius: 0.25rem;
            border: 1px solid #d1d5db;
        }
        
        .total-amount {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1f2937;
        }
        
        .footer {
            border-top: 2px solid #1f2937;
            padding-top: 1.5rem;
            margin-top: 2rem;
            text-align: center;
        }
        
        .footer-note {
            font-size: 0.875rem;
            color: #4b5563;
            margin-bottom: 1rem;
        }
        
        .footer-timestamp {
            font-size: 0.875rem;
            color: #6b7280;
        }
        
        .whitespace-pre-wrap {
            white-space: pre-wrap;
        }
        
        @media print {
            body { padding: 1rem; }
            .budget-container { padding: 1rem; }
        }
    </style>
</head>
<body>
    <div class="budget-container">
        <div class="budget-header">
            ${generateCompanyHeader()}
        </div>

        <div class="info-grid">
            <div>
                <h2 class="section-title">Informações do Orçamento</h2>
                <div class="info-item">
                    <span class="info-label">Título:</span>
                    <span class="info-value">${budget.budget_title}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Data de Criação:</span>
                    <span class="info-value">${createdDate}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Válido até:</span>
                    <span class="info-value">${validityFormatted}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Status:</span>
                    <span class="info-value">
                        <span class="status-badge ${
                          budget.status === 'approved' ? 'status-approved' :
                          budget.status === 'sent' ? 'status-sent' :
                          budget.status === 'rejected' ? 'status-rejected' :
                          'status-default'
                        }">
                            ${statusLabels[budget.status] || budget.status}
                        </span>
                    </span>
                </div>
            </div>

            <div>
                <h2 class="section-title">Dados do Cliente</h2>
                <div class="info-item">
                    <span class="info-label">Nome:</span>
                    <span class="info-value">${budget.client_name}</span>
                </div>
                ${budget.client_email ? `
                <div class="info-item">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${budget.client_email}</span>
                </div>
                ` : ''}
                ${budget.client_phone ? `
                <div class="info-item">
                    <span class="info-label">Telefone:</span>
                    <span class="info-value">${budget.client_phone}</span>
                </div>
                ` : ''}
                ${budget.event_date ? `
                <div class="info-item">
                    <span class="info-label">Data do Evento:</span>
                    <span class="info-value">${new Date(budget.event_date).toLocaleDateString('pt-BR')}</span>
                </div>
                ` : ''}
            </div>
        </div>

        <div class="info-section">
            <h2 class="section-title">Itens e Serviços</h2>
            ${budget.budget_items && budget.budget_items.length > 0 ? `
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Serviço</th>
                            <th>Descrição</th>
                            <th class="text-center">Qtd</th>
                            <th class="text-right">Preço Unit.</th>
                            <th class="text-right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${budget.budget_items.map(item => `
                            <tr>
                                <td>${item.service_name}</td>
                                <td>${item.description || '-'}</td>
                                <td class="text-center">${item.quantity}</td>
                                <td class="text-right">${formatCurrency(item.unit_price)}</td>
                                <td class="text-right" style="font-weight: 600;">${formatCurrency(item.subtotal)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : `
                <p style="text-align: center; color: #6b7280; padding: 1rem;">Nenhum item foi adicionado a este orçamento.</p>
            `}
            
            <div class="total-section">
                <div class="total-box">
                    <div class="total-amount">
                        Total Geral: ${formatCurrency(budget.total_amount)}
                    </div>
                </div>
            </div>
        </div>

        ${(budget.payment_method || budget.payment_conditions) ? `
        <div class="info-section">
            <h2 class="section-title">Condições de Pagamento</h2>
            ${budget.payment_method ? `
            <div class="info-item">
                <span class="info-label">Forma de Pagamento:</span>
                <span class="info-value">${budget.payment_method}</span>
            </div>
            ` : ''}
            ${budget.payment_conditions ? `
            <div style="margin-top: 0.5rem;">
                <span class="info-label">Condições:</span>
                <div style="margin-top: 0.5rem; color: #1f2937; white-space: pre-wrap;">${budget.payment_conditions}</div>
            </div>
            ` : ''}
        </div>
        ` : ''}

        ${budget.general_notes ? `
        <div class="info-section">
            <h2 class="section-title">Observações Gerais</h2>
            <div style="color: #1f2937; white-space: pre-wrap;">${budget.general_notes}</div>
        </div>
        ` : ''}

        <div class="footer">
            <div class="footer-note">
                Orçamento válido por ${budget.validity_days} dias a partir da data de emissão.
            </div>
            <div class="footer-timestamp">
                Este orçamento foi gerado automaticamente em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.
            </div>
        </div>
    </div>
</body>
</html>`;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Visualizar Orçamento
          </DialogTitle>
          <DialogDescription>
            Visualize o orçamento antes de imprimir ou salvar como PDF.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button onClick={handlePrintBudget} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Imprimir / Salvar PDF
            </Button>
          </div>
          
          <div className="border rounded-lg overflow-hidden max-h-[60vh] overflow-y-auto">
            <BudgetReceiptTemplate 
              budget={budget} 
              photographerProfile={photographerProfile} 
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
