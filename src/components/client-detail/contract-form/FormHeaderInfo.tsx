
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDate } from "@/utils/dateUtils";
import { FormStatusBadge } from "./FormStatusBadge";
import { ContractFormSubmission } from "@/utils/types";
import { FormActions } from "./FormActions";

interface FormHeaderInfoProps {
  contractForm: ContractFormSubmission;
  formLink: string | null;
  onViewData: () => void;
  onCopyLink: () => void;
}

export function FormHeaderInfo({ contractForm, formLink, onViewData, onCopyLink }: FormHeaderInfoProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">Status:</span>
          <FormStatusBadge status={contractForm.formStatus} />
        </div>
        <FormActions 
          contractForm={contractForm} 
          onViewData={onViewData} 
          onCopyLink={onCopyLink} 
        />
      </div>
      
      {formLink && (
        <Alert>
          <AlertDescription className="text-sm break-all">
            {formLink}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="text-sm text-gray-500">
        <span>Criado em: {formatDate(contractForm.createdAt)}</span>
        {contractForm.formStatus === 'completed' && (
          <span className="ml-4">Preenchido em: {formatDate(contractForm.updatedAt)}</span>
        )}
      </div>
    </div>
  );
}
