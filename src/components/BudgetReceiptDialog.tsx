
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
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Orçamento - ${budget.budget_title}</title>
          <style>
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: white;
            }
            .no-print { display: none !important; }
            @media print {
              body { margin: 0; padding: 15px; }
              .print-break { page-break-after: always; }
            }
            @page {
              margin: 1cm;
              size: A4;
            }
            /* Tailwind-like styles */
            .max-w-4xl { max-width: 56rem; }
            .mx-auto { margin-left: auto; margin-right: auto; }
            .bg-white { background-color: white; }
            .p-8 { padding: 2rem; }
            .font-sans { font-family: system-ui, -apple-system, sans-serif; }
            .relative { position: relative; }
            .text-center { text-align: center; }
            .mb-10 { margin-bottom: 2.5rem; }
            .pb-6 { padding-bottom: 1.5rem; }
            .border-b-2 { border-bottom-width: 2px; }
            .border-gray-800 { border-color: #1f2937; }
            .flex { display: flex; }
            .flex-col { flex-direction: column; }
            .items-center { align-items: center; }
            .mb-3 { margin-bottom: 0.75rem; }
            .h-16 { height: 4rem; }
            .w-auto { width: auto; }
            .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
            .font-bold { font-weight: 700; }
            .text-gray-800 { color: #1f2937; }
            .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
            .text-gray-600 { color: #4b5563; }
            .font-medium { font-weight: 500; }
            .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
            .text-gray-500 { color: #6b7280; }
            .flex-wrap { flex-wrap: wrap; }
            .justify-center { justify-content: center; }
            .gap-4 { gap: 1rem; }
            .mt-4 { margin-top: 1rem; }
            .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
            .gap-1 { gap: 0.25rem; }
            .gap-3 { gap: 0.75rem; }
            .mt-2 { margin-top: 0.5rem; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .gap-8 { gap: 2rem; }
            .mb-8 { margin-bottom: 2rem; }
            .font-semibold { font-weight: 600; }
            .mb-4 { margin-bottom: 1rem; }
            .pb-2 { padding-bottom: 0.5rem; }
            .border-b { border-bottom-width: 1px; }
            .border-gray-300 { border-color: #d1d5db; }
            .text-gray-700 { color: #374151; }
            .space-y-3 > * + * { margin-top: 0.75rem; }
            .justify-between { justify-content: space-between; }
            .inline-block { display: inline-block; }
            .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
            .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
            .rounded { border-radius: 0.25rem; }
            .border { border-width: 1px; }
            .bg-green-100 { background-color: #dcfce7; }
            .text-green-800 { color: #166534; }
            .border-green-300 { border-color: #86efac; }
            .bg-blue-100 { background-color: #dbeafe; }
            .text-blue-800 { color: #1e40af; }
            .border-blue-300 { border-color: #93c5fd; }
            .bg-red-100 { background-color: #fee2e2; }
            .text-red-800 { color: #991b1b; }
            .border-red-300 { border-color: #fca5a5; }
            .bg-gray-100 { background-color: #f3f4f6; }
            .border-gray-300 { border-color: #d1d5db; }
            .overflow-x-auto { overflow-x: auto; }
            .w-full { width: 100%; }
            .border-collapse { border-collapse: collapse; }
            .px-4 { padding-left: 1rem; padding-right: 1rem; }
            .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
            .text-left { text-align: left; }
            .text-right { text-align: right; }
            .mt-6 { margin-top: 1.5rem; }
            .p-4 { padding: 1rem; }
            .text-2xl { font-size: 1.5rem; line-height: 2rem; }
            .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
            .whitespace-pre-wrap { white-space: pre-wrap; }
            .border-t-2 { border-top-width: 2px; }
            .pt-6 { padding-top: 1.5rem; }
            .mt-8 { margin-top: 2rem; }
            .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
            .hidden { display: none; }
          </style>
        </head>
        <body>
          <div id="budget-content"></div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    // Render the component content
    const tempDiv = document.createElement('div');
    const root = document.createElement('div');
    root.appendChild(React.createElement(BudgetReceiptTemplate, {
      budget,
      photographerProfile
    }));
    
    // Create a new window and write the content
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent.innerHTML.replace(
        '<div id="budget-content"></div>',
        `<div id="budget-content">${createBudgetHTML(budget, photographerProfile)}</div>`
      ));
      printWindow.document.close();
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

    return `
      <div class="max-w-4xl mx-auto bg-white p-8 font-sans">
        <!-- Cabeçalho -->
        <div class="relative text-center mb-10 pb-6 border-b-2 border-gray-800">
          <div class="flex flex-col items-center mb-3">
            ${photographerProfile?.logo_url ? 
              `<img src="${photographerProfile.logo_url}" alt="Logo" class="h-16 w-auto mb-3" />` : 
              '<div style="width: 40px; height: 40px; margin-bottom: 12px; background: #4b5563; border-radius: 4px;"></div>'
            }
          </div>
          
          <h1 class="text-3xl font-bold mb-3 text-gray-800">ORÇAMENTO</h1>
          
          ${photographerProfile?.company_name ? 
            `<p class="text-xl text-gray-600 font-medium">${photographerProfile.company_name}</p>` : ''
          }
          
          ${photographerProfile?.brand_name && photographerProfile.brand_name !== photographerProfile.company_name ? 
            `<p class="text-lg text-gray-500">${photographerProfile.brand_name}</p>` : ''
          }
          
          ${!photographerProfile?.company_name && !photographerProfile?.brand_name ? 
            '<p class="text-xl text-gray-600">Fotografia Profissional</p>' : ''
          }

          <!-- Informações de contato -->
          <div class="flex flex-wrap justify-center gap-4 mt-4 text-sm text-gray-600">
            ${photographerProfile?.whatsapp ? `<span>📞 ${photographerProfile.whatsapp}</span>` : ''}
            ${photographerProfile?.email ? `<span>✉️ ${photographerProfile.email}</span>` : ''}
            ${photographerProfile?.website ? `<span>🌐 ${photographerProfile.website}</span>` : ''}
          </div>
        </div>

        <!-- Informações do Orçamento -->
        <div class="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h2 class="text-lg font-semibold mb-4 pb-2 border-b border-gray-300 text-gray-700">
              Informações do Orçamento
            </h2>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="font-medium text-gray-600">Título:</span>
                <span class="text-gray-800">${budget.budget_title}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-medium text-gray-600">Data de Criação:</span>
                <span class="text-gray-800">${createdDate}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-medium text-gray-600">Válido até:</span>
                <span class="text-gray-800">${validityFormatted}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-medium text-gray-600">Status:</span>
                <span class="inline-block px-3 py-1 rounded text-sm font-medium bg-gray-100 text-gray-800 border border-gray-300">
                  ${statusLabels[budget.status] || budget.status}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h2 class="text-lg font-semibold mb-4 pb-2 border-b border-gray-300 text-gray-700">
              Dados do Cliente
            </h2>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="font-medium text-gray-600">Nome:</span>
                <span class="text-gray-800">${budget.client_name}</span>
              </div>
              ${budget.client_email ? `
                <div class="flex justify-between">
                  <span class="font-medium text-gray-600">Email:</span>
                  <span class="text-gray-800">${budget.client_email}</span>
                </div>
              ` : ''}
              ${budget.client_phone ? `
                <div class="flex justify-between">
                  <span class="font-medium text-gray-600">Telefone:</span>
                  <span class="text-gray-800">${budget.client_phone}</span>
                </div>
              ` : ''}
              ${budget.event_date ? `
                <div class="flex justify-between">
                  <span class="font-medium text-gray-600">Data do Evento:</span>
                  <span class="text-gray-800">${new Date(budget.event_date).toLocaleDateString('pt-BR')}</span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Itens do Orçamento -->
        <div class="mb-8">
          <h2 class="text-lg font-semibold mb-4 pb-2 border-b border-gray-300 text-gray-700">
            Itens e Serviços
          </h2>
          ${budget.budget_items && budget.budget_items.length > 0 ? `
            <div class="overflow-x-auto">
              <table class="w-full border-collapse border border-gray-300">
                <thead>
                  <tr class="bg-gray-100">
                    <th class="border border-gray-300 px-4 py-2 text-left font-semibold">Serviço</th>
                    <th class="border border-gray-300 px-4 py-2 text-left font-semibold">Descrição</th>
                    <th class="border border-gray-300 px-4 py-2 text-center font-semibold">Qtd</th>
                    <th class="border border-gray-300 px-4 py-2 text-right font-semibold">Preço Unit.</th>
                    <th class="border border-gray-300 px-4 py-2 text-right font-semibold">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${budget.budget_items.map(item => `
                    <tr>
                      <td class="border border-gray-300 px-4 py-2">${item.service_name}</td>
                      <td class="border border-gray-300 px-4 py-2">${item.description || '-'}</td>
                      <td class="border border-gray-300 px-4 py-2 text-center">${item.quantity}</td>
                      <td class="border border-gray-300 px-4 py-2 text-right">${formatCurrency(item.unit_price)}</td>
                      <td class="border border-gray-300 px-4 py-2 text-right font-semibold">${formatCurrency(item.subtotal)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : `
            <p class="text-gray-500 text-center py-4">Nenhum item foi adicionado a este orçamento.</p>
          `}
          
          <div class="mt-6 text-right">
            <div class="inline-block bg-gray-100 p-4 rounded border border-gray-300">
              <div class="text-2xl font-bold text-gray-800">
                Total Geral: ${formatCurrency(budget.total_amount)}
              </div>
            </div>
          </div>
        </div>

        <!-- Condições de Pagamento e Observações -->
        <div class="grid grid-cols-1 gap-8">
          ${(budget.payment_method || budget.payment_conditions) ? `
            <div>
              <h2 class="text-lg font-semibold mb-4 pb-2 border-b border-gray-300 text-gray-700">
                Condições de Pagamento
              </h2>
              <div class="space-y-3">
                ${budget.payment_method ? `
                  <div>
                    <span class="font-medium text-gray-600">Forma de Pagamento: </span>
                    <span class="text-gray-800">${budget.payment_method}</span>
                  </div>
                ` : ''}
                ${budget.payment_conditions ? `
                  <div>
                    <span class="font-medium text-gray-600">Condições:</span>
                    <div class="mt-2 text-gray-800 whitespace-pre-wrap">${budget.payment_conditions}</div>
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}

          ${budget.general_notes ? `
            <div>
              <h2 class="text-lg font-semibold mb-4 pb-2 border-b border-gray-300 text-gray-700">
                Observações Gerais
              </h2>
              <div class="text-gray-800 whitespace-pre-wrap">${budget.general_notes}</div>
            </div>
          ` : ''}
        </div>

        <!-- Rodapé -->
        <div class="border-t-2 border-gray-800 pt-6 mt-8 text-center">
          <div class="text-sm text-gray-600 mb-4">
            Orçamento válido por ${budget.validity_days} dias a partir da data de emissão.
          </div>
          <div class="text-sm text-gray-500">
            Este orçamento foi gerado automaticamente em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.
          </div>
        </div>
      </div>
    `;
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
