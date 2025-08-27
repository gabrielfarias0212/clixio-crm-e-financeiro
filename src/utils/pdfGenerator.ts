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

  // Modern header with gradient background
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, 210, 50, 'F');
  
  // Add logo if available
  if (companyInfo?.logo_url) {
    try {
      const imageData = await loadImageAsBase64(companyInfo.logo_url);
      if (imageData) {
        doc.addImage(imageData, 'JPEG', 20, 15, 25, 25);
      }
    } catch (error) {
      console.log('Could not load logo image');
    }
  }

  // Company info with modern typography
  const hasLogo = companyInfo?.logo_url;
  const textStartX = hasLogo ? 55 : 20;
  
  doc.setFontSize(22);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(companyInfo?.company_name || companyInfo?.brand_name || 'Estúdio Fotográfico', textStartX, yPosition);
  
  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(71, 85, 105);
  
  const contactInfo = [];
  if (companyInfo?.email) contactInfo.push(`Email: ${companyInfo.email}`);
  if (companyInfo?.whatsapp) contactInfo.push(`WhatsApp: ${companyInfo.whatsapp}`);
  if (companyInfo?.website) contactInfo.push(`Website: ${companyInfo.website}`);
  
  contactInfo.forEach(info => {
    doc.text(info, textStartX, yPosition);
    yPosition += 5;
  });

  yPosition = 60;

  // Budget title with modern design
  doc.setFillColor(15, 23, 42);
  doc.rect(20, yPosition - 5, 170, 15, 'F');
  
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('ORÇAMENTO', 25, yPosition + 5);
  
  yPosition += 25;

  // Client info section with clean layout
  doc.setFillColor(248, 250, 252);
  doc.rect(20, yPosition - 5, 170, 35, 'F');
  
  yPosition += 5;
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('INFORMAÇÕES DO CLIENTE', 25, yPosition);
  
  yPosition += 8;
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(51, 65, 85);
  
  // Client info in two columns
  const leftColumn = 25;
  const rightColumn = 120;
  let leftY = yPosition;
  let rightY = yPosition;
  
  doc.text(`${budget.client_name}`, leftColumn, leftY);
  leftY += 6;
  
  if (budget.client_email) {
    doc.text(`${budget.client_email}`, leftColumn, leftY);
    leftY += 6;
  }
  
  if (budget.client_phone) {
    doc.text(`${budget.client_phone}`, leftColumn, leftY);
    leftY += 6;
  }
  
  // Right column
  doc.text(`Orçamento: ${budget.budget_title}`, rightColumn, rightY);
  rightY += 6;
  
  if (budget.event_date) {
    const eventDate = format(new Date(budget.event_date), 'dd/MM/yyyy', { locale: ptBR });
    doc.text(`Evento: ${eventDate}`, rightColumn, rightY);
    rightY += 6;
  }
  
  const createdDate = format(new Date(budget.created_at), 'dd/MM/yyyy', { locale: ptBR });
  doc.text(`Criado em: ${createdDate}`, rightColumn, rightY);
  rightY += 6;
  
  const validityDate = new Date(budget.created_at);
  validityDate.setDate(validityDate.getDate() + budget.validity_days);
  const validityFormatted = format(validityDate, 'dd/MM/yyyy', { locale: ptBR });
  doc.text(`Válido até: ${validityFormatted}`, rightColumn, rightY);

  yPosition += 35;

  // Items section with modern table design
  yPosition += 10;
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('ITENS DO ORÇAMENTO', 20, yPosition);
  yPosition += 15;

  // Modern table design
  const headers = ['Serviço', 'Descrição', 'Qtd', 'Preço Unit.', 'Subtotal'];
  const colWidths = [45, 65, 20, 30, 30];
  const colPositions = [20, 65, 130, 150, 180];
  const tableWidth = 170;
  const rowHeight = 12;
  
  // Table header with gradient
  doc.setFillColor(15, 23, 42);
  doc.rect(20, yPosition - 5, tableWidth, rowHeight, 'F');
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(255, 255, 255);
  
  headers.forEach((header, index) => {
    const xPos = colPositions[index] + 3;
    doc.text(header, xPos, yPosition + 3);
  });
  
  yPosition += rowHeight;

  // Table rows with proper spacing
  doc.setFont(undefined, 'normal');
  doc.setTextColor(51, 65, 85);
  
  budget.budget_items.forEach((item, index) => {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 30;
      
      // Repeat header on new page
      doc.setFillColor(15, 23, 42);
      doc.rect(20, yPosition - 5, tableWidth, rowHeight, 'F');
      doc.setFont(undefined, 'bold');
      doc.setTextColor(255, 255, 255);
      headers.forEach((header, i) => {
        doc.text(header, colPositions[i] + 3, yPosition + 3);
      });
      yPosition += rowHeight;
      doc.setFont(undefined, 'normal');
      doc.setTextColor(51, 65, 85);
    }

    // Alternate row background
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(20, yPosition - 5, tableWidth, rowHeight, 'F');
    }

    // Service name (with text wrapping)
    const serviceName = doc.splitTextToSize(item.service_name, colWidths[0] - 6);
    doc.text(serviceName, colPositions[0] + 3, yPosition + 3);

    // Description (with text wrapping)
    const description = doc.splitTextToSize(item.description || '-', colWidths[1] - 6);
    doc.text(description, colPositions[1] + 3, yPosition + 3);

    // Quantity (centered)
    doc.text(item.quantity.toString(), colPositions[2] + colWidths[2]/2, yPosition + 3, { align: 'center' });

    // Unit price (right aligned)
    doc.text(formatCurrency(item.unit_price), colPositions[3] + colWidths[3] - 3, yPosition + 3, { align: 'right' });

    // Subtotal (right aligned)
    doc.text(formatCurrency(item.subtotal), colPositions[4] + colWidths[4] - 3, yPosition + 3, { align: 'right' });

    yPosition += rowHeight;
  });

  // Table border
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.rect(20, yPosition - (budget.budget_items.length * rowHeight) - rowHeight, tableWidth, (budget.budget_items.length * rowHeight) + rowHeight);
  
  // Column separators
  colPositions.slice(1).forEach(pos => {
    doc.line(pos, yPosition - (budget.budget_items.length * rowHeight) - rowHeight, pos, yPosition);
  });

  yPosition += 15;

  // Total section with modern design
  doc.setFillColor(15, 23, 42);
  doc.rect(120, yPosition - 5, 70, 15, 'F');
  
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL:', 125, yPosition + 5);
  doc.text(formatCurrency(budget.total_amount), 185, yPosition + 5, { align: 'right' });
  
  yPosition += 25;

  // Payment conditions with modern layout
  if (budget.payment_method || budget.payment_conditions) {
    doc.setFillColor(248, 250, 252);
    const sectionHeight = 25 + (budget.payment_conditions ? Math.ceil(budget.payment_conditions.length / 80) * 6 : 0);
    doc.rect(20, yPosition - 5, 170, sectionHeight, 'F');
    
    yPosition += 5;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('CONDIÇÕES DE PAGAMENTO', 25, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(51, 65, 85);
    
    if (budget.payment_method) {
      doc.text(`Forma de Pagamento: ${budget.payment_method}`, 25, yPosition);
      yPosition += 7;
    }
    
    if (budget.payment_conditions) {
      const lines = doc.splitTextToSize(budget.payment_conditions, 160);
      doc.text(lines, 25, yPosition);
      yPosition += lines.length * 6 + 10;
    } else {
      yPosition += 10;
    }
  }

  // General notes with modern layout
  if (budget.general_notes) {
    yPosition += 10;
    doc.setFillColor(248, 250, 252);
    const notesHeight = 20 + Math.ceil(budget.general_notes.length / 80) * 6;
    doc.rect(20, yPosition - 5, 170, notesHeight, 'F');
    
    yPosition += 5;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('OBSERVAÇÕES GERAIS', 25, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(51, 65, 85);
    const notesLines = doc.splitTextToSize(budget.general_notes, 160);
    doc.text(notesLines, 25, yPosition);
    yPosition += notesLines.length * 6 + 10;
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

export async function downloadBudgetPDF(budget: BudgetWithItems, companyInfo?: CompanyInfo) {
  const doc = await generateBudgetPDF(budget, companyInfo);
  const fileName = `orcamento-${budget.budget_title.replace(/\s+/g, '-').toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}