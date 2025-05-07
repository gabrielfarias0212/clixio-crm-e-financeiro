
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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
        disabled={isSubmitting}
      >
        Cancelar
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className={isSubmitting ? "opacity-70 cursor-not-allowed" : ""}
      >
        {isSubmitting ? (
          <span className="flex items-center">
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
            Enviando...
          </span>
        ) : (isEditing ? "Atualizar Cliente" : "Adicionar Cliente")}
      </Button>
    </div>
  );
}
