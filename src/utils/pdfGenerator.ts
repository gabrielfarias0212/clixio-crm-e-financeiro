import jsPDF from 'jspdf';
import { BudgetWithItems } from '@/types/budget';
import { formatCurrency } from '@/utils/currency';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CompanyInfo {
  company_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  avatar_url?: string;
}

export function generateBudgetPDF(budget: BudgetWithItems, companyInfo?: CompanyInfo) {
  const doc = new jsPDF();
  let yPosition = 20;

  // Header with company info
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text(companyInfo?.company_name || companyInfo?.name || 'Estúdio Fotográfico', 20, yPosition);
  
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

  // Items table - manual implementation
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('ITENS DO ORÇAMENTO:', 20, yPosition);
  yPosition += 10;

  // Table headers
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  
  const headers = ['Serviço', 'Descrição', 'Qtd', 'Preço Unit.', 'Subtotal'];
  const colWidths = [40, 60, 20, 30, 30];
  const colPositions = [20, 60, 120, 140, 170];
  
  // Draw header background
  doc.setFillColor(33, 37, 41);
  doc.rect(20, yPosition - 3, 180, 8, 'F');
  
  // Draw header text
  doc.setTextColor(255, 255, 255);
  headers.forEach((header, index) => {
    doc.text(header, colPositions[index], yPosition + 3);
  });
  
  yPosition += 10;
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'normal');

  // Draw table rows
  budget.budget_items.forEach((item, index) => {
    const rowData = [
      item.service_name,
      item.description || '-',
      item.quantity.toString(),
      formatCurrency(item.unit_price),
      formatCurrency(item.subtotal)
    ];

    // Alternate row background
    if (index % 2 === 0) {
      doc.setFillColor(248, 249, 250);
      doc.rect(20, yPosition - 3, 180, 8, 'F');
    }

    // Draw row data
    rowData.forEach((data, colIndex) => {
      const text = doc.splitTextToSize(data, colWidths[colIndex] - 5);
      const align = colIndex >= 2 ? 'right' : 'left';
      const xPos = align === 'right' ? colPositions[colIndex] + colWidths[colIndex] - 5 : colPositions[colIndex];
      
      doc.text(text, xPos, yPosition + 3, { align });
    });

    yPosition += 8;
    
    // Add new page if needed
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
  });

  // Draw table border
  doc.setDrawColor(0, 0, 0);
  doc.rect(20, yPosition - (budget.budget_items.length * 8) - 8, 180, (budget.budget_items.length * 8) + 8);
  
  // Draw column separators
  for (let i = 1; i < colPositions.length; i++) {
    doc.line(
      colPositions[i], 
      yPosition - (budget.budget_items.length * 8) - 8, 
      colPositions[i], 
      yPosition
    );
  }

  yPosition += 15;

  // Total
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(`TOTAL: ${formatCurrency(budget.total_amount)}`, 20, yPosition);
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

  return doc;
}

export function downloadBudgetPDF(budget: BudgetWithItems, companyInfo?: CompanyInfo) {
  const doc = generateBudgetPDF(budget, companyInfo);
  const fileName = `orcamento-${budget.budget_title.replace(/\s+/g, '-').toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}