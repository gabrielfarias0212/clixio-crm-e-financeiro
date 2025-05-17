
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Download } from "lucide-react";
import { ContractFormSubmission } from "@/utils/types";
import { formatDate } from "@/utils/dateUtils";
import { exportFormToExcel } from "@/utils/supabase/contract-form";

interface ContractDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractForm: ContractFormSubmission | null;
}

export function ContractDataDialog({ open, onOpenChange, contractForm }: ContractDataDialogProps) {
  const handleExportToExcel = () => {
    if (contractForm) {
      exportFormToExcel(contractForm);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
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
  );
}
