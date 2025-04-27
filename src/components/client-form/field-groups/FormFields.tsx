
import { Control } from "react-hook-form";
import { ClientFormValues } from "../types";
import { ContactFields } from "./ContactFields";
import { EventFields } from "./EventFields";
import { PaymentFields } from "./PaymentFields";
import { StatusFields } from "./StatusFields";
import { EventCategoryField } from "./EventCategoryField";

interface FormFieldsProps {
  control: Control<ClientFormValues>;
  watchStatus: string;
}

export function FormFields({ control, watchStatus }: FormFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ContactFields control={control} />
      <div className="space-y-6">
        <EventCategoryField control={control} />
        <EventFields control={control} />
      </div>
      <PaymentFields control={control} watchStatus={watchStatus} />
      <StatusFields control={control} />
    </div>
  );
}
