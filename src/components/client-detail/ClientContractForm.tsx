import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Client, ContractFormSubmission } from "@/utils/types";
import { FileText, Download, ExternalLink } from "lucide-react";
import { createContractFormForClient, getContractFormByClientId, exportFormToExcel } from "@/utils/supabase/contract-form";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDate } from "@/utils/dateUtils";

interface ClientContractFormProps {
  client: Client;
}

export function ClientContractForm({ client }: ClientContractFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [contractForm, setContractForm] = useState<ContractFormSubmission | null>(null);
  const [formLink, setFormLink] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const fetchContractForm = async () => {
    if (!client.id) return;
    
    try {
      setIsLoading(true);
      const form = await getContractFormByClientId(client.id);
      setContractForm(form);
      
      if (form?.accessToken) {
        const baseUrl = window.location.origin;
        setFormLink(`${baseUrl}/contract-form/${form.accessToken}`);
      }
    } catch (error) {
      console.error("Error fetching contract form:", error);
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
      setIsGeneratingLink(true);
      const token = await createContractFormForClient(client.id);
      
      if (token) {
        const baseUrl = window.location.origin;
        setFormLink(`${baseUrl}/contract-form/${token}`);
        toast.success("Link do formulário gerado com sucesso!");
        fetchContractForm();
      }
    } catch (error) {
      console.error("Error creating form link:", error);
      toast.error("Erro ao gerar link do formulário");
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const copyLinkToClipboard = () => {
    if (!formLink) return;
    
    navigator.clipboard.writeText(formLink)
      .then(() => toast.success("Link copiado para a área de transferência!"))
      .catch(() => toast.error("Erro ao copiar link"));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Preenchido</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Aprovado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const handleExportToExcel = () => {
    if (contractForm) {
      exportFormToExcel(contractForm);
    }
  };

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
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              {getStatusBadge(contractForm.formStatus)}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setOpenDialog(true)}
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
                onClick={copyLinkToClipboard}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Copiar Link
              </Button>
            </div>
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
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Ainda não há um formulário de contrato para este cliente. Gere um link para que o cliente possa preencher os dados.
          </p>
          <Button
            onClick={handleCreateFormLink}
            disabled={isGeneratingLink}
          >
            {isGeneratingLink ? "Gerando Link..." : "Gerar Link de Formulário"}
          </Button>
        </div>
      )}
      
      {/* Form Data Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dados do Formulário de Contrato</DialogTitle>
            <DialogDescription>
              Informações fornecidas pelo cliente para o contrato
            </DialogDescription>
          </DialogHeader>
          
          {contractForm && contractForm.formStatus !== 'pending' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="font-medium border-b pb-2">Dados do Contratante</h4>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nome da Noiva</p>
                    <p>{contractForm.brideName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nome do Noivo</p>
                    <p>{contractForm.groomName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">RG da Contratante</p>
                    <p>{contractForm.brideId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">CPF da Contratante</p>
                    <p>{contractForm.brideCpf}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Telefone para Contato</p>
                    <p>{contractForm.contactPhone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">E-mail</p>
                    <p>{contractForm.contactEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Endereço Completo</p>
                    <p>{contractForm.completeAddress}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium border-b pb-2">Dados do Evento</h4>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Data do Evento</p>
                    <p>{formatDate(contractForm.eventDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Horário Previsto</p>
                    <p>{contractForm.eventTime}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Local do Evento</p>
                    <p>{contractForm.eventLocation}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Endereço do Evento</p>
                    <p>{contractForm.eventAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pacote Contratado</p>
                    <p>{contractForm.contractedPackage}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Equipe de Cerimonial</p>
                    <p>{contractForm.ceremonialTeam || "Não informado"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Exclusividade</p>
                    <p>{contractForm.hasExclusivity ? "Sim" : "Não"}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium border-b pb-2">Dados Financeiros</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Valor Total</p>
                    <p>R$ {contractForm.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Forma de Pagamento</p>
                    <p>{contractForm.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Parcelamento</p>
                    <p>{contractForm.installmentsInfo || "Não parcelado"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Data Pagamento Final</p>
                    <p>{contractForm.finalPaymentDate ? formatDate(contractForm.finalPaymentDate) : "Não informado"}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium border-b pb-2">Observações Adicionais</h4>
                <div className="space-y-4 mt-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Observações Gerais</p>
                    <p className="whitespace-pre-line">{contractForm.observations || "Nenhuma observação"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Autoriza uso para portfólio?</p>
                    <p>{contractForm.allowsPortfolioUsage ? "Sim" : "Não"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Aceitou termos e condições</p>
                    <p>{contractForm.acceptsTerms ? "Sim" : "Não"}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-gray-500">O formulário ainda não foi preenchido pelo cliente.</p>
            </div>
          )}
          
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Fechar
            </Button>
            {contractForm && contractForm.formStatus !== 'pending' && (
              <Button onClick={handleExportToExcel}>
                <Download className="h-4 w-4 mr-2" />
                Exportar para Excel
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
