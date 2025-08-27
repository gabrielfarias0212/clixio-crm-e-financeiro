import jsPDF from 'jspdf';
import { BudgetWithItems } from '@/types/budget';
import { formatCurrency } from '@/utils/currency';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CompanyInfo {
  company_name?: string;
  logo_url?: string;
  brand_name?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
}

async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading image:', error);
    return null;
  }
}

export async function generateBudgetPDF(budget: BudgetWithItems, companyInfo?: CompanyInfo) {
  const doc = new jsPDF();
  let yPosition = 25;
  const currentDate = new Date().toLocaleDateString('pt-BR');

  // Header with thick bottom border (matching PaymentReceiptTemplate)
  doc.setDrawColor(30, 41, 59); // Dark gray
  doc.setLineWidth(2);
  doc.line(20, 75, 190, 75);

  // Budget number in top right corner
  const budgetNumber = `Orçamento Nº: ${budget.id.slice(-6).toUpperCase()}`;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 116, 139); // Gray-500
  doc.setFillColor(248, 250, 252); // Gray-50
  const textWidth = doc.getTextWidth(budgetNumber);
  doc.rect(190 - textWidth - 6, 15, textWidth + 6, 12, 'F');
  doc.text(budgetNumber, 190 - 3, 24, { align: 'right' });

  // Logo and title centered
  yPosition = 35;
  if (companyInfo?.logo_url) {
    try {
      const imageData = await loadImageAsBase64(companyInfo.logo_url);
      if (imageData) {
        // Center logo with proper aspect ratio
        doc.addImage(imageData, 'JPEG', 95, 25, 20, 15, undefined, 'FAST');
        yPosition = 45;
      }
    } catch (error) {
      console.log('Could not load logo image');
    }
  }

  // Main title centered
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(30, 41, 59); // Gray-800
  doc.text('ORÇAMENTO', 105, yPosition, { align: 'center' });

  // Company name centered
  yPosition += 10;
  if (companyInfo?.company_name) {
    doc.setFontSize(18);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 116, 139); // Gray-500
    doc.text(companyInfo.company_name, 105, yPosition, { align: 'center' });
    yPosition += 8;
  }

  if (companyInfo?.brand_name && companyInfo.brand_name !== companyInfo.company_name) {
    doc.setFontSize(14);
    doc.setTextColor(156, 163, 175); // Gray-400
    doc.text(companyInfo.brand_name, 105, yPosition, { align: 'center' });
    yPosition += 6;
  }

  // Contact info centered
  if (companyInfo && (companyInfo.whatsapp || companyInfo.email || companyInfo.website)) {
    yPosition += 3;
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    
    const contacts = [];
    if (companyInfo.whatsapp) contacts.push(`Tel: ${companyInfo.whatsapp}`);
    if (companyInfo.email) contacts.push(`Email: ${companyInfo.email}`);
    if (companyInfo.website) contacts.push(`Site: ${companyInfo.website}`);
    
    const contactText = contacts.join(' • ');
    doc.text(contactText, 105, yPosition, { align: 'center' });
  }

  // Client Data Section
  yPosition = 90;
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(71, 85, 105); // Gray-600
  doc.text('Dados do Cliente', 20, yPosition);
  
  // Section underline
  doc.setDrawColor(203, 213, 225); // Gray-300
  doc.setLineWidth(1);
  doc.line(20, yPosition + 2, 190, yPosition + 2);
  
  yPosition += 12;
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(51, 65, 85); // Gray-700

  // Client info grid (2 columns)
  const leftCol = 25;
  const rightCol = 115;
  let leftY = yPosition;
  let rightY = yPosition;

  // Left column
  doc.setFont(undefined, 'bold');
  doc.setTextColor(100, 116, 139); // Gray-500
  doc.text('Nome:', leftCol, leftY);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(30, 41, 59); // Gray-800
  doc.text(budget.client_name, leftCol + 15, leftY);
  leftY += 8;

  if (budget.client_email) {
    doc.setFont(undefined, 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('Email:', leftCol, leftY);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(budget.client_email, leftCol + 15, leftY);
    leftY += 8;
  }

  if (budget.client_phone) {
    doc.setFont(undefined, 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('Telefone:', leftCol, leftY);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(budget.client_phone, leftCol + 20, leftY);
    leftY += 8;
  }

  // Right column
  if (budget.event_date) {
    const eventDate = format(new Date(budget.event_date), 'dd/MM/yyyy', { locale: ptBR });
    doc.setFont(undefined, 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('Data do Evento:', rightCol, rightY);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(eventDate, rightCol + 30, rightY);
    rightY += 8;
  }

  const createdDate = format(new Date(budget.created_at), 'dd/MM/yyyy', { locale: ptBR });
  doc.setFont(undefined, 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Data de Criação:', rightCol, rightY);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(createdDate, rightCol + 32, rightY);
  rightY += 8;

  const validityDate = new Date(budget.created_at);
  validityDate.setDate(validityDate.getDate() + budget.validity_days);
  const validityFormatted = format(validityDate, 'dd/MM/yyyy', { locale: ptBR });
  doc.setFont(undefined, 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Válido até:', rightCol, rightY);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(validityFormatted, rightCol + 25, rightY);

  // Service Details Section
  yPosition = Math.max(leftY, rightY) + 15;
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Detalhes dos Serviços', 20, yPosition);
  
  // Section underline
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(1);
  doc.line(20, yPosition + 2, 190, yPosition + 2);
  
  yPosition += 15;

  // Services table
  budget.budget_items.forEach((item, index) => {
    const serviceName = doc.splitTextToSize(item.service_name, 70);
    const description = doc.splitTextToSize(item.description || '-', 60);
    const maxLines = Math.max(serviceName.length, description.length);
    const rowHeight = Math.max(12, maxLines * 5 + 6);
    
    // Check for page break
    if (yPosition + rowHeight > 240) {
      doc.addPage();
      yPosition = 30;
      
      // Repeat header
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Detalhes dos Serviços (continuação)', 20, yPosition);
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(1);
      doc.line(20, yPosition + 2, 190, yPosition + 2);
      yPosition += 15;
    }

    // Alternate row background (matching template style)
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252); // Gray-50
      doc.rect(20, yPosition - 2, 170, rowHeight, 'F');
    }

    // Service content
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(serviceName, 25, yPosition + 4);
    
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(description, 105, yPosition + 4);
    
    doc.setFont(undefined, 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(formatCurrency(item.subtotal), 185, yPosition + 4, { align: 'right' });

    // Bottom border
    doc.setDrawColor(226, 232, 240); // Gray-200
    doc.setLineWidth(0.5);
    doc.line(20, yPosition + rowHeight - 1, 190, yPosition + rowHeight - 1);

    yPosition += rowHeight;
  });

  // Financial Summary (matching PaymentReceiptTemplate cards style)
  yPosition += 10;
  doc.setFillColor(248, 250, 252); // Gray-50
  doc.setDrawColor(226, 232, 240); // Gray-200
  doc.setLineWidth(1);
  doc.rect(20, yPosition, 170, 35, 'FD');
  
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Resumo Financeiro', 25, yPosition + 12);
  
  // Total amount card style
  doc.setFillColor(255, 255, 255); // White
  doc.rect(130, yPosition + 5, 55, 25, 'FD');
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('VALOR TOTAL', 157.5, yPosition + 12, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(59, 130, 246); // Blue-500
  doc.text(formatCurrency(budget.total_amount), 157.5, yPosition + 22, { align: 'center' });

  yPosition += 50;

  // Payment method section
  if (budget.payment_method || budget.payment_conditions) {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Condições de Pagamento', 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 116, 139);
    
    if (budget.payment_method) {
      doc.text(budget.payment_method, 20, yPosition);
      yPosition += 6;
    }
    
    if (budget.payment_conditions) {
      const lines = doc.splitTextToSize(budget.payment_conditions, 150);
      doc.text(lines, 20, yPosition);
      yPosition += lines.length * 5 + 10;
    }
  }

  // Terms section
  if (budget.general_notes) {
    yPosition += 5;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Observações', 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 116, 139);
    const notesLines = doc.splitTextToSize(budget.general_notes, 150);
    doc.text(notesLines, 20, yPosition);
    yPosition += notesLines.length * 5;
  }

  // Footer with thick top border (matching template)
  const footerY = 270;
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(2);
  doc.line(20, footerY, 190, footerY);
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`Orçamento emitido em: ${currentDate}`, 105, footerY + 8, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 116, 139);
  const validityText = `Este orçamento é válido por ${budget.validity_days} dias.`;
  doc.text(validityText, 105, footerY + 18, { align: 'center' });

  // Page numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Página ${i} de ${pageCount}`,
      105,
      290,
      { align: 'center' }
    );
  }

  return doc;
}

export async function downloadBudgetPDF(budget: BudgetWithItems, companyInfo?: CompanyInfo) {
  const doc = await generateBudgetPDF(budget, companyInfo);
  const fileName = `orcamento-${budget.budget_title.replace(/\s+/g, '-').toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}