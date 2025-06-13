
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePersonalCategories } from "@/hooks/usePersonalCategories";

interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCategoryDialog({ open, onOpenChange }: CreateCategoryDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'entrada' | 'saida' | ''>('');
  const [loading, setLoading] = useState(false);
  
  const { addCategory } = usePersonalCategories();

  const handleSubmit = async () => {
    if (!name.trim() || !type) return;

    setLoading(true);
    const success = await addCategory(name.trim(), type as 'entrada' | 'saida');
    
    if (success) {
      setName('');
      setType('');
      onOpenChange(false);
    }
    
    setLoading(false);
  };

  const handleClose = () => {
    setName('');
    setType('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Categoria</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="categoryName">Nome da Categoria</Label>
            <Input
              id="categoryName"
              placeholder="Ex: Freelances, Equipamentos, etc."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="categoryType">Tipo</Label>
            <Select value={type} onValueChange={(value) => setType(value as 'entrada' | 'saida' | '')}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="saida">Saída</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!name.trim() || !type || loading}
            >
              {loading ? 'Criando...' : 'Criar Categoria'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
