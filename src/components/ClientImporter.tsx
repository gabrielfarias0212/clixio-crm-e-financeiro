
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ImportSummary } from "./client-importer/ImportSummary";
import { ImportWarning } from "./client-importer/ImportWarning";
import { ImportTable } from "./client-importer/ImportTable";
import { DuplicateDialog } from "./client-importer/DuplicateDialog";
import { useClientImporter } from "./client-importer/useClientImporter";
import { ImportOption } from "./client-importer/types";
import { Loader2 } from "lucide-react";

interface ClientImporterProps {
  data: any[];
  fileName: string;
  onReset: () => void;
}

export function ClientImporter({ data, fileName, onReset }: ClientImporterProps) {
  const navigate = useNavigate();
  
  // Extrair as colunas dos dados
  const columns = Object.keys(data[0] || {});
  
  const { 
    importing,
    summary,
    duplicateCount,
    importOption,
    showConfirmDialog,
    setImportOption,
    setShowConfirmDialog,
    handleStartImport,
    startImport
  } = useClientImporter(data);

  const finishImport = () => {
    console.log("Finishing import, navigating to /clients");
    navigate("/clients");
  };

  return (
    <div>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h3 className="font-medium text-lg">Prévia da importação</h3>
          <p className="text-gray-500">
            Arquivo: {fileName} ({data.length} registros)
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onReset}
            disabled={importing}
            type="button"
          >
            Cancelar
          </Button>
          
          <Button 
            onClick={handleStartImport}
            disabled={importing || data.length === 0}
            type="button"
            className="relative"
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importando...
              </>
            ) : (
              "Confirmar Importação"
            )}
          </Button>
        </div>
      </div>
      
      <ImportWarning duplicateCount={duplicateCount} />
      
      {summary && (
        <ImportSummary 
          total={summary.total} 
          added={summary.added}
          updated={summary.updated}
          skipped={summary.skipped}
          errors={summary.errors}
        />
      )}
      
      <ImportTable data={data} columns={columns} />
      
      {summary && (
        <div className="mt-6 flex justify-end">
          <Button onClick={finishImport} type="button">
            Voltar para Lista de Clientes
          </Button>
        </div>
      )}
      
      <DuplicateDialog 
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        duplicateCount={duplicateCount}
        importOption={importOption}
        setImportOption={setImportOption}
        onConfirm={startImport}
      />
    </div>
  );
}
