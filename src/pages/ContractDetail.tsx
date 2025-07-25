
import { useParams, useNavigate } from "react-router-dom";
import { useContract } from "@/hooks/useContracts";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileContract, Download, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generateContractPDF, copyContractToClipboard } from "@/utils/contractGenerator";
import { toast } from "sonner";

export default function ContractDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: contract, isLoading } = useContract(id!);

  if (isLoading) {
    return <div className="container mx-auto p-6">Carregando...</div>;
  }

  if (!contract) {
    return <div className="container mx-auto p-6">Contrato não encontrado</div>;
  }

  const handleDownloadPDF = () => {
    if (contract.contract_content) {
      generateContractPDF(contract.contract_content, `contrato-${contract.id}.pdf`);
    }
  };

  const handleCopyContract = () => {
    if (contract.contract_content) {
      copyContractToClipboard(contract.contract_content);
      toast.success('Contrato copiado para a área de transferência!');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'signed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-2xl font-bold">Detalhes do Contrato</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Informações do Contrato</CardTitle>
                <Badge className={getStatusColor(contract.status)}>
                  {contract.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Contratante</label>
                  <p className="text-sm">{contract.contractor_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Casal</label>
                  <p className="text-sm">{contract.couple_names}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Data do Evento</label>
                  <p className="text-sm">{new Date(contract.data_evento).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Valor</label>
                  <p className="text-sm">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contract.amount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">E-mail</label>
                  <p className="text-sm">{contract.contractor_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Telefone</label>
                  <p className="text-sm">{contract.contractor_phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full" 
                onClick={handleDownloadPDF}
                disabled={!contract.contract_content}
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar PDF
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleCopyContract}
                disabled={!contract.contract_content}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar Texto
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
