
import { Button } from "@/components/ui/button";

interface ImportControlsProps {
  onImport: () => void;
  isLoading: boolean;
  isDisabled: boolean;
}

export function ImportControls({ onImport, isLoading, isDisabled }: ImportControlsProps) {
  return (
    <div className="flex justify-end">
      <Button 
        onClick={onImport} 
        disabled={isLoading || isDisabled}
      >
        {isLoading ? "Importando..." : "Importar Clientes"}
      </Button>
    </div>
  );
}
