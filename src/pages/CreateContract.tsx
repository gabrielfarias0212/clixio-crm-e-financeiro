
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileContract } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContractForm } from "@/components/contract/ContractForm";
import { ContractPreview } from "@/components/contract/ContractPreview";
import { useCreateContract } from "@/hooks/useContracts";
import { ContractFormData } from "@/types/contract";

export default function CreateContract() {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState<ContractFormData | null>(null);
  const createContract = useCreateContract();

  const handleFormSubmit = (data: ContractFormData) => {
    setFormData(data);
    setShowPreview(true);
  };

  const handleConfirmContract = async () => {
    if (formData) {
      await createContract.mutateAsync(formData);
      navigate('/contracts');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/contracts')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex items-center gap-2">
          <FileContract className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Novo Contrato</h1>
        </div>
      </div>

      {!showPreview ? (
        <ContractForm onSubmit={handleFormSubmit} />
      ) : (
        <ContractPreview 
          formData={formData!}
          onBack={() => setShowPreview(false)}
          onConfirm={handleConfirmContract}
          isLoading={createContract.isPending}
        />
      )}
    </div>
  );
}
