
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface CreateFormSectionProps {
  error: string | null;
  onCreateForm: () => Promise<void>;
}

export function CreateFormSection({ error, onCreateForm }: CreateFormSectionProps) {
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  
  const handleCreateFormLink = async () => {
    setIsGeneratingLink(true);
    await onCreateForm();
    setIsGeneratingLink(false);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Ainda não há um formulário de contrato para este cliente. Gere um link para que o cliente possa preencher os dados.
      </p>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Button
        onClick={handleCreateFormLink}
        disabled={isGeneratingLink}
      >
        {isGeneratingLink ? (
          <span className="flex items-center">
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
            Gerando Link...
          </span>
        ) : "Gerar Link de Formulário"}
      </Button>
    </div>
  );
}
