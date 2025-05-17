
import React from "react";
import { Client } from "@/utils/types";
import { FileText } from "lucide-react";
import { ContractDataDialog } from "./contract-form/ContractDataDialog";
import { FormHeaderInfo } from "./contract-form/FormHeaderInfo";
import { CreateFormSection } from "./contract-form/CreateFormSection";
import { useContractForm } from "./contract-form/useContractForm";

interface ClientContractFormProps {
  client: Client;
}

export function ClientContractForm({ client }: ClientContractFormProps) {
  const {
    isLoading,
    contractForm,
    formLink,
    openDialog,
    error,
    setOpenDialog,
    handleCreateFormLink,
    copyLinkToClipboard
  } = useContractForm(client);

  return (
    <div className="border rounded-lg p-4 mb-6">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <FileText className="h-5 w-5 mr-2" />
        Formulário de Contrato
      </h3>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        </div>
      ) : contractForm ? (
        <FormHeaderInfo 
          contractForm={contractForm} 
          formLink={formLink}
          onViewData={() => setOpenDialog(true)}
          onCopyLink={copyLinkToClipboard}
        />
      ) : (
        <CreateFormSection 
          error={error}
          onCreateForm={handleCreateFormLink}
        />
      )}
      
      <ContractDataDialog 
        open={openDialog} 
        onOpenChange={setOpenDialog} 
        contractForm={contractForm}
      />
    </div>
  );
}
