
import { useState, useEffect } from "react";
import { useContractTemplates } from "@/hooks/useContractTemplates";
import { useContractClauses } from "@/hooks/useContractClauses";
import { ContractFormData } from "@/types/contract";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Download, Copy } from "lucide-react";
import { generateContractPlaceholders, parseContractTemplate, generateContractPDF, copyContractToClipboard } from "@/utils/contractGenerator";
import { toast } from "sonner";

interface ContractPreviewProps {
  formData: ContractFormData;
  onBack: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ContractPreview({ formData, onBack, onConfirm, isLoading }: ContractPreviewProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [contractContent, setContractContent] = useState("");
  const [finalContract, setFinalContract] = useState("");
  
  const { data: templates } = useContractTemplates();
  const { data: clauses } = useContractClauses();

  // Selecionar template padrão automaticamente
  useEffect(() => {
    if (templates && templates.length > 0) {
      const defaultTemplate = templates.find(t => t.is_default) || templates[0];
      setSelectedTemplateId(defaultTemplate.id);
    }
  }, [templates]);

  // Gerar conteúdo do contrato quando template ou dados mudarem
  useEffect(() => {
    if (selectedTemplateId && templates) {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template) {
        // Combinar template com cláusulas
        let fullContent = template.content;
        
        if (clauses && clauses.length > 0) {
          const clausesText = clauses
            .sort((a, b) => a.clause_order - b.clause_order)
            .map(clause => `\n\n${clause.title}\n${clause.content}`)
            .join('');
          
          fullContent += clausesText;
        }
        
        setContractContent(fullContent);
      }
    }
  }, [selectedTemplateId, templates, clauses]);

  // Processar placeholders quando o conteúdo mudar
  useEffect(() => {
    if (contractContent) {
      const placeholders = generateContractPlaceholders(formData, 1);
      const parsedContent = parseContractTemplate(contractContent, placeholders);
      setFinalContract(parsedContent);
    }
  }, [contractContent, formData]);

  const handleDownloadPDF = () => {
    if (finalContract) {
      generateContractPDF(finalContract, `contrato-${formData.contractorName}.pdf`);
      toast.success('PDF gerado com sucesso!');
    }
  };

  const handleCopyText = () => {
    if (finalContract) {
      copyContractToClipboard(finalContract);
      toast.success('Contrato copiado para a área de transferência!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Baixar PDF
          </Button>
          <Button variant="outline" onClick={handleCopyText}>
            <Copy className="h-4 w-4 mr-2" />
            Copiar Texto
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pré-visualização do Contrato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Selecionar Template
            </label>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
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
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Conteúdo do Contrato
            </label>
            <Textarea
              value={finalContract}
              onChange={(e) => setFinalContract(e.target.value)}
              rows={20}
              className="font-mono text-sm"
              placeholder="O conteúdo do contrato aparecerá aqui..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onBack}>
              Voltar para Edição
            </Button>
            <Button onClick={onConfirm} disabled={isLoading || !finalContract}>
              {isLoading ? 'Salvando...' : 'Confirmar e Salvar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
