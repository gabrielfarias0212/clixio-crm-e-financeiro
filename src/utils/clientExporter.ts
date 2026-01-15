import * as XLSX from 'xlsx';
import { Client, ClientStatus } from '@/utils/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface ExportFilters {
  statuses: ClientStatus[];
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
  includeContractDetails: boolean;
  includePayments: boolean;
  includeWorkflowInfo: boolean;
}

const STATUS_LABELS: Record<ClientStatus, string> = {
  primeiro_contato: "Primeiro Contato",
  "orçamento enviado": "Orçamento Enviado",
  negociacao: "Negociação",
  fechado: "Fechado",
  projeto_finalizado: "Projeto Finalizado",
  contrato_perdido: "Contrato Perdido"
};

const WORKFLOW_STAGE_LABELS: Record<string, string> = {
  backlog: "Backlog",
  curation: "Curadoria",
  editing: "Edição",
  review: "Revisão",
  delivery: "Entrega",
  delivered: "Entregue"
};

const EVENT_CATEGORY_LABELS: Record<string, string> = {
  casamento: "Casamento",
  aniversario: "Aniversário",
  corporativo: "Corporativo",
  ensaio: "Ensaio",
  batizado: "Batizado",
  formatura: "Formatura",
  outros: "Outros"
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  try {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return dateString;
  }
}

export function filterClientsForExport(clients: Client[], filters: ExportFilters): Client[] {
  let filtered = [...clients];

  // Filter by status
  if (filters.statuses.length > 0) {
    filtered = filtered.filter(client => filters.statuses.includes(client.status));
  }

  // Filter by date range
  if (filters.dateRange?.start || filters.dateRange?.end) {
    filtered = filtered.filter(client => {
      if (!client.weddingDate) return false;
      const eventDate = new Date(client.weddingDate);
      
      if (filters.dateRange?.start && eventDate < filters.dateRange.start) {
        return false;
      }
      if (filters.dateRange?.end && eventDate > filters.dateRange.end) {
        return false;
      }
      return true;
    });
  }

  return filtered;
}

export function exportClientsToExcel(
  clients: Client[], 
  filters: ExportFilters,
  filename?: string
): void {
  const filteredClients = filterClientsForExport(clients, filters);

  // Build data rows
  const data = filteredClients.map(client => {
    const baseData: Record<string, any> = {
      'Nome': client.name,
      'Nome do Casal': client.coupleName || '',
      'Email': client.email || '',
      'Telefone': client.phone || '',
      'Status': STATUS_LABELS[client.status] || client.status,
      'Categoria': EVENT_CATEGORY_LABELS[client.eventCategory] || client.eventCategory || '',
      'Data do Evento': formatDate(client.weddingDate),
      'Local do Evento': client.eventLocation || ''
    };

    if (filters.includeContractDetails) {
      baseData['Valor do Contrato'] = formatCurrency(client.contractValue || 0);
      baseData['Entrada'] = formatCurrency(client.downPayment || 0);
      baseData['Saldo'] = formatCurrency((client.contractValue || 0) - (client.downPayment || 0));
      baseData['Link do Contrato'] = client.contractLink || '';
    }

    if (filters.includePayments) {
      const totalPaid = client.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const remaining = (client.contractValue || 0) - totalPaid;
      baseData['Total Pago'] = formatCurrency(totalPaid);
      baseData['Saldo Restante'] = formatCurrency(remaining);
      baseData['Qtd. Pagamentos'] = client.payments?.length || 0;
    }

    if (filters.includeWorkflowInfo) {
      baseData['Etapa do Workflow'] = WORKFLOW_STAGE_LABELS[client.workflowStage || ''] || client.workflowStage || '';
      baseData['Ensaio Agendado'] = client.preWeddingScheduled ? 'Sim' : 'Não';
      baseData['Ensaio Realizado'] = client.preWeddingCompleted ? 'Sim' : 'Não';
      baseData['Em Edição'] = client.inEditing ? 'Sim' : 'Não';
      baseData['Link Enviado'] = client.linkSent ? 'Sim' : 'Não';
      baseData['Entregue'] = client.isDelivered ? 'Sim' : 'Não';
    }

    baseData['Observações'] = client.notes || '';
    baseData['Criado em'] = formatDate(client.createdAt);

    return baseData;
  });

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Auto-size columns
  const colWidths = Object.keys(data[0] || {}).map(key => ({
    wch: Math.max(key.length, 15)
  }));
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'Clientes');

  // Generate filename
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  const defaultFilename = `clientes_${dateStr}.xlsx`;
  
  // Download file
  XLSX.writeFile(wb, filename || defaultFilename);
}
