
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImportWarningProps {
  duplicateCount: number;
}

export function ImportWarning({ duplicateCount }: ImportWarningProps) {
  if (!duplicateCount) return null;
  
  return (
    <Alert className="mb-4 bg-yellow-50 border-yellow-200">
      <AlertDescription className="text-yellow-700">
        <strong>Atenção:</strong> Existem {duplicateCount} registros com e-mail ou telefone já cadastrados.
      </AlertDescription>
    </Alert>
  );
}
