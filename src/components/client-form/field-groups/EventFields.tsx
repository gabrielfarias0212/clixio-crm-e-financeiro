import { Control } from "react-hook-form";
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
import { ClientFormValues } from "../types";
import { EVENT_CATEGORIES } from "../constants";
import { DatePicker } from "@/components/ui/date-picker";

interface EventFieldsProps {
  control: Control<ClientFormValues>;
}

export function EventFields({ control }: EventFieldsProps) {
  return (
    <>
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

      <FormField
        control={control}
        name="eventCategory"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categoria do Evento</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria do evento" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {EVENT_CATEGORIES.map((ec) => (
                  <SelectItem key={ec} value={ec}>
                    {ec.charAt(0).toUpperCase() + ec.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
