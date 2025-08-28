import React from "react";
import { Control } from "react-hook-form";
import { ClientFormValues } from "./types";
import { ContactFields } from "./field-groups/ContactFields";
import { EventFields } from "./field-groups/EventFields";
import { PaymentFields } from "./field-groups/PaymentFields";
import { StatusFields } from "./field-groups/StatusFields";
import { EventCategoryField } from "./field-groups/EventCategoryField";
import { isLeadStage } from "./quickLeadTypes";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface ConditionalFormFieldsProps {
  control: Control<ClientFormValues>;
  watchStatus: string;
  watchHasPreWedding?: boolean;
  clientId?: string;
  isLeadForm?: boolean;
}

export function ConditionalFormFields({ 
  control, 
  watchStatus, 
  watchHasPreWedding = true, 
  clientId,
  isLeadForm = false
}: ConditionalFormFieldsProps) {
  const isLead = isLeadForm || isLeadStage(watchStatus);

  return (
    <div className="space-y-6">
      {/* Status Information Alert */}
      {isLead && (
        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <InfoIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <strong>Modo Lead:</strong> Apenas campos essenciais são exibidos. 
            Para acessar todos os campos, altere o status para "Orçamento Enviado" ou superior.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Fields - Always visible */}
        <div className="space-y-6">
          <div className="pb-4 border-b border-border">
            <h3 className="font-medium text-lg text-foreground mb-1">Informações de Contato</h3>
            <p className="text-sm text-muted-foreground">Dados básicos do cliente</p>
          </div>
          <ContactFields control={control} />
        </div>

        {/* Status Fields - Always visible */}
        <div className="space-y-6">
          <div className="pb-4 border-b border-border">
            <h3 className="font-medium text-lg text-foreground mb-1">Status</h3>
            <p className="text-sm text-muted-foreground">Situação atual do cliente</p>
          </div>
          <StatusFields control={control} />
          
          {/* Event Category - Always visible */}
          <EventCategoryField control={control} />
        </div>

        {/* Expanded fields - Only show when not in lead stage */}
        {!isLead && (
          <>
            <div className="md:col-span-2 space-y-6">
              <div className="pb-4 border-b border-border">
                <h3 className="font-medium text-lg text-foreground mb-1">Detalhes do Evento</h3>
                <p className="text-sm text-muted-foreground">Informações completas do evento</p>
              </div>
              <EventFields 
                control={control} 
                watchHasPreWedding={watchHasPreWedding} 
                clientId={clientId}
              />
            </div>

            <div className="md:col-span-2 space-y-6">
              <div className="pb-4 border-b border-border">
                <h3 className="font-medium text-lg text-foreground mb-1">Informações Financeiras</h3>
                <p className="text-sm text-muted-foreground">Valores e pagamentos do contrato</p>
              </div>
              <PaymentFields control={control} watchStatus={watchStatus} />
            </div>
          </>
        )}

        {/* Lead conversion notice */}
        {isLead && (
          <div className="md:col-span-2">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">📈 Expandir para Cliente Completo</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Para acessar campos de evento, pagamento e outras informações detalhadas, 
                altere o status do lead para "Orçamento Enviado" ou superior.
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>• <strong>Orçamento Enviado:</strong> Libera campos de evento e valores</div>
                <div>• <strong>Negociação:</strong> Acesso completo a todos os campos</div>
                <div>• <strong>Fechado:</strong> Cliente convertido com acesso total</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}