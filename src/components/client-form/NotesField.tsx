
import { Control } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { ClientFormValues } from "./types";

interface NotesFieldProps {
  control: Control<ClientFormValues>;
}

export function NotesField({ control }: NotesFieldProps) {
  return (
    <FormField
      control={control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Notas</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Informações adicionais sobre o cliente e o evento"
              className="min-h-[120px] resize-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-shadow"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
