
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type ImportOption = 'skip' | 'replace' | 'keep';

interface DuplicateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  duplicateCount: number;
  importOption: ImportOption;
  setImportOption: (option: ImportOption) => void;
  onConfirm: () => void;
}

export function DuplicateDialog({ 
  open, 
  onOpenChange, 
  duplicateCount, 
  importOption, 
  setImportOption, 
  onConfirm 
}: DuplicateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clientes duplicados encontrados</DialogTitle>
          <DialogDescription>
            Existem {duplicateCount} registros com e-mail ou telefone já cadastrados.
            Como você deseja proceder?
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-2 my-4">
          <Button 
            variant={importOption === 'skip' ? "default" : "outline"} 
            onClick={() => setImportOption('skip')}
            className="justify-start"
          >
            Ignorar registros duplicados
          </Button>
          <Button 
            variant={importOption === 'replace' ? "default" : "outline"} 
            onClick={() => setImportOption('replace')}
            className="justify-start"
          >
            Substituir dados existentes
          </Button>
          <Button 
            variant={importOption === 'keep' ? "default" : "outline"} 
            onClick={() => setImportOption('keep')}
            className="justify-start"
          >
            Manter ambos (criar novos registros)
          </Button>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => {
            onOpenChange(false);
            onConfirm();
          }}>
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
