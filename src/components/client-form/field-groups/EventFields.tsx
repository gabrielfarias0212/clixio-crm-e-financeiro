
import { Control } from "react-hook-form";
import { ClientFormValues } from "../types";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { DatePicker } from "@/components/ui/date-picker";
import { EventCategoryField } from "./EventCategoryField";

interface EventFieldsProps {
  control: Control<ClientFormValues>;
}

export function EventFields({ control }: EventFieldsProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Informações do Evento</h3>
      
      <EventCategoryField control={control} />
      
      <FormField
        control={control}
        name="weddingDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data do Evento</FormLabel>
            <FormControl>
              <DatePicker
                value={field.value ? new Date(field.value) : null}
                onChange={field.onChange}
                placeholder="Selecione uma data"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
