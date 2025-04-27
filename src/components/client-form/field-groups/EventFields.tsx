
import { Control } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { ClientFormValues } from "../types";
import { DatePicker } from "@/components/ui/date-picker";

interface EventFieldsProps {
  control: Control<ClientFormValues>;
}

export function EventFields({ control }: EventFieldsProps) {
  return (
    <FormField
      control={control}
      name="weddingDate"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Data do Evento</FormLabel>
          <DatePicker
            value={field.value}
            onChange={field.onChange}
            placeholder="Selecione uma data"
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
