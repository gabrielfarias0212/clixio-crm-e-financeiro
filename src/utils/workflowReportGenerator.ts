import jsPDF from 'jspdf';
import { Client, WorkflowStage } from '@/utils/types';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Parse YYYY-MM-DD sem shift de timezone
function parseDateSafe(dateStr: string): Date | null {
  if (!dateStr) return null;
  // YYYY-MM-DD → local midnight
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  // DD/MM/YYYY
  const m2 = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (m2) return new Date(Number(m2[3]), Number(m2[2]) - 1, Number(m2[1]));
  return null;
}

interface WorkflowReportOptions {
  stages: WorkflowStage[];
  sortByPriority: boolean;
  companyName?: string;
}

const workflowStageLabels: Record<WorkflowStage, string> = {
  evento_ensaio: 'Evento/Ensaio',
  copia: 'Cópia',
  backup: 'Backup',
  curadoria: 'Curadoria',
  edicao: 'Edição',
  link_pronto: 'Link Pronto',
  link_enviado: 'Link Enviado',
  entrega_fisica: 'Entrega Física',
  projeto_finalizado: 'Finalizado',
  edicao_base: 'Edição Base',
  edicao_final: 'Edição Final',
  album_em_andamento: 'Álbum em Andamento'
};

// Determinar o estágio do workflow de um cliente
function getClientWorkflowStage(client: Client): WorkflowStage {
  if (client.workflowStage) {
    return client.workflowStage;
  }

  if (client.status === 'projeto_finalizado') return 'projeto_finalizado';
  if (client.boxDelivered || client.albumApprovedDelivered) return 'entrega_fisica';
  if (client.linkSent) return 'link_enviado';
  if (client.linkReady) return 'link_pronto';
  if (client.inEditing) return 'edicao';
  if (client.curationCompleted) return 'curadoria';
  if (client.backupCompleted) return 'backup';
  if (client.weddingPhotographed) return 'copia';
  return 'evento_ensaio';
}

// Calcular dias desde o evento
function getDaysSinceEvent(client: Client): number | null {
  if (!client.weddingDate) return null;
  const eventDate = parseDateSafe(client.weddingDate);
  if (!eventDate) return null;
  return differenceInDays(new Date(), eventDate);
}

// Determinar prioridade baseada no tempo desde o evento
function getPriorityLevel(daysSinceEvent: number | null): { level: string; color: { r: number; g: number; b: number } } {
  if (daysSinceEvent === null) {
    return { level: 'Sem data', color: { r: 156, g: 163, b: 175 } };
  }
  
  if (daysSinceEvent > 60) {
    return { level: 'URGENTE', color: { r: 220, g: 38, b: 38 } }; // Red
  } else if (daysSinceEvent > 30) {
    return { level: 'Alta', color: { r: 245, g: 158, b: 11 } }; // Orange
  } else if (daysSinceEvent > 14) {
    return { level: 'Média', color: { r: 234, g: 179, b: 8 } }; // Yellow
  } else if (daysSinceEvent >= 0) {
    return { level: 'Normal', color: { r: 34, g: 197, b: 94 } }; // Green
  } else {
    return { level: 'Futuro', color: { r: 59, g: 130, b: 246 } }; // Blue
  }
}

export function generateWorkflowReport(
  clients: Client[],
  options: WorkflowReportOptions
): jsPDF {
  const doc = new jsPDF();
  const currentDate = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  const pageMargin = 20;
  const pageWidth = 170;
  let yPosition = 25;

  // Filtrar clientes por estágios selecionados
  const filteredClients = clients.filter(client => {
    const stage = getClientWorkflowStage(client);
    return options.stages.includes(stage);
  });

  // Adicionar informações de prioridade e ordenar
  const clientsWithPriority = filteredClients.map(client => ({
    client,
    stage: getClientWorkflowStage(client),
    daysSinceEvent: getDaysSinceEvent(client),
    priority: getPriorityLevel(getDaysSinceEvent(client))
  }));

  // Ordenar por prioridade (mais dias desde o evento primeiro)
  if (options.sortByPriority) {
    clientsWithPriority.sort((a, b) => {
      // Clientes sem data vão para o final
      if (a.daysSinceEvent === null && b.daysSinceEvent === null) return 0;
      if (a.daysSinceEvent === null) return 1;
      if (b.daysSinceEvent === null) return -1;
      // Maior número de dias = maior prioridade
      return b.daysSinceEvent - a.daysSinceEvent;
    });
  }

  // === HEADER ===
  doc.setFontSize(22);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('RELATÓRIO DE FLUXO DE TRABALHO', 105, yPosition, { align: 'center' });
  yPosition += 10;

  if (options.companyName) {
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(options.companyName, 105, yPosition, { align: 'center' });
    yPosition += 8;
  }

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Gerado em: ${currentDate}`, 105, yPosition, { align: 'center' });
  yPosition += 5;

  // Linha separadora
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(1.5);
  doc.line(pageMargin, yPosition, 190, yPosition);
  yPosition += 12;

  // === RESUMO ===
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Resumo', pageMargin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(51, 65, 85);

  // Contar por estágio
  const stageCount: Record<string, number> = {};
  options.stages.forEach(stage => {
    const count = clientsWithPriority.filter(c => c.stage === stage).length;
    stageCount[stage] = count;
  });

  // Mostrar etapas filtradas
  doc.text(`Etapas incluídas: ${options.stages.map(s => workflowStageLabels[s]).join(', ')}`, pageMargin, yPosition);
  yPosition += 6;
  doc.text(`Total de projetos: ${clientsWithPriority.length}`, pageMargin, yPosition);
  yPosition += 6;

  // Contar por prioridade
  const urgentCount = clientsWithPriority.filter(c => c.priority.level === 'URGENTE').length;
  const highCount = clientsWithPriority.filter(c => c.priority.level === 'Alta').length;
  
  if (urgentCount > 0 || highCount > 0) {
    doc.setFont(undefined, 'bold');
    doc.setTextColor(220, 38, 38);
    doc.text(`! Atencao: ${urgentCount} urgente(s), ${highCount} prioridade alta`, pageMargin, yPosition);
    yPosition += 6;
  }

  yPosition += 8;

  // === TABELA DE PROJETOS ===
  // Agrupar por estágio
  const stageOrder: WorkflowStage[] = [
    'evento_ensaio', 'copia', 'backup', 'curadoria', 'edicao',
    'link_pronto', 'link_enviado', 'entrega_fisica', 'projeto_finalizado'
  ];

  const groupedByStage = stageOrder
    .filter(stage => options.stages.includes(stage))
    .map(stage => ({
      stage,
      label: workflowStageLabels[stage],
      clients: clientsWithPriority.filter(c => c.stage === stage)
    }))
    .filter(group => group.clients.length > 0);

  for (const group of groupedByStage) {
    // Verificar espaço na página
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 25;
    }

    // Título da seção
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(`${group.label} (${group.clients.length})`, pageMargin, yPosition);
    
    // Linha sob o título
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(pageMargin, yPosition + 2, 190, yPosition + 2);
    yPosition += 10;

    // Cabeçalho da tabela
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(100, 116, 139);
    doc.setFillColor(248, 250, 252);
    doc.rect(pageMargin, yPosition - 3, pageWidth, 10, 'F');
    
    doc.text('Cliente', pageMargin + 2, yPosition + 3);
    doc.text('Categoria', pageMargin + 55, yPosition + 3);
    doc.text('Data Evento', pageMargin + 95, yPosition + 3);
    doc.text('Dias', pageMargin + 130, yPosition + 3);
    doc.text('Prioridade', pageMargin + 145, yPosition + 3);
    
    yPosition += 10;

    // Linhas da tabela
    for (const item of group.clients) {
      // Verificar espaço na página
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 25;
        
        // Repetir cabeçalho
        doc.setFontSize(13);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(71, 85, 105);
        doc.text(`${group.label} (continuação)`, pageMargin, yPosition);
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.5);
        doc.line(pageMargin, yPosition + 2, 190, yPosition + 2);
        yPosition += 10;
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(100, 116, 139);
        doc.setFillColor(248, 250, 252);
        doc.rect(pageMargin, yPosition - 3, pageWidth, 10, 'F');
        doc.text('Cliente', pageMargin + 2, yPosition + 3);
        doc.text('Categoria', pageMargin + 55, yPosition + 3);
        doc.text('Data Evento', pageMargin + 95, yPosition + 3);
        doc.text('Dias', pageMargin + 130, yPosition + 3);
        doc.text('Prioridade', pageMargin + 145, yPosition + 3);
        yPosition += 10;
      }

      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(30, 41, 59);

      // Nome do cliente (truncado se necessário)
      const clientName = item.client.name.length > 25 
        ? item.client.name.substring(0, 22) + '...' 
        : item.client.name;
      doc.text(clientName, pageMargin + 2, yPosition);

      // Categoria
      doc.setTextColor(100, 116, 139);
      const category = item.client.eventCategory || '-';
      doc.text(category.length > 12 ? category.substring(0, 10) + '..' : category, pageMargin + 55, yPosition);

      // Data do evento
      if (item.client.weddingDate) {
        const d = parseDateSafe(item.client.weddingDate);
        const eventDate = d ? format(d, 'dd/MM/yyyy', { locale: ptBR }) : '-';
        doc.text(eventDate, pageMargin + 95, yPosition);
      } else {
        doc.text('-', pageMargin + 95, yPosition);
      }

      // Dias desde evento
      doc.text(
        item.daysSinceEvent !== null ? String(item.daysSinceEvent) : '-', 
        pageMargin + 130, 
        yPosition
      );

      // Prioridade com cor
      doc.setFont(undefined, 'bold');
      doc.setTextColor(item.priority.color.r, item.priority.color.g, item.priority.color.b);
      doc.text(item.priority.level, pageMargin + 145, yPosition);

      // Linha divisória sutil
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.2);
      doc.line(pageMargin, yPosition + 3, 190, yPosition + 3);

      yPosition += 8;
    }

    yPosition += 8;
  }

  // === LEGENDA DE PRIORIDADES ===
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 25;
  }

  yPosition += 5;
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Legenda de Prioridades', pageMargin, yPosition);
  yPosition += 8;

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');

  const legends = [
    { label: 'URGENTE', desc: 'Mais de 60 dias desde o evento', color: { r: 220, g: 38, b: 38 } },
    { label: 'Alta', desc: '31 a 60 dias desde o evento', color: { r: 245, g: 158, b: 11 } },
    { label: 'Média', desc: '15 a 30 dias desde o evento', color: { r: 234, g: 179, b: 8 } },
    { label: 'Normal', desc: '0 a 14 dias desde o evento', color: { r: 34, g: 197, b: 94 } },
    { label: 'Futuro', desc: 'Evento ainda não ocorreu', color: { r: 59, g: 130, b: 246 } },
  ];

  for (const legend of legends) {
    doc.setFont(undefined, 'bold');
    doc.setTextColor(legend.color.r, legend.color.g, legend.color.b);
    doc.text(`${legend.label}:`, pageMargin, yPosition);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(legend.desc, pageMargin + 25, yPosition);
    yPosition += 6;
  }

  // === RODAPÉ ===
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
  }

  return doc;
}

export function downloadWorkflowReport(
  clients: Client[],
  options: WorkflowReportOptions
): void {
  const doc = generateWorkflowReport(clients, options);
  const fileName = `relatorio-workflow-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
  doc.save(fileName);
}
