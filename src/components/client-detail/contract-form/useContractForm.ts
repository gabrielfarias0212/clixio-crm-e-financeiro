
import { useState, useEffect } from "react";
import { Client, ContractFormSubmission } from "@/utils/types";
import { toast } from "sonner";
import { createContractFormForClient, getContractFormByClientId } from "@/utils/supabase/contract-form";

export function useContractForm(client: Client) {
  const [isLoading, setIsLoading] = useState(false);
  const [contractForm, setContractForm] = useState<ContractFormSubmission | null>(null);
  const [formLink, setFormLink] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContractForm = async () => {
    if (!client.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const form = await getContractFormByClientId(client.id);
      setContractForm(form);
      
      if (form?.accessToken) {
        const baseUrl = window.location.origin;
        setFormLink(`${baseUrl}/contract-form/${form.accessToken}`);
      }
    } catch (error) {
      console.error("Error fetching contract form:", error);
      setError("Erro ao buscar formulário de contrato");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContractForm();
  }, [client.id]);

  const handleCreateFormLink = async () => {
    if (!client.id) return;
    
    try {
      setError(null);
      
      const token = await createContractFormForClient(client.id);
      
      if (token) {
        const baseUrl = window.location.origin;
        setFormLink(`${baseUrl}/contract-form/${token}`);
        toast.success("Link do formulário gerado com sucesso!");
        fetchContractForm();
      } else {
        setError("Não foi possível gerar o link do formulário");
      }
    } catch (error) {
      console.error("Error creating form link:", error);
      setError("Erro ao gerar link do formulário");
      toast.error("Erro ao gerar link do formulário");
    }
  };

  const copyLinkToClipboard = () => {
    if (!formLink) return;
    
    navigator.clipboard.writeText(formLink)
      .then(() => toast.success("Link copiado para a área de transferência!"))
      .catch(() => toast.error("Erro ao copiar link"));
  };

  return {
    isLoading,
    contractForm,
    formLink,
    openDialog,
    error,
    setOpenDialog,
    handleCreateFormLink,
    copyLinkToClipboard,
    fetchContractForm
  };
}
