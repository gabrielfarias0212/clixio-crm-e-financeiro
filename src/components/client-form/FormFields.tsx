
import { Control } from "react-hook-form";
import { ContactFields } from "./field-groups/ContactFields";
import { EventFields } from "./field-groups/EventFields";
import { PaymentFields } from "./field-groups/PaymentFields";
import { StatusFields } from "./field-groups/StatusFields";
import { EventCategoryField } from "./field-groups/EventCategoryField";
import { ClientFormValues } from "./types";

interface FormFieldsProps {
  control: Control<ClientFormValues>;
  watchStatus: string;
  watchHasPreWedding: boolean;
  clientId?: string;
}

export function FormFields({ control, watchStatus, watchHasPreWedding, clientId }: FormFieldsProps) {
  const isEditingExistingClient = Boolean(clientId);
  
  return (
    <>
      {/* Informações de Contato */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ContactFields control={control} />
      </div>

      {/* Categoria do Evento */}
      <EventCategoryField control={control} />

      {/* Informações do Evento */}
      <EventFields 
        control={control} 
        watchHasPreWedding={watchHasPreWedding}
      />

      {/* Informações Financeiras */}
      <PaymentFields control={control} />

      {/* Status e Próxima Ação - com automação para clientes existentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatusFields 
          control={control} 
          showAutomation={isEditingExistingClient} 
        />
      </div>
    </>
  );
}
