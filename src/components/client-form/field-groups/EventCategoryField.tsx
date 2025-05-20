
import { Control } from "react-hook-form";
import { ClientFormValues } from "../types";
import { EventCategory } from "@/utils/types";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EVENT_CATEGORIES } from "../constants";

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
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {EVENT_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
