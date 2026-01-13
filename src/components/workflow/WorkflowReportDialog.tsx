import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FileText, Download, Loader2 } from "lucide-react";
import { Client, WorkflowStage } from "@/utils/types";
import { downloadWorkflowReport } from "@/utils/workflowReportGenerator";
import { toast } from "sonner";

interface WorkflowReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Client[];
  companyName?: string;
}

const workflowStages: { id: WorkflowStage; label: string }[] = [
  { id: 'evento_ensaio', label: 'Evento/Ensaio' },
  { id: 'copia', label: 'Cópia' },
  { id: 'backup', label: 'Backup' },
  { id: 'curadoria', label: 'Curadoria' },
  { id: 'edicao', label: 'Edição' },
  { id: 'link_pronto', label: 'Link Pronto' },
  { id: 'link_enviado', label: 'Link Enviado' },
  { id: 'entrega_fisica', label: 'Entrega Física' },
  { id: 'projeto_finalizado', label: 'Finalizado' },
];

export function WorkflowReportDialog({ 
  open, 
  onOpenChange, 
  clients,
  companyName 
}: WorkflowReportDialogProps) {
  const [selectedStages, setSelectedStages] = useState<WorkflowStage[]>([
    'copia', 'backup', 'curadoria', 'edicao', 'link_pronto', 'link_enviado', 'entrega_fisica'
  ]);
  const [sortByPriority, setSortByPriority] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleStageToggle = (stageId: WorkflowStage) => {
    setSelectedStages(prev => 
      prev.includes(stageId)
        ? prev.filter(s => s !== stageId)
        : [...prev, stageId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStages.length === workflowStages.length) {
      setSelectedStages([]);
    } else {
      setSelectedStages(workflowStages.map(s => s.id));
    }
  };

  const handleSelectPending = () => {
    setSelectedStages([
      'copia', 'backup', 'curadoria', 'edicao', 'link_pronto', 'link_enviado', 'entrega_fisica'
    ]);
  };

  const handleGenerateReport = async () => {
    if (selectedStages.length === 0) {
      toast.error("Selecione pelo menos uma etapa para o relatório");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Pequeno delay para feedback visual
      await new Promise(resolve => setTimeout(resolve, 300));
      
      downloadWorkflowReport(clients, {
        stages: selectedStages,
        sortByPriority,
        companyName
      });
      
      toast.success("Relatório gerado com sucesso!");
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      toast.error("Erro ao gerar o relatório. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Contar projetos por estágio selecionado
  const getStageCount = (stageId: WorkflowStage) => {
    return clients.filter(client => {
      const clientStage = client.workflowStage || 
        (client.status === 'projeto_finalizado' ? 'projeto_finalizado' :
         client.boxDelivered || client.albumApprovedDelivered ? 'entrega_fisica' :
         client.linkSent ? 'link_enviado' :
         client.linkReady ? 'link_pronto' :
         client.inEditing ? 'edicao' :
         client.curationCompleted ? 'curadoria' :
         client.backupCompleted ? 'backup' :
         client.weddingPhotographed ? 'copia' : 'evento_ensaio');
      return clientStage === stageId;
    }).length;
  };

  const totalSelected = selectedStages.reduce((acc, stage) => acc + getStageCount(stage), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gerar Relatório de Workflow
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Seleção de Etapas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Etapas do Workflow</Label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSelectAll}
                  className="text-xs h-7"
                >
                  {selectedStages.length === workflowStages.length ? 'Limpar' : 'Todas'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSelectPending}
                  className="text-xs h-7"
                >
                  Pendentes
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
              {workflowStages.map(stage => {
                const count = getStageCount(stage.id);
                return (
                  <div 
                    key={stage.id}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={stage.id}
                      checked={selectedStages.includes(stage.id)}
                      onCheckedChange={() => handleStageToggle(stage.id)}
                    />
                    <Label 
                      htmlFor={stage.id} 
                      className="text-sm cursor-pointer flex-1 flex items-center justify-between"
                    >
                      <span>{stage.label}</span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({count})
                      </span>
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Opções */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="priority" className="text-sm font-medium">
                  Ordenar por Prioridade
                </Label>
                <p className="text-xs text-muted-foreground">
                  Projetos mais antigos aparecem primeiro
                </p>
              </div>
              <Switch
                id="priority"
                checked={sortByPriority}
                onCheckedChange={setSortByPriority}
              />
            </div>
          </div>

          {/* Resumo */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <p className="text-sm font-medium">
              Resumo do Relatório
            </p>
            <p className="text-xs text-muted-foreground">
              {selectedStages.length} etapa(s) selecionada(s)
            </p>
            <p className="text-xs text-muted-foreground">
              {totalSelected} projeto(s) serão incluídos
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleGenerateReport}
            disabled={isGenerating || selectedStages.length === 0}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Gerar PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
