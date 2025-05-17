
import { Button } from "@/components/ui/button";
import { FileText, Download, ExternalLink } from "lucide-react";
import { ContractFormSubmission } from "@/utils/types";
import { exportFormToExcel } from "@/utils/supabase/contract-form";

interface FormActionsProps {
  contractForm: ContractFormSubmission;
  onViewData: () => void;
  onCopyLink: () => void;
}

export function FormActions({ contractForm, onViewData, onCopyLink }: FormActionsProps) {
  const handleExportToExcel = () => {
    exportFormToExcel(contractForm);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={onViewData}
      >
        <FileText className="h-4 w-4 mr-1" />
        Ver Dados
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleExportToExcel}
      >
        <Download className="h-4 w-4 mr-1" />
        Exportar Excel
      </Button>
      
      <Button 
        variant="outline"
        size="sm"
        onClick={onCopyLink}
      >
        <ExternalLink className="h-4 w-4 mr-1" />
        Copiar Link
      </Button>
    </div>
  );
}
