
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface ImportSummaryProps {
  total: number;
  added: number;
  updated: number;
  skipped: number;
  errors: number;
}

export function ImportSummary({ total, added, updated, skipped, errors }: ImportSummaryProps) {
  if (!total) return null;
  
  return (
    <Alert className="mb-4 bg-green-50 border-green-200">
      <AlertDescription className="text-green-700">
        <strong>Importação concluída!</strong>
        <ul className="mt-1">
          <li>Total de registros: {total}</li>
          <li>Clientes adicionados: {added}</li>
          {updated > 0 && <li>Clientes atualizados: {updated}</li>}
          {skipped > 0 && <li>Clientes ignorados: {skipped}</li>}
          {errors > 0 && <li>Erros: {errors}</li>}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
