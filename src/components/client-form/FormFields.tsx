
import { Control } from "react-hook-form";
import { ClientFormValues } from "./types";
import { ContactFields } from "./field-groups/ContactFields";
import { EventFields } from "./field-groups/EventFields";
import { PaymentFields } from "./field-groups/PaymentFields";
import { StatusFields } from "./field-groups/StatusFields";
import { Client } from "@/utils/types";

interface FormFieldsProps {
  control: Control<ClientFormValues>;
  watchStatus: string;
  watchHasPreWedding: boolean;
  client?: Client;
}

export function FormFields({ control, watchStatus, watchHasPreWedding, client }: FormFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ContactFields control={control} />
      <EventFields control={control} watchHasPreWedding={watchHasPreWedding} client={client} />
      <PaymentFields control={control} watchStatus={watchStatus} />
      <StatusFields control={control} />
    </div>
  );
}
