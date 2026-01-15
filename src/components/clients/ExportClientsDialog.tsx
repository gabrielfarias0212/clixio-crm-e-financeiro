import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Download, FileSpreadsheet, CalendarIcon } from 'lucide-react';
import { Client, ClientStatus } from '@/utils/types';
import { ExportFilters, exportClientsToExcel, filterClientsForExport } from '@/utils/clientExporter';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ExportClientsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Client[];
}

const STATUS_OPTIONS: { value: ClientStatus; label: string }[] = [
  { value: 'primeiro_contato', label: 'Primeiro Contato' },
  { value: 'orçamento enviado', label: 'Orçamento Enviado' },
  { value: 'negociacao', label: 'Negociação' },
  { value: 'fechado', label: 'Fechado' },
  { value: 'projeto_finalizado', label: 'Projeto Finalizado' },
  { value: 'contrato_perdido', label: 'Contrato Perdido' },
];

export function ExportClientsDialog({ open, onOpenChange, clients }: ExportClientsDialogProps) {
  const [selectedStatuses, setSelectedStatuses] = useState<ClientStatus[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [includeContractDetails, setIncludeContractDetails] = useState(true);
  const [includePayments, setIncludePayments] = useState(true);
  const [includeWorkflowInfo, setIncludeWorkflowInfo] = useState(false);

  const filters: ExportFilters = useMemo(() => ({
    statuses: selectedStatuses,
    dateRange: {
      start: startDate || null,
      end: endDate || null,
    },
    includeContractDetails,
    includePayments,
    includeWorkflowInfo,
  }), [selectedStatuses, startDate, endDate, includeContractDetails, includePayments, includeWorkflowInfo]);

  const filteredCount = useMemo(() => {
    return filterClientsForExport(clients, filters).length;
  }, [clients, filters]);

  const handleStatusToggle = (status: ClientStatus) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleSelectAllStatuses = () => {
    if (selectedStatuses.length === STATUS_OPTIONS.length) {
      setSelectedStatuses([]);
    } else {
      setSelectedStatuses(STATUS_OPTIONS.map(s => s.value));
    }
  };

  const handleExport = () => {
    try {
      if (filteredCount === 0) {
        toast.error('Nenhum cliente encontrado com os filtros selecionados');
        return;
      }
      exportClientsToExcel(clients, filters);
      toast.success(`${filteredCount} clientes exportados com sucesso!`);
      onOpenChange(false);
    } catch (error) {
      console.error('Error exporting clients:', error);
      toast.error('Erro ao exportar clientes');
    }
  };

  const handleClearFilters = () => {
    setSelectedStatuses([]);
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Exportar Clientes
          </DialogTitle>
          <DialogDescription>
            Configure os filtros para exportar os clientes para uma planilha Excel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Filtrar por Status</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSelectAllStatuses}
                className="h-auto py-1 px-2 text-xs"
              >
                {selectedStatuses.length === STATUS_OPTIONS.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map(status => (
                <div key={status.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status.value}`}
                    checked={selectedStatuses.includes(status.value)}
                    onCheckedChange={() => handleStatusToggle(status.value)}
                  />
                  <Label 
                    htmlFor={`status-${status.value}`} 
                    className="text-sm cursor-pointer"
                  >
                    {status.label}
                  </Label>
                </div>
              ))}
            </div>
            {selectedStatuses.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Nenhum status selecionado = todos os status
              </p>
            )}
          </div>

          <Separator />

          {/* Date Range Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Filtrar por Data do Evento</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Data Inicial</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Data Final</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <Separator />

          {/* Include Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Dados a Incluir</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-contract"
                  checked={includeContractDetails}
                  onCheckedChange={(checked) => setIncludeContractDetails(!!checked)}
                />
                <Label htmlFor="include-contract" className="text-sm cursor-pointer">
                  Detalhes do Contrato (valor, entrada, saldo)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-payments"
                  checked={includePayments}
                  onCheckedChange={(checked) => setIncludePayments(!!checked)}
                />
                <Label htmlFor="include-payments" className="text-sm cursor-pointer">
                  Informações de Pagamento
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-workflow"
                  checked={includeWorkflowInfo}
                  onCheckedChange={(checked) => setIncludeWorkflowInfo(!!checked)}
                />
                <Label htmlFor="include-workflow" className="text-sm cursor-pointer">
                  Informações de Workflow
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Clientes a exportar:</span>
              <span className="text-lg font-bold text-primary">{filteredCount}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              de {clients.length} clientes totais
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleClearFilters}>
            Limpar Filtros
          </Button>
          <Button onClick={handleExport} disabled={filteredCount === 0}>
            <Download className="h-4 w-4 mr-2" />
            Exportar {filteredCount} {filteredCount === 1 ? 'Cliente' : 'Clientes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
