
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { BudgetWithItems } from '@/types/budget';
import { formatCurrency } from '@/utils/currency';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Extend jsPDF interface for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface CompanyInfo {
  company_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  avatar_url?: string;
}

export function generateBudgetPDF(budget: BudgetWithItems, companyInfo?: CompanyInfo) {
  console.log('Gerando PDF com dados:', { budget, companyInfo });
  
  const doc = new jsPDF();
  let yPosition = 20;

  // Header with company info
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  const companyName = companyInfo?.company_name || companyInfo?.name || 'Estúdio Fotográfico';
  doc.text(companyName, 20, yPosition);
  
  yPosition += 10;
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  
  if (companyInfo?.email) {
    doc.text(`Email: ${companyInfo.email}`, 20, yPosition);
    yPosition += 6;
  }
  
  if (companyInfo?.phone) {
    doc.text(`Telefone: ${companyInfo.phone}`, 20, yPosition);
    yPosition += 6;
  }
  
  if (companyInfo?.website) {
    doc.text(`Website: ${companyInfo.website}`, 20, yPosition);
    yPosition += 6;
  }

  yPosition += 10;

  // Budget title
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('ORÇAMENTO', 20, yPosition);
  yPosition += 15;

  // Budget info
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  
  doc.text(`Título: ${budget.budget_title}`, 20, yPosition);
  yPosition += 8;
  
  doc.text(`Cliente: ${budget.client_name}`, 20, yPosition);
  yPosition += 8;
  
  if (budget.client_email) {
    doc.text(`Email: ${budget.client_email}`, 20, yPosition);
    yPosition += 8;
  }
  
  if (budget.client_phone) {
    doc.text(`Telefone: ${budget.client_phone}`, 20, yPosition);
    yPosition += 8;
  }
  
  if (budget.event_date) {
    const eventDate = format(new Date(budget.event_date), 'dd/MM/yyyy', { locale: ptBR });
    doc.text(`Data do Evento: ${eventDate}`, 20, yPosition);
    yPosition += 8;
  }
  
  const createdDate = format(new Date(budget.created_at), 'dd/MM/yyyy', { locale: ptBR });
  doc.text(`Data de Criação: ${createdDate}`, 20, yPosition);
  yPosition += 8;
  
  const validityDate = new Date(budget.created_at);
  validityDate.setDate(validityDate.getDate() + budget.validity_days);
  const validityFormatted = format(validityDate, 'dd/MM/yyyy', { locale: ptBR });
  doc.text(`Válido até: ${validityFormatted}`, 20, yPosition);
  yPosition += 15;

  // Items table
  if (budget.budget_items && budget.budget_items.length > 0) {
    const tableData = budget.budget_items.map(item => [
      item.service_name || '',
      item.description || '-',
      item.quantity?.toString() || '1',
      formatCurrency(item.unit_price || 0),
      formatCurrency(item.subtotal || 0)
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['Serviço', 'Descrição', 'Quantidade', 'Preço Unitário', 'Subtotal']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: [33, 37, 41],
        textColor: 255,
        fontSize: 11,
        fontStyle: 'bold',
      },
      columnStyles: {
        2: { halign: 'center' },
        3: { halign: 'right' },
        4: { halign: 'right' },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  } else {
    doc.text('Nenhum item encontrado neste orçamento.', 20, yPosition);
    yPosition += 15;
  }

  // Total
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(`TOTAL: ${formatCurrency(budget.total_amount || 0)}`, 20, yPosition);
  yPosition += 15;

  // Payment conditions
  if (budget.payment_method || budget.payment_conditions) {
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('CONDIÇÕES DE PAGAMENTO:', 20, yPosition);
    yPosition += 8;
    
    doc.setFont(undefined, 'normal');
    
    if (budget.payment_method) {
      doc.text(`Forma de Pagamento: ${budget.payment_method}`, 20, yPosition);
      yPosition += 6;
    }
    
    if (budget.payment_conditions) {
      const lines = doc.splitTextToSize(budget.payment_conditions, 170);
      doc.text(lines, 20, yPosition);
      yPosition += lines.length * 6 + 10;
    }
  }

  // General notes
  if (budget.general_notes) {
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('OBSERVAÇÕES GERAIS:', 20, yPosition);
    yPosition += 8;
    
    doc.setFont(undefined, 'normal');
    const notesLines = doc.splitTextToSize(budget.general_notes, 170);
    doc.text(notesLines, 20, yPosition);
  }

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width - 50,
      doc.internal.pageSize.height - 10
    );
  }

  console.log('PDF gerado com sucesso');
  return doc;
}

export async function downloadBudgetPDF(budget: BudgetWithItems, companyInfo?: CompanyInfo) {
  try {
    console.log('Iniciando geração do PDF...');
    
    if (!budget) {
      throw new Error('Dados do orçamento não fornecidos');
    }

    const doc = generateBudgetPDF(budget, companyInfo);
    const fileName = `orcamento-${budget.budget_title.replace(/\s+/g, '-').toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    
    console.log('Salvando arquivo:', fileName);
    doc.save(fileName);
    
    console.log('Download do PDF concluído');
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error('Erro ao gerar PDF: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
  }
}
