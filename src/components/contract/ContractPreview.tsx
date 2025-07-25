
import { useState, useEffect } from "react";
import { ContractFormData } from "@/types/contract";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Download, Copy, Check, Loader2 } from "lucide-react";
import { useContractTemplates } from "@/hooks/useContractTemplates";
import { generateContractPlaceholders, parseContractTemplate, generateContractPDF, copyContractToClipboard } from "@/utils/contractGenerator";
import { toast } from "sonner";

interface ContractPreviewProps {
  formData: ContractFormData;
  onBack: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export function ContractPreview({ formData, onBack, onConfirm, isLoading }: ContractPreviewProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [contractContent, setContractContent] = useState<string>("");
  const { data: templates } = useContractTemplates();

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = templates?.find(t => t.id === templateId);
    if (template) {
      const placeholders = generateContractPlaceholders(formData);
      const parsedContent = parseContractTemplate(template.content, placeholders);
      setContractContent(parsedContent);
    }
  };

  const handleDownloadPDF = () => {
    if (contractContent) {
      generateContractPDF(contractContent, `contrato-${formData.contractorName.replace(/\s+/g, '-')}.pdf`);
    }
  };

  const handleCopyContract = () => {
    if (contractContent) {
      copyContractToClipboard(contractContent);
      toast.success('Contrato copiado para a área de transferência!');
    }
  };

  // Selecionar template padrão automaticamente
  useEffect(() => {
    if (templates && templates.length > 0 && !selectedTemplateId) {
      const defaultTemplate = templates.find(t => t.is_default) || templates[0];
      handleTemplateChange(defaultTemplate.id);
    }
  }, [templates, selectedTemplateId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Formulário
        </Button>
        <h2 className="text-xl font-semibold">Preview do Contrato</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Contrato Gerado</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDownloadPDF}
                    disabled={!contractContent}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCopyContract}
                    disabled={!contractContent}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {contractContent ? (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                    {contractContent}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Selecione um template para visualizar o contrato
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Template</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template" />
                </SelectTrigger>
                <SelectContent>
                  {templates?.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                      {template.is_default && " (Padrão)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className="font-medium">Contratante:</div>
                <div className="text-gray-600">{formData.contractorName}</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Casal:</div>
                <div className="text-gray-600">{formData.coupleNames}</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Data:</div>
                <div className="text-gray-600">{new Date(formData.eventDate).toLocaleDateString('pt-BR')}</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Valor:</div>
                <div className="text-gray-600 font-medium">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(formData.totalPrice)}
                </div>
              </div>
              {formData.ceremonialTeam && (
                <div className="text-sm">
                  <div className="font-medium">Equipe Cerimonial:</div>
                  <div className="text-gray-600">{formData.ceremonialTeam}</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Finalizar</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={onConfirm}
                disabled={!contractContent || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Confirmar e Salvar
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
