import { Control } from "react-hook-form";
import { ClientFormValues } from "../types";
import {
  FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form";
import { CategorySelect } from "@/components/ui/CategorySelect";

interface EventCategoryFieldProps {
  control: Control<ClientFormValues>;
}

export function EventCategoryField({ control }: EventCategoryFieldProps) {
  return (
    <FormField
      control={control}
      name="eventCategory"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Categoria do Evento</FormLabel>
          <FormControl>
            <CategorySelect value={field.value} onChange={field.onChange} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
