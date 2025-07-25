
import { useState } from "react";
import { useContracts } from "@/hooks/useContracts";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ContractList } from "@/components/contract/ContractList";
import { ContractTemplatesDialog } from "@/components/contract/ContractTemplatesDialog";

export default function Contracts() {
  const { data: contracts, isLoading } = useContracts();
  const navigate = useNavigate();
  const [templatesDialogOpen, setTemplatesDialogOpen] = useState(false);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Gerador de Contratos</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setTemplatesDialogOpen(true)}
          >
            Gerenciar Templates
          </Button>
          <Button onClick={() => navigate('/contracts/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Contrato
          </Button>
        </div>
      </div>

      <ContractList contracts={contracts || []} isLoading={isLoading} />

      <ContractTemplatesDialog 
        open={templatesDialogOpen}
        onOpenChange={setTemplatesDialogOpen}
      />
    </div>
  );
}
