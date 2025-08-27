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

// Draw curved decorative elements inspired by the reference image
function drawDecorativeElements(doc: jsPDF) {
  // Top curved element
  doc.setFillColor(147, 51, 234, 0.1); // Light purple inspired by primary color
  doc.ellipse(210, -20, 60, 40, 'F');
  
  // Bottom curved element
  doc.setFillColor(59, 130, 246, 0.1); // Light blue accent
  doc.ellipse(-20, 280, 50, 35, 'F');
}

export async function generateBudgetPDF(budget: BudgetWithItems, companyInfo?: CompanyInfo) {
  const doc = new jsPDF();
  let yPosition = 25;

  // Draw decorative background elements
  drawDecorativeElements(doc);

  // Header section with company info (top right, inspired by reference)
  if (companyInfo?.logo_url) {
    try {
      const imageData = await loadImageAsBase64(companyInfo.logo_url);
      if (imageData) {
        // Logo positioned at top right
        doc.addImage(imageData, 'JPEG', 150, 15, 30, 20, undefined, 'FAST');
      }
    } catch (error) {
      console.log('Could not load logo image');
    }
  }

  // Company name (top right)
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(59, 130, 246); // Primary blue
  const companyName = companyInfo?.company_name || companyInfo?.brand_name || 'ESTÚDIO FOTOGRÁFICO';
  doc.text(companyName, 210, 25, { align: 'right' });

  // Budget title and number (left side, large)
  yPosition = 50;
  doc.setFontSize(32);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(30, 41, 59); // Dark gray
  doc.text('ORÇAMENTO', 20, yPosition);
  
  yPosition += 12;
  doc.setFontSize(24);
  doc.setTextColor(147, 51, 234); // Purple accent
  const budgetNumber = `#${budget.id.slice(-6).toUpperCase()}`;
  doc.text(budgetNumber, 20, yPosition);

  // Client info section with "A/C:" header
  yPosition += 25;
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('A/C:', 20, yPosition);

  yPosition += 10;
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(51, 65, 85);

  // Client details
  doc.text(budget.client_name, 20, yPosition);
  yPosition += 6;
  
  if (budget.client_phone) {
    doc.text(budget.client_phone, 20, yPosition);
    yPosition += 6;
  }
  
  if (budget.client_email) {
    doc.text(budget.client_email, 20, yPosition);
    yPosition += 6;
  }

  // Budget info in right column
  let rightY = yPosition - 18;
  const rightX = 120;
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  
  if (budget.event_date) {
    const eventDate = format(new Date(budget.event_date), 'dd/MM/yyyy', { locale: ptBR });
    doc.text(`Data do Evento: ${eventDate}`, rightX, rightY);
    rightY += 5;
  }
  
  const createdDate = format(new Date(budget.created_at), 'dd/MM/yyyy', { locale: ptBR });
  doc.text(`Data de Criação: ${createdDate}`, rightX, rightY);
  rightY += 5;
  
  const validityDate = new Date(budget.created_at);
  validityDate.setDate(validityDate.getDate() + budget.validity_days);
  const validityFormatted = format(validityDate, 'dd/MM/yyyy', { locale: ptBR });
  doc.text(`Válido até: ${validityFormatted}`, rightX, rightY);

  // Services table (inspired by reference design)
  yPosition += 20;
  
  // Table header with gradient background
  doc.setFillColor(147, 51, 234); // Purple primary
  doc.rect(20, yPosition - 5, 170, 12, 'F');
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(255, 255, 255);
  
  // Header columns
  doc.text('SERVIÇO', 25, yPosition + 3);
  doc.text('DESCRIÇÃO', 80, yPosition + 3);
  doc.text('VALOR', 160, yPosition + 3);
  
  yPosition += 12;

  // Table rows
  doc.setFont(undefined, 'normal');
  doc.setTextColor(51, 65, 85);
  
  let totalRowHeight = 0;
  
  budget.budget_items.forEach((item, index) => {
    const serviceName = doc.splitTextToSize(item.service_name, 50);
    const description = doc.splitTextToSize(item.description || '-', 75);
    const maxLines = Math.max(serviceName.length, description.length);
    const rowHeight = Math.max(15, maxLines * 6 + 8);
    
    // Check for page break
    if (yPosition + rowHeight > 260) {
      doc.addPage();
      drawDecorativeElements(doc);
      yPosition = 30;
      
      // Repeat header
      doc.setFillColor(147, 51, 234);
      doc.rect(20, yPosition - 5, 170, 12, 'F');
      doc.setFont(undefined, 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('SERVIÇO', 25, yPosition + 3);
      doc.text('DESCRIÇÃO', 80, yPosition + 3);
      doc.text('VALOR', 160, yPosition + 3);
      yPosition += 12;
      doc.setFont(undefined, 'normal');
      doc.setTextColor(51, 65, 85);
    }

    // Alternate row background
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(20, yPosition - 3, 170, rowHeight, 'F');
    }

    // Row content
    doc.text(serviceName, 25, yPosition + 5);
    doc.text(description, 80, yPosition + 5);
    doc.text(formatCurrency(item.subtotal), 185, yPosition + 5, { align: 'right' });

    // Add borders
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(20, yPosition + rowHeight - 3, 190, yPosition + rowHeight - 3);

    yPosition += rowHeight;
    totalRowHeight += rowHeight;
  });

  // Table border
  doc.setDrawColor(147, 51, 234);
  doc.setLineWidth(1);
  doc.rect(20, yPosition - totalRowHeight - 12, 170, totalRowHeight + 12);
  
  // Column separators
  doc.line(75, yPosition - totalRowHeight - 12, 75, yPosition);
  doc.line(155, yPosition - totalRowHeight - 12, 155, yPosition);

  // Total section (styled like the reference)
  yPosition += 15;
  doc.setFillColor(147, 51, 234);
  doc.rect(110, yPosition - 5, 80, 18, 'F');
  
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL:', 115, yPosition + 6);
  doc.text(formatCurrency(budget.total_amount), 185, yPosition + 6, { align: 'right' });

  yPosition += 30;

  // Payment method section
  if (budget.payment_method || budget.payment_conditions) {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('FORMA DE PAGAMENTO', 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(71, 85, 105);
    
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

  // Terms and conditions section
  yPosition += 10;
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('TERMOS E CONDIÇÕES', 20, yPosition);
  yPosition += 8;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(71, 85, 105);
  
  const validityText = `Este orçamento é válido por ${budget.validity_days} dias.`;
  doc.text(validityText, 20, yPosition);
  
  if (budget.general_notes) {
    yPosition += 6;
    const notesLines = doc.splitTextToSize(budget.general_notes, 150);
    doc.text(notesLines, 20, yPosition);
  }

  // Contact info in bottom right (inspired by reference)
  const bottomY = 260;
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  
  if (companyInfo?.whatsapp) {
    doc.text(companyInfo.whatsapp, 190, bottomY, { align: 'right' });
  }
  
  if (companyInfo?.website) {
    doc.text(companyInfo.website, 190, bottomY + 5, { align: 'right' });
  }
  
  if (companyInfo?.email) {
    doc.text(companyInfo.email, 190, bottomY + 10, { align: 'right' });
  }

  // Footer with page numbers
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