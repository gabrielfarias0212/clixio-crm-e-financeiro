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
  let yPosition = 30;
  const currentDate = new Date().toLocaleDateString('pt-BR');
  const pageMargin = 20;
  const pageWidth = 170; // 210 - 40 (margins)

  // Budget number in top right corner
  const budgetNumber = `Orçamento Nº: ${budget.id.slice(-6).toUpperCase()}`;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 116, 139);
  doc.setFillColor(248, 250, 252);
  const textWidth = doc.getTextWidth(budgetNumber);
  doc.rect(190 - textWidth - 8, 15, textWidth + 8, 14, 'F');
  doc.text(budgetNumber, 190 - 4, 25, { align: 'right' });

  // Logo and title section with better spacing
  yPosition = 40;
  if (companyInfo?.logo_url) {
    try {
      const imageData = await loadImageAsBase64(companyInfo.logo_url);
      if (imageData) {
        doc.addImage(imageData, 'JPEG', 90, 30, 30, 22, undefined, 'FAST');
        yPosition = 58;
      }
    } catch (error) {
      console.log('Could not load logo image');
      yPosition = 45;
    }
  }

  // Main title with better spacing
  doc.setFontSize(26);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('ORÇAMENTO', 105, yPosition, { align: 'center' });
  yPosition += 12;

  // Company information with proper spacing
  if (companyInfo?.company_name) {
    doc.setFontSize(16);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(companyInfo.company_name, 105, yPosition, { align: 'center' });
    yPosition += 8;
  }

  if (companyInfo?.brand_name && companyInfo.brand_name !== companyInfo.company_name) {
    doc.setFontSize(12);
    doc.setTextColor(156, 163, 175);
    doc.text(companyInfo.brand_name, 105, yPosition, { align: 'center' });
    yPosition += 8;
  }

  // Contact info with better layout
  if (companyInfo && (companyInfo.whatsapp || companyInfo.email || companyInfo.website)) {
    yPosition += 2;
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    
    const contacts = [];
    if (companyInfo.whatsapp) contacts.push(`Tel: ${companyInfo.whatsapp}`);
    if (companyInfo.email) contacts.push(`Email: ${companyInfo.email}`);
    if (companyInfo.website) contacts.push(`Site: ${companyInfo.website}`);
    
    const contactText = contacts.join(' • ');
    doc.text(contactText, 105, yPosition, { align: 'center' });
    yPosition += 8;
  }

  // Header separator with proper spacing
  yPosition += 8;
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(2);
  doc.line(pageMargin, yPosition, 190, yPosition);
  yPosition += 15;

  // Client Data Section
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Dados do Cliente', pageMargin, yPosition);
  
  // Section underline
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(1);
  doc.line(pageMargin, yPosition + 3, 190, yPosition + 3);
  
  yPosition += 15;
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(51, 65, 85);

  // Client info with better spacing and layout
  const leftCol = 25;
  const rightCol = 120;
  let leftY = yPosition;
  let rightY = yPosition;

  // Left column with consistent spacing
  doc.setFont(undefined, 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Nome:', leftCol, leftY);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(30, 41, 59);
  const clientName = doc.splitTextToSize(budget.client_name, 80);
  doc.text(clientName, leftCol + 18, leftY);
  leftY += Math.max(8, clientName.length * 4 + 4);

  if (budget.client_email) {
    doc.setFont(undefined, 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('Email:', leftCol, leftY);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(30, 41, 59);
    const email = doc.splitTextToSize(budget.client_email, 80);
    doc.text(email, leftCol + 18, leftY);
    leftY += Math.max(8, email.length * 4 + 4);
  }

  if (budget.client_phone) {
    doc.setFont(undefined, 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('Telefone:', leftCol, leftY);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(budget.client_phone, leftCol + 24, leftY);
    leftY += 8;
  }

  // Right column with proper alignment
  if (budget.event_date) {
    const eventDate = format(new Date(budget.event_date), 'dd/MM/yyyy', { locale: ptBR });
    doc.setFont(undefined, 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('Data do Evento:', rightCol, rightY);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(eventDate, rightCol + 32, rightY);
    rightY += 8;
  }

  const createdDate = format(new Date(budget.created_at), 'dd/MM/yyyy', { locale: ptBR });
  doc.setFont(undefined, 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Data de Criação:', rightCol, rightY);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(createdDate, rightCol + 35, rightY);
  rightY += 8;

  const validityDate = new Date(budget.created_at);
  validityDate.setDate(validityDate.getDate() + budget.validity_days);
  const validityFormatted = format(validityDate, 'dd/MM/yyyy', { locale: ptBR });
  doc.setFont(undefined, 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Válido até:', rightCol, rightY);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(validityFormatted, rightCol + 26, rightY);

  // Service Details Section with better spacing
  yPosition = Math.max(leftY, rightY) + 20;
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Detalhes dos Serviços', pageMargin, yPosition);
  
  // Section underline
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(1);
  doc.line(pageMargin, yPosition + 3, 190, yPosition + 3);
  
  yPosition += 18;

  // Table headers
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(100, 116, 139);
  doc.setFillColor(248, 250, 252);
  doc.rect(pageMargin, yPosition - 3, pageWidth, 12, 'F');
  doc.text('Serviço', pageMargin + 3, yPosition + 3);
  doc.text('Descrição', pageMargin + 75, yPosition + 3);
  doc.text('Valor', 185, yPosition + 3, { align: 'right' });
  
  // Header border
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(pageMargin, yPosition + 8, 190, yPosition + 8);
  
  yPosition += 15;

  // Services table with improved spacing
  budget.budget_items.forEach((item, index) => {
    const serviceNameWidth = 70;
    const descriptionWidth = 65;
    
    const serviceName = doc.splitTextToSize(item.service_name, serviceNameWidth);
    const description = doc.splitTextToSize(item.description || 'Não informado', descriptionWidth);
    
    const maxLines = Math.max(serviceName.length, description.length);
    const lineHeight = 5;
    const padding = 8;
    const rowHeight = Math.max(16, maxLines * lineHeight + padding);
    
    // Check for page break with better margin
    if (yPosition + rowHeight > 250) {
      doc.addPage();
      yPosition = 40;
      
      // Repeat section header on new page
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Detalhes dos Serviços (continuação)', pageMargin, yPosition);
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(1);
      doc.line(pageMargin, yPosition + 3, 190, yPosition + 3);
      yPosition += 18;
      
      // Repeat table headers
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(100, 116, 139);
      doc.setFillColor(248, 250, 252);
      doc.rect(pageMargin, yPosition - 3, pageWidth, 12, 'F');
      doc.text('Serviço', pageMargin + 3, yPosition + 3);
      doc.text('Descrição', pageMargin + 75, yPosition + 3);
      doc.text('Valor', 185, yPosition + 3, { align: 'right' });
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(pageMargin, yPosition + 8, 190, yPosition + 8);
      yPosition += 15;
    }

    // Row background with alternating colors
    if (index % 2 === 0) {
      doc.setFillColor(252, 252, 252); // Very light gray
      doc.rect(pageMargin, yPosition - 2, pageWidth, rowHeight, 'F');
    }

    // Service content with proper positioning
    const contentY = yPosition + 4;
    
    // Service name column
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(serviceName, pageMargin + 3, contentY);
    
    // Description column  
    doc.setFont(undefined, 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text(description, pageMargin + 75, contentY);
    
    // Price column
    doc.setFont(undefined, 'bold');
    doc.setTextColor(16, 185, 129); // Green for price
    doc.text(formatCurrency(item.subtotal), 185, contentY, { align: 'right' });

    // Row border
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.line(pageMargin, yPosition + rowHeight - 1, 190, yPosition + rowHeight - 1);

    yPosition += rowHeight;
  });

  yPosition += 8;

  // Financial Summary with dynamic positioning
  if (yPosition > 220) {
    doc.addPage();
    yPosition = 40;
  }
  
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.rect(pageMargin, yPosition, pageWidth, 40, 'FD');
  
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Resumo Financeiro', pageMargin + 5, yPosition + 15);
  
  // Total amount card with better positioning
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(2);
  doc.rect(125, yPosition + 8, 60, 24, 'FD');
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('VALOR TOTAL', 155, yPosition + 16, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text(formatCurrency(budget.total_amount), 155, yPosition + 26, { align: 'center' });

  yPosition += 55;

  // Payment method section with consistent margins
  if (budget.payment_method || budget.payment_conditions) {
    // Check for page space
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 40;
    }
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Condições de Pagamento', pageMargin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 116, 139);
    
    if (budget.payment_method) {
      doc.text(budget.payment_method, pageMargin + 5, yPosition);
      yPosition += 7;
    }
    
    if (budget.payment_conditions) {
      const lines = doc.splitTextToSize(budget.payment_conditions, 160);
      doc.text(lines, pageMargin + 5, yPosition);
      yPosition += lines.length * 5 + 12;
    }
  }

  // Terms section with consistent margins
  if (budget.general_notes) {
    // Check for page space
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 40;
    }
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Observações', pageMargin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 116, 139);
    const notesLines = doc.splitTextToSize(budget.general_notes, 160);
    doc.text(notesLines, pageMargin + 5, yPosition);
    yPosition += notesLines.length * 5 + 15;
  }

  // Dynamic footer positioning
  const pageCount = (doc as any).internal.getNumberOfPages();
  
  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    doc.setPage(pageNum);
    
    // Footer separator
    const footerY = pageNum === pageCount ? Math.max(yPosition + 10, 260) : 270;
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(1.5);
    doc.line(pageMargin, footerY, 190, footerY);
    
    // Footer content
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`Orçamento emitido em: ${currentDate}`, 105, footerY + 10, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 116, 139);
    const validityText = `Este orçamento é válido por ${budget.validity_days} dias.`;
    doc.text(validityText, 105, footerY + 18, { align: 'center' });

    // Page numbers
    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175);
    doc.text(`Página ${pageNum} de ${pageCount}`, 105, 290, { align: 'center' });
  }

  return doc;
}

export async function downloadBudgetPDF(budget: BudgetWithItems, companyInfo?: CompanyInfo) {
  const doc = await generateBudgetPDF(budget, companyInfo);
  const fileName = `orcamento-${budget.budget_title.replace(/\s+/g, '-').toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}