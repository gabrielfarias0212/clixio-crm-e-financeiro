
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  isEditing: boolean;
}

export function FormActions({ isSubmitting, onCancel, isEditing }: FormActionsProps) {
  return (
    <div className="flex gap-3 justify-end">
      <Button 
        type="button" 
        variant="outline"
        onClick={onCancel}
      >
        Cancelar
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting}
      >
        {isSubmitting ? "Enviando..." : (isEditing ? "Atualizar Cliente" : "Adicionar Cliente")}
      </Button>
    </div>
  );
}
