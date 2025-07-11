
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
  console.log('=== PDF GENERATION START ===');
  console.log('Budget data:', budget);
  console.log('Company info:', companyInfo);
  
  try {
    const doc = new jsPDF();
    let yPosition = 20;

    // Header with company info
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    const companyName = companyInfo?.company_name || companyInfo?.name || 'Estúdio Fotográfico';
    console.log('Using company name:', companyName);
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
    
    doc.text(`Título: ${budget.budget_title || 'Sem título'}`, 20, yPosition);
    yPosition += 8;
    
    doc.text(`Cliente: ${budget.client_name || 'Nome não informado'}`, 20, yPosition);
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
      try {
        const eventDate = format(new Date(budget.event_date), 'dd/MM/yyyy', { locale: ptBR });
        doc.text(`Data do Evento: ${eventDate}`, 20, yPosition);
        yPosition += 8;
      } catch (dateError) {
        console.warn('Error formatting event date:', dateError);
        doc.text(`Data do Evento: ${budget.event_date}`, 20, yPosition);
        yPosition += 8;
      }
    }
    
    try {
      const createdDate = format(new Date(budget.created_at), 'dd/MM/yyyy', { locale: ptBR });
      doc.text(`Data de Criação: ${createdDate}`, 20, yPosition);
      yPosition += 8;
    } catch (dateError) {
      console.warn('Error formatting created date:', dateError);
      doc.text(`Data de Criação: ${budget.created_at}`, 20, yPosition);
      yPosition += 8;
    }
    
    try {
      const validityDate = new Date(budget.created_at);
      validityDate.setDate(validityDate.getDate() + (budget.validity_days || 15));
      const validityFormatted = format(validityDate, 'dd/MM/yyyy', { locale: ptBR });
      doc.text(`Válido até: ${validityFormatted}`, 20, yPosition);
      yPosition += 15;
    } catch (dateError) {
      console.warn('Error calculating validity date:', dateError);
      doc.text(`Válido até: ${budget.validity_days || 15} dias`, 20, yPosition);
      yPosition += 15;
    }

    // Items table
    console.log('Processing budget items...');
    if (budget.budget_items && budget.budget_items.length > 0) {
      console.log(`Found ${budget.budget_items.length} items`);
      
      const tableData = budget.budget_items.map((item, index) => {
        console.log(`Processing item ${index + 1}:`, item);
        return [
          item.service_name || 'Serviço não especificado',
          item.description || '-',
          (item.quantity || 1).toString(),
          formatCurrency(item.unit_price || 0),
          formatCurrency(item.subtotal || 0)
        ];
      });

      console.log('Table data prepared:', tableData);

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
      console.log('No budget items found');
      doc.text('Nenhum item encontrado neste orçamento.', 20, yPosition);
      yPosition += 15;
    }

    // Total
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    const totalAmount = budget.total_amount || 0;
    console.log('Total amount:', totalAmount);
    doc.text(`TOTAL: ${formatCurrency(totalAmount)}`, 20, yPosition);
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
        try {
          const lines = doc.splitTextToSize(budget.payment_conditions, 170);
          doc.text(lines, 20, yPosition);
          yPosition += lines.length * 6 + 10;
        } catch (textError) {
          console.warn('Error splitting payment conditions text:', textError);
          doc.text(budget.payment_conditions, 20, yPosition);
          yPosition += 20;
        }
      }
    }

    // General notes
    if (budget.general_notes) {
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('OBSERVAÇÕES GERAIS:', 20, yPosition);
      yPosition += 8;
      
      doc.setFont(undefined, 'normal');
      try {
        const notesLines = doc.splitTextToSize(budget.general_notes, 170);
        doc.text(notesLines, 20, yPosition);
      } catch (textError) {
        console.warn('Error splitting notes text:', textError);
        doc.text(budget.general_notes, 20, yPosition);
      }
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

    console.log('PDF generation completed successfully');
    return doc;
  } catch (error) {
    console.error('=== PDF GENERATION ERROR ===');
    console.error('Error details:', error);
    throw new Error(`Erro na geração do PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

export async function downloadBudgetPDF(budget: BudgetWithItems, companyInfo?: CompanyInfo) {
  try {
    console.log('=== DOWNLOAD PDF START ===');
    console.log('Input validation...');
    
    if (!budget) {
      throw new Error('Dados do orçamento não fornecidos');
    }

    if (!budget.budget_title) {
      console.warn('Budget title is missing, using fallback');
    }

    console.log('Generating PDF document...');
    const doc = generateBudgetPDF(budget, companyInfo);
    
    const safeTitle = (budget.budget_title || 'orcamento').replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
    const fileName = `orcamento-${safeTitle}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    
    console.log('Saving file as:', fileName);
    doc.save(fileName);
    
    console.log('=== DOWNLOAD PDF SUCCESS ===');
  } catch (error) {
    console.error('=== DOWNLOAD PDF ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    throw new Error(`Erro ao baixar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}
