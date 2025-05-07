
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ImportOption, DuplicateDialogProps } from "./types";

export function DuplicateDialog({
  open,
  onOpenChange,
  duplicateCount,
  importOption,
  setImportOption,
  onConfirm,
}: DuplicateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Clientes Duplicados</DialogTitle>
          <DialogDescription>
            {duplicateCount} {duplicateCount === 1 ? 'cliente está' : 'clientes estão'} duplicados. Como você deseja proceder?
          </DialogDescription>
        </DialogHeader>
        
        <RadioGroup value={importOption} onValueChange={(value) => setImportOption(value as ImportOption)} className="gap-4">
          <div className="flex items-start space-x-3 space-y-0">
            <RadioGroupItem value="skip" id="skip" />
            <div className="grid gap-1.5">
              <Label htmlFor="skip" className="font-medium">Pular duplicados</Label>
              <p className="text-sm text-gray-500">
                Mantém os dados existentes e ignora os registros duplicados.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 space-y-0">
            <RadioGroupItem value="update" id="update" />
            <div className="grid gap-1.5">
              <Label htmlFor="update" className="font-medium">Atualizar existentes</Label>
              <p className="text-sm text-gray-500">
                Atualiza os registros existentes com os novos dados da planilha.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 space-y-0">
            <RadioGroupItem value="replace" id="replace" />
            <div className="grid gap-1.5">
              <Label htmlFor="replace" className="font-medium">Substituir tudo</Label>
              <p className="text-sm text-gray-500">
                Remove todos os registros existentes e importa apenas os novos.
              </p>
            </div>
          </div>
        </RadioGroup>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>
            Confirmar Importação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
